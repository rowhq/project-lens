/**
 * Geofencing Service
 * Handles geographic calculations and service area validation
 *
 * =====================================================================
 * SCALABILITY NOTE: PostGIS Migration Required for Production Scale
 * =====================================================================
 *
 * Current Implementation:
 * - Geographic queries are performed in-memory using Haversine formula
 * - All appraisers are loaded from database and filtered in Node.js
 * - Works well for small datasets (<1000 appraisers)
 *
 * Recommended Future Implementation with PostGIS:
 *
 * 1. Add PostGIS extension to PostgreSQL:
 *    CREATE EXTENSION postgis;
 *
 * 2. Add geography column to AppraiserProfile:
 *    ALTER TABLE "AppraiserProfile"
 *    ADD COLUMN location geography(Point, 4326);
 *
 *    UPDATE "AppraiserProfile"
 *    SET location = ST_SetSRID(ST_MakePoint("homeBaseLng", "homeBaseLat"), 4326);
 *
 *    CREATE INDEX idx_appraiser_location
 *    ON "AppraiserProfile" USING GIST(location);
 *
 * 3. Similarly for Property and Job tables:
 *    ALTER TABLE "Property"
 *    ADD COLUMN location geography(Point, 4326);
 *
 *    CREATE INDEX idx_property_location
 *    ON "Property" USING GIST(location);
 *
 * 4. Replace in-memory filtering with spatial queries:
 *
 *    -- Find appraisers within X miles of a property
 *    SELECT a.*
 *    FROM "AppraiserProfile" a
 *    WHERE ST_DWithin(
 *      a.location,
 *      ST_SetSRID(ST_MakePoint(-97.7431, 30.2672), 4326),
 *      40234  -- 25 miles in meters
 *    )
 *    AND a."verificationStatus" = 'VERIFIED';
 *
 *    -- Calculate exact distance
 *    SELECT
 *      a.*,
 *      ST_Distance(a.location, property.location) / 1609.34 AS distance_miles
 *    FROM "AppraiserProfile" a
 *    CROSS JOIN (
 *      SELECT location FROM "Property" WHERE id = $propertyId
 *    ) property;
 *
 * 5. Benefits of PostGIS:
 *    - Index-based spatial queries (orders of magnitude faster)
 *    - Scales to millions of records
 *    - Accurate geographic calculations
 *    - Support for complex geofencing (polygons, service areas)
 *    - Proximity searches become O(log n) instead of O(n)
 *
 * 6. Prisma Integration:
 *    - Use raw queries or Prisma extension for PostGIS
 *    - Consider prisma-postgis-extension for type safety
 *
 * Migration Priority: HIGH for >10,000 appraisers or >1,000 concurrent jobs
 * Estimated Effort: 2-3 days for implementation + testing
 * =====================================================================
 */

import type { AppraiserProfile } from "@prisma/client";
import { calculateDistanceMiles, toRadians } from "@/shared/lib/geo";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Texas county definitions with approximate centers
 */
const TEXAS_COUNTIES: Record<string, Coordinates> = {
  Travis: { lat: 30.3074, lng: -97.7559 }, // Austin
  Harris: { lat: 29.7604, lng: -95.3698 }, // Houston
  Dallas: { lat: 32.7767, lng: -96.797 },
  Tarrant: { lat: 32.7555, lng: -97.3308 }, // Fort Worth
  Bexar: { lat: 29.4241, lng: -98.4936 }, // San Antonio
  Collin: { lat: 33.1901, lng: -96.6072 }, // Plano
  Denton: { lat: 33.2148, lng: -97.1331 },
  "Fort Bend": { lat: 29.5272, lng: -95.7741 },
  Hidalgo: { lat: 26.2034, lng: -98.2307 },
  "El Paso": { lat: 31.7619, lng: -106.485 },
  Williamson: { lat: 30.6477, lng: -97.6011 },
  Montgomery: { lat: 30.3075, lng: -95.4584 },
  Cameron: { lat: 26.1505, lng: -97.4883 },
  Nueces: { lat: 27.8006, lng: -97.3964 }, // Corpus Christi
  Brazoria: { lat: 29.1684, lng: -95.4383 },
};

/**
 * Geofencing service class
 */
class GeofencingService {
  /**
   * Calculate distance between two points using Haversine formula
   */
  async calculateDistance(
    point1: Coordinates,
    point2: Coordinates,
  ): Promise<number> {
    return calculateDistanceMiles(
      point1.lat,
      point1.lng,
      point2.lat,
      point2.lng,
    );
  }

  /**
   * Check if a point is within an appraiser's service area
   */
  async isWithinServiceArea(
    point: Coordinates,
    appraiser: AppraiserProfile,
  ): Promise<boolean> {
    // Check coverage radius
    const serviceRadius = appraiser.coverageRadiusMiles || 25; // Default 25 miles
    const appraiserLocation: Coordinates = {
      lat: appraiser.homeBaseLat || 0,
      lng: appraiser.homeBaseLng || 0,
    };

    const distance = await this.calculateDistance(point, appraiserLocation);

    if (distance > serviceRadius) {
      return false;
    }

    return true;
  }

  /**
   * Get county for a geographic point (simplified)
   */
  async getCountyForPoint(point: Coordinates): Promise<string | null> {
    // Find closest county center
    let closestCounty: string | null = null;
    let minDistance = Infinity;

    for (const [county, center] of Object.entries(TEXAS_COUNTIES)) {
      const distance = await this.calculateDistance(point, center);
      if (distance < minDistance) {
        minDistance = distance;
        closestCounty = county;
      }
    }

    // Only return if within reasonable distance (50 miles of county center)
    return minDistance <= 50 ? closestCounty : null;
  }

  /**
   * Get bounding box for a radius around a point
   */
  getBoundingBox(center: Coordinates, radiusMiles: number): BoundingBox {
    // Approximate degrees per mile at this latitude
    const latDegPerMile = 1 / 69;
    const lngDegPerMile = 1 / (69 * Math.cos(toRadians(center.lat)));

    const latDelta = radiusMiles * latDegPerMile;
    const lngDelta = radiusMiles * lngDegPerMile;

    return {
      north: center.lat + latDelta,
      south: center.lat - latDelta,
      east: center.lng + lngDelta,
      west: center.lng - lngDelta,
    };
  }

  /**
   * Check if point is within bounding box
   */
  isWithinBoundingBox(point: Coordinates, box: BoundingBox): boolean {
    return (
      point.lat <= box.north &&
      point.lat >= box.south &&
      point.lng <= box.east &&
      point.lng >= box.west
    );
  }

  /**
   * Get all Texas counties
   */
  getTexasCounties(): string[] {
    return Object.keys(TEXAS_COUNTIES);
  }

  /**
   * Get county center coordinates
   */
  getCountyCenter(county: string): Coordinates | null {
    return TEXAS_COUNTIES[county] || null;
  }

  /**
   * Calculate optimal meeting point between two locations
   */
  async calculateMeetingPoint(
    point1: Coordinates,
    point2: Coordinates,
  ): Promise<Coordinates> {
    // Simple midpoint calculation
    return {
      lat: (point1.lat + point2.lat) / 2,
      lng: (point1.lng + point2.lng) / 2,
    };
  }

  /**
   * Estimate travel time in minutes
   */
  async estimateTravelTime(
    from: Coordinates,
    to: Coordinates,
    trafficFactor: number = 1.0,
  ): Promise<number> {
    const distance = await this.calculateDistance(from, to);

    // Base speed assumptions
    let avgSpeed: number;
    if (distance < 5) {
      avgSpeed = 25; // Urban
    } else if (distance < 20) {
      avgSpeed = 35; // Suburban
    } else {
      avgSpeed = 55; // Highway
    }

    // Apply traffic factor (1.0 = normal, 1.5 = heavy traffic)
    avgSpeed = avgSpeed / trafficFactor;

    const travelMinutes = (distance / avgSpeed) * 60;

    return Math.round(travelMinutes);
  }

  /**
   * Validate coordinates are within Texas
   */
  isWithinTexas(point: Coordinates): boolean {
    // Texas bounding box (approximate)
    const texasBounds: BoundingBox = {
      north: 36.5,
      south: 25.8,
      east: -93.5,
      west: -106.6,
    };

    return this.isWithinBoundingBox(point, texasBounds);
  }

  /**
   * Get metro area for coordinates
   */
  async getMetroArea(point: Coordinates): Promise<string | null> {
    const metroAreas: Record<string, { center: Coordinates; radius: number }> =
      {
        "Austin-Round Rock": {
          center: { lat: 30.2672, lng: -97.7431 },
          radius: 40,
        },
        "Houston-The Woodlands-Sugar Land": {
          center: { lat: 29.7604, lng: -95.3698 },
          radius: 50,
        },
        "Dallas-Fort Worth-Arlington": {
          center: { lat: 32.7767, lng: -96.797 },
          radius: 50,
        },
        "San Antonio-New Braunfels": {
          center: { lat: 29.4241, lng: -98.4936 },
          radius: 35,
        },
        "El Paso": { center: { lat: 31.7619, lng: -106.485 }, radius: 25 },
        "McAllen-Edinburg-Mission": {
          center: { lat: 26.2034, lng: -98.2307 },
          radius: 25,
        },
      };

    for (const [metro, data] of Object.entries(metroAreas)) {
      const distance = await this.calculateDistance(point, data.center);
      if (distance <= data.radius) {
        return metro;
      }
    }

    return null;
  }
}

export const geofencing = new GeofencingService();
