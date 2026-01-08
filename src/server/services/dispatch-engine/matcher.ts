/**
 * Appraiser Matcher
 * Finds and ranks available appraisers for jobs
 */

import { prisma } from "@/server/db/prisma";
import type {
  Job,
  Property,
  AppraiserProfile,
  User,
  AppraiserLicenseType,
  JobType,
} from "@prisma/client";
import { geofencing } from "./geofencing";
import type { MatchedAppraiser, DispatchOptions } from "./index";

/**
 * License types that can perform CERTIFIED_APPRAISAL jobs
 * Only CERTIFIED_RESIDENTIAL and CERTIFIED_GENERAL appraisers can sign USPAP-compliant appraisals
 */
const CERTIFIED_ELIGIBLE_LICENSES: AppraiserLicenseType[] = [
  "CERTIFIED_RESIDENTIAL",
  "CERTIFIED_GENERAL",
];

/**
 * Check if an appraiser's license type is eligible for a specific job type
 */
function isLicenseEligibleForJob(
  licenseType: AppraiserLicenseType,
  jobType: JobType,
): boolean {
  // For CERTIFIED_APPRAISAL jobs, only certified appraisers can do the work
  if (jobType === "CERTIFIED_APPRAISAL") {
    return CERTIFIED_ELIGIBLE_LICENSES.includes(licenseType);
  }

  // For ONSITE_PHOTOS (On-Site Verification), any licensed appraiser can do it
  // This includes TRAINEE (under supervision), LICENSED, CERTIFIED_RESIDENTIAL, CERTIFIED_GENERAL
  return true;
}

/**
 * Matcher configuration
 */
const MATCHER_CONFIG = {
  defaultRadius: 25, // miles
  maxRadius: 50,
  minRating: 3.5,
  maxResults: 10,
  weights: {
    distance: 0.3,
    rating: 0.25,
    completionRate: 0.2,
    availability: 0.15,
    experience: 0.1,
  },
};

type JobWithProperty = Job & { property: Property };

/**
 * Appraiser matcher class
 */
class AppraiserMatcher {
  /**
   * Find matching appraisers for a job
   */
  async findMatches(
    job: JobWithProperty,
    options: DispatchOptions = {},
  ): Promise<MatchedAppraiser[]> {
    const radius = options.maxRadius || MATCHER_CONFIG.defaultRadius;

    // Get all verified appraisers
    const appraisers = await prisma.appraiserProfile.findMany({
      where: {
        verificationStatus: "VERIFIED",
        userId: options.excludeAppraisers
          ? { notIn: options.excludeAppraisers }
          : undefined,
      },
      include: {
        user: true,
      },
    });

    // Filter by distance and availability
    const candidates: MatchedAppraiser[] = [];

    for (const appraiser of appraisers) {
      // Check distance
      const distance = await geofencing.calculateDistance(
        {
          lat: job.property.latitude!,
          lng: job.property.longitude!,
        },
        {
          lat: appraiser.homeBaseLat || 0,
          lng: appraiser.homeBaseLng || 0,
        },
      );

      if (distance > radius) continue;

      // Check if within service area
      const inServiceArea = await geofencing.isWithinServiceArea(
        {
          lat: job.property.latitude!,
          lng: job.property.longitude!,
        },
        appraiser,
      );

      if (!inServiceArea) continue;

      // Check license eligibility for job type
      // CERTIFIED_APPRAISAL requires CERTIFIED_RESIDENTIAL or CERTIFIED_GENERAL license
      // ONSITE_PHOTOS can be done by any licensed appraiser
      if (!isLicenseEligibleForJob(appraiser.licenseType, job.jobType))
        continue;

      // Check if license is expired
      if (appraiser.licenseExpiry) {
        const expirationDate = new Date(appraiser.licenseExpiry);
        if (expirationDate < new Date()) {
          // License is expired, skip this appraiser
          continue;
        }
      }

      // Check availability (pass profile to avoid N+1 query)
      const isAvailable = await this.checkAvailability(appraiser.userId, job, {
        preferredSchedule: appraiser.preferredSchedule,
      });
      if (!isAvailable) continue;

      // Calculate score
      const score = this.calculateScore(appraiser, distance, options);

      // Estimate arrival time
      const estimatedArrival = this.estimateArrival(distance);

      candidates.push({
        userId: appraiser.userId,
        profile: appraiser as AppraiserProfile & { user: User },
        distance,
        score,
        estimatedArrival,
      });
    }

    // Sort by score (or preferred appraisers first)
    const sorted = candidates.sort((a, b) => {
      // Preferred appraisers get priority
      if (options.preferredAppraisers) {
        const aPreferred = options.preferredAppraisers.includes(a.userId);
        const bPreferred = options.preferredAppraisers.includes(b.userId);
        if (aPreferred && !bPreferred) return -1;
        if (!aPreferred && bPreferred) return 1;
      }
      return b.score - a.score;
    });

    return sorted.slice(0, MATCHER_CONFIG.maxResults);
  }

  /**
   * Check if appraiser is available for job
   * Note: Profile is now included in the initial query to avoid N+1
   */
  private async checkAvailability(
    appraiserId: string,
    job: JobWithProperty,
    profile?: { preferredSchedule: unknown } | null,
  ): Promise<boolean> {
    // Check current workload
    const activeJobs = await prisma.job.count({
      where: {
        assignedAppraiserId: appraiserId,
        status: {
          in: ["ACCEPTED", "IN_PROGRESS", "SUBMITTED"],
        },
      },
    });

    // Max concurrent jobs per appraiser
    const maxConcurrent = 5;
    if (activeJobs >= maxConcurrent) return false;

    // Use provided profile or fetch if not provided (backward compatibility)
    let scheduleProfile = profile;
    if (!scheduleProfile) {
      scheduleProfile = await prisma.appraiserProfile.findUnique({
        where: { userId: appraiserId },
        select: { preferredSchedule: true },
      });
    }

    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hour * 60 + minutes; // Convert to minutes for easier comparison

    // Day names mapping
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = dayNames[dayOfWeek];

    // Check schedule from appraiser's preferredSchedule
    const schedule = scheduleProfile?.preferredSchedule as Record<
      string,
      unknown
    > | null;

    if (schedule) {
      // Check date-specific overrides first
      const dateStr = now.toISOString().split("T")[0];
      const dateOverrides = schedule.dateOverrides as
        | Record<
            string,
            { isAvailable?: boolean; startTime?: string; endTime?: string }
          >
        | undefined;

      if (dateOverrides && dateOverrides[dateStr]) {
        const override = dateOverrides[dateStr];
        if (!override.isAvailable) return false;
        if (override.startTime && override.endTime) {
          const startMinutes = this.parseTimeToMinutes(override.startTime);
          const endMinutes = this.parseTimeToMinutes(override.endTime);
          return currentTime >= startMinutes && currentTime <= endMinutes;
        }
        return true;
      }

      // Check weekly schedule
      const daySchedule = schedule[dayName] as
        | { isAvailable?: boolean; startTime?: string; endTime?: string }
        | undefined;

      if (daySchedule) {
        if (!daySchedule.isAvailable) return false;
        if (daySchedule.startTime && daySchedule.endTime) {
          const startMinutes = this.parseTimeToMinutes(daySchedule.startTime);
          const endMinutes = this.parseTimeToMinutes(daySchedule.endTime);
          return currentTime >= startMinutes && currentTime <= endMinutes;
        }
        return true;
      }
    }

    // Fallback to default business hours if no schedule is configured
    // (8am - 6pm, Mon-Sat)
    if (dayOfWeek === 0) return false; // Sunday
    if (hour < 8 || hour > 18) return false;

    return true;
  }

  /**
   * Parse time string (HH:MM) to minutes since midnight
   */
  private parseTimeToMinutes(time: string): number {
    const [hours, mins] = time.split(":").map(Number);
    return (hours || 0) * 60 + (mins || 0);
  }

  /**
   * Calculate availability score based on schedule and workload
   */
  private calculateAvailabilityScore(
    appraiser: AppraiserProfile & { user: User },
  ): number {
    let score = 100;
    const schedule = appraiser.preferredSchedule as Record<
      string,
      { start: string; end: string; enabled: boolean }
    > | null;

    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const todayKey = dayNames[dayOfWeek];

    // Check if appraiser has schedule for today
    if (schedule && schedule[todayKey]) {
      const todaySchedule = schedule[todayKey];
      if (!todaySchedule.enabled) {
        // Not working today - reduce score significantly
        score -= 50;
      } else {
        // Check remaining hours in their schedule
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const endMinutes = this.parseTimeToMinutes(todaySchedule.end);
        const remainingMinutes = Math.max(0, endMinutes - currentMinutes);

        // If less than 2 hours remaining, reduce score
        if (remainingMinutes < 120) {
          score -= 30;
        } else if (remainingMinutes < 240) {
          score -= 15;
        }
      }
    }

    // Factor in current workload (completedJobs this week indicates active appraiser)
    // Appraisers with very high recent completions might be overloaded
    if (appraiser.completedJobs > 0) {
      // Assume average 5 jobs per week is healthy workload
      // This would ideally check actual active jobs, but we use proxy metric
      const weeklyTarget = 5;
      const workloadRatio = Math.min(1.5, appraiser.completedJobs / 100); // Simplified
      if (workloadRatio > 1.2) {
        score -= 10; // Slightly penalize very busy appraisers
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate match score for appraiser
   */
  private calculateScore(
    appraiser: AppraiserProfile & { user: User },
    distance: number,
    options: DispatchOptions,
  ): number {
    const weights = MATCHER_CONFIG.weights;
    let score = 0;

    // Distance score (closer = better, normalized to 0-100)
    const maxDist = options.maxRadius || MATCHER_CONFIG.defaultRadius;
    const distanceScore = Math.max(0, 100 - (distance / maxDist) * 100);
    score += distanceScore * weights.distance;

    // Rating score
    const rating = appraiser.rating || 4.0;
    const ratingScore = (rating / 5) * 100;
    score += ratingScore * weights.rating;

    // Completion rate score
    const totalJobs = appraiser.completedJobs + appraiser.cancelledJobs;
    const completionRate =
      totalJobs > 0 ? (appraiser.completedJobs / totalJobs) * 100 : 90;
    score += completionRate * weights.completionRate;

    // Availability score (based on current workload and schedule)
    const availabilityScore = this.calculateAvailabilityScore(appraiser);
    score += availabilityScore * weights.availability;

    // Experience score (based on total jobs completed)
    const completedJobs = appraiser.completedJobs || 0;
    const experienceScore = Math.min(100, totalJobs * 2);
    score += experienceScore * weights.experience;

    // Urgency bonus for high-rated appraisers
    if (options.urgency === "CRITICAL" && rating >= 4.5) {
      score *= 1.1;
    }

    return Math.round(score);
  }

  /**
   * Estimate arrival time in minutes
   */
  private estimateArrival(distance: number): number {
    // Average speed assumption: 30 mph in urban/suburban areas
    const avgSpeedMph = 30;
    const travelMinutes = (distance / avgSpeedMph) * 60;

    // Add buffer for preparation (15 min)
    return Math.round(travelMinutes + 15);
  }

  /**
   * Find best single match for auto-assignment
   */
  async findBestMatch(
    job: JobWithProperty,
    options: DispatchOptions = {},
  ): Promise<MatchedAppraiser | null> {
    const matches = await this.findMatches(job, options);
    return matches[0] || null;
  }

  /**
   * Calculate coverage for a geographic area
   */
  async calculateCoverage(
    lat: number,
    lng: number,
    radius: number,
  ): Promise<{
    totalAppraisers: number;
    avgDistance: number;
    avgRating: number;
  }> {
    const appraisers = await prisma.appraiserProfile.findMany({
      where: {
        verificationStatus: "VERIFIED",
      },
    });

    let totalInRange = 0;
    let totalDistance = 0;
    let totalRating = 0;

    for (const appraiser of appraisers) {
      const distance = await geofencing.calculateDistance(
        { lat, lng },
        {
          lat: appraiser.homeBaseLat || 0,
          lng: appraiser.homeBaseLng || 0,
        },
      );

      if (distance <= radius) {
        totalInRange++;
        totalDistance += distance;
        totalRating += appraiser.rating || 4.0;
      }
    }

    return {
      totalAppraisers: totalInRange,
      avgDistance: totalInRange > 0 ? totalDistance / totalInRange : 0,
      avgRating: totalInRange > 0 ? totalRating / totalInRange : 0,
    };
  }
}

export const matcher = new AppraiserMatcher();
