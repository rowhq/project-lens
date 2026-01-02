"use client";

import { Trophy, Target, Award, ChevronRight, Flame } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// Badge definitions
export const BADGES = [
  {
    id: "first_job",
    name: "First Job",
    icon: "01",
    description: "Complete your first job",
    requirement: 1,
    type: "jobs",
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    icon: "02",
    description: "Complete a job in under 2 hours",
    requirement: 1,
    type: "speed",
  },
  {
    id: "early_bird",
    name: "Early Bird",
    icon: "03",
    description: "Complete a job before 8 AM",
    requirement: 1,
    type: "time",
  },
  {
    id: "night_owl",
    name: "Night Owl",
    icon: "04",
    description: "Complete a job after 8 PM",
    requirement: 1,
    type: "time",
  },
  {
    id: "week_warrior",
    name: "Week Warrior",
    icon: "05",
    description: "Maintain a 7-day streak",
    requirement: 7,
    type: "streak",
  },
  {
    id: "century",
    name: "Century Club",
    icon: "06",
    description: "Complete 100 jobs",
    requirement: 100,
    type: "jobs",
  },
  {
    id: "perfect_week",
    name: "Perfect Week",
    icon: "07",
    description: "5.0 rating for 20+ jobs",
    requirement: 20,
    type: "rating",
  },
  {
    id: "explorer",
    name: "Explorer",
    icon: "08",
    description: "Work in 10 different cities",
    requirement: 10,
    type: "cities",
  },
  {
    id: "high_roller",
    name: "High Roller",
    icon: "09",
    description: "Earn $10,000 total",
    requirement: 10000,
    type: "earnings",
  },
  {
    id: "marathon",
    name: "Marathon",
    icon: "10",
    description: "Complete 5 jobs in one day",
    requirement: 5,
    type: "daily",
  },
  {
    id: "consistency",
    name: "Consistency",
    icon: "11",
    description: "30-day streak",
    requirement: 30,
    type: "streak",
  },
  {
    id: "elite",
    name: "Elite Appraiser",
    icon: "12",
    description: "Complete 500 jobs",
    requirement: 500,
    type: "jobs",
  },
] as const;

export type Badge = (typeof BADGES)[number];

// Calculate which badges are unlocked
export const calculateUnlockedBadges = (stats: {
  completedJobs?: number;
  currentStreak?: number;
  totalEarnings?: number;
  rating?: number;
  ratedJobs?: number;
}): Badge[] => {
  const unlocked: Badge[] = [];

  BADGES.forEach((badge) => {
    let isUnlocked = false;

    switch (badge.type) {
      case "jobs":
        isUnlocked = (stats.completedJobs || 0) >= badge.requirement;
        break;
      case "streak":
        isUnlocked = (stats.currentStreak || 0) >= badge.requirement;
        break;
      case "earnings":
        isUnlocked = (stats.totalEarnings || 0) >= badge.requirement;
        break;
      case "rating":
        isUnlocked =
          (stats.rating || 0) >= 5.0 &&
          (stats.ratedJobs || 0) >= badge.requirement;
        break;
      default:
        break;
    }

    if (isUnlocked) {
      unlocked.push(badge);
    }
  });

  return unlocked;
};

// Streak Banner Component - Ledger Style
export const StreakBanner = ({
  currentStreak = 0,
  longestStreak = 0,
}: {
  currentStreak?: number;
  longestStreak?: number;
}) => {
  if (currentStreak === 0) {
    return (
      <div className="relative bg-gray-950 border border-gray-700 p-4 clip-notch">
        {/* Bracket corners */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-gray-600" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-gray-600" />

        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 border border-gray-800 clip-notch-sm">
            <Flame className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <p className="font-mono text-sm uppercase tracking-wider text-gray-400">
              Start Your Streak!
            </p>
            <p className="text-sm text-gray-500">
              Complete a job today to begin your streak
            </p>
          </div>
        </div>
      </div>
    );
  }

  const streakLevel =
    currentStreak >= 30
      ? "legendary"
      : currentStreak >= 14
        ? "epic"
        : currentStreak >= 7
          ? "hot"
          : "warm";
  const borderColors = {
    legendary: "border-purple-400/50",
    epic: "border-amber-400/50",
    hot: "border-amber-400/40",
    warm: "border-amber-400/30",
  };
  const accentColors = {
    legendary: "text-purple-400 border-purple-400/30 bg-purple-400/10",
    epic: "text-amber-400 border-amber-400/30 bg-amber-400/10",
    hot: "text-amber-400 border-amber-400/30 bg-amber-400/10",
    warm: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  };

  return (
    <div
      className={cn(
        "relative bg-gray-950 border p-4 clip-notch",
        borderColors[streakLevel],
      )}
    >
      {/* Bracket corners */}
      <div
        className={cn(
          "absolute top-0 left-0 w-3 h-3 border-t border-l",
          streakLevel === "legendary"
            ? "border-purple-400"
            : "border-amber-400",
        )}
      />
      <div
        className={cn(
          "absolute bottom-0 right-0 w-3 h-3 border-b border-r",
          streakLevel === "legendary"
            ? "border-purple-400"
            : "border-amber-400",
        )}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2.5 border clip-notch-sm",
              accentColors[streakLevel],
            )}
          >
            <Flame
              className={cn(
                "w-6 h-6",
                currentStreak >= 7 ? "animate-pulse" : "",
                streakLevel === "legendary"
                  ? "text-purple-400"
                  : "text-amber-400",
              )}
            />
          </div>
          <div>
            <p className="text-2xl font-bold text-white tracking-tight">
              {currentStreak} Day{currentStreak !== 1 ? "s" : ""} Streak
            </p>
            <p className="text-sm text-gray-500">
              {currentStreak >= 7
                ? "Amazing! Keep the momentum going!"
                : "Complete a job today to keep it going!"}
            </p>
          </div>
        </div>
        {longestStreak > 0 && (
          <div className="text-right">
            <p className="text-label text-gray-500 font-mono uppercase tracking-wider">
              Best Streak
            </p>
            <p className="text-lg font-bold font-mono text-amber-400">
              {longestStreak} days
            </p>
          </div>
        )}
      </div>

      {/* Progress to next milestone */}
      {currentStreak < 30 && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500 font-mono text-label uppercase tracking-wider">
              Next milestone:{" "}
              {currentStreak < 7
                ? "7 days"
                : currentStreak < 14
                  ? "14 days"
                  : "30 days"}
            </span>
            <span className="font-mono font-bold text-white">
              {currentStreak < 7
                ? 7 - currentStreak
                : currentStreak < 14
                  ? 14 - currentStreak
                  : 30 - currentStreak}{" "}
              to go
            </span>
          </div>
          <div className="w-full bg-gray-900 h-1.5 clip-notch-sm">
            <div
              className={cn(
                "h-1.5",
                streakLevel === "legendary" ? "bg-purple-400" : "bg-amber-400",
              )}
              style={{
                width: `${
                  currentStreak < 7
                    ? (currentStreak / 7) * 100
                    : currentStreak < 14
                      ? ((currentStreak - 7) / 7) * 100
                      : ((currentStreak - 14) / 16) * 100
                }%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Badge Display Component - Ledger Style
export const BadgeDisplay = ({
  unlockedBadges = [],
  showAll = false,
  onViewAll,
}: {
  unlockedBadges?: string[];
  showAll?: boolean;
  onViewAll?: () => void;
}) => {
  const displayBadges = showAll ? BADGES : BADGES.slice(0, 8);
  const unlockedCount = BADGES.filter((b) =>
    unlockedBadges.includes(b.id),
  ).length;

  return (
    <div className="relative bg-gray-950 border border-gray-800 p-4 clip-notch">
      {/* Bracket corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-amber-400/30" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-amber-400/30" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="font-mono text-sm uppercase tracking-wider text-gray-400">
            Achievements
          </h3>
        </div>
        <span className="text-label text-gray-500 font-mono">
          {unlockedCount} / {BADGES.length} UNLOCKED
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {displayBadges.map((badge) => {
          const isUnlocked = unlockedBadges.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={cn(
                "flex flex-col items-center p-3 transition-all clip-notch-sm",
                isUnlocked
                  ? "bg-amber-400/10 border border-amber-400/30"
                  : "bg-gray-900 border border-gray-800 opacity-40",
              )}
              title={badge.description}
            >
              <div
                className={cn(
                  "font-mono text-xl font-bold mb-1",
                  isUnlocked ? "text-amber-400" : "text-gray-600",
                )}
              >
                {badge.icon}
              </div>
              <p
                className={cn(
                  "text-label text-center font-mono uppercase tracking-wider line-clamp-1",
                  isUnlocked ? "text-white" : "text-gray-500",
                )}
              >
                {badge.name}
              </p>
              {isUnlocked && (
                <span
                  className="w-1.5 h-1.5 bg-lime-400 mt-1"
                  style={{
                    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {!showAll && onViewAll && (
        <button
          onClick={onViewAll}
          className={cn(
            "w-full mt-4 py-2.5",
            "font-mono text-sm uppercase tracking-wider",
            "text-lime-400 hover:text-lime-300",
            "border border-gray-800 hover:border-lime-400/30",
            "bg-gray-900 hover:bg-gray-900/50",
            "clip-notch-sm",
            "transition-all duration-fast",
            "flex items-center justify-center gap-1",
          )}
        >
          View All Achievements
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Daily Goal Widget - Ledger Style
export const DailyGoalWidget = ({
  completedToday = 0,
  dailyGoal = 3,
  earningsToday = 0,
}: {
  completedToday?: number;
  dailyGoal?: number;
  earningsToday?: number;
}) => {
  const progress = Math.min((completedToday / dailyGoal) * 100, 100);
  const isComplete = completedToday >= dailyGoal;

  return (
    <div
      className={cn(
        "relative bg-gray-950 border p-4 clip-notch",
        isComplete ? "border-lime-400/50" : "border-gray-800",
      )}
    >
      {/* Bracket corners */}
      <div
        className={cn(
          "absolute top-0 left-0 w-3 h-3 border-t border-l",
          isComplete ? "border-lime-400" : "border-lime-400/30",
        )}
      />
      <div
        className={cn(
          "absolute bottom-0 right-0 w-3 h-3 border-b border-r",
          isComplete ? "border-lime-400" : "border-lime-400/30",
        )}
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target
            className={cn(
              "w-5 h-5",
              isComplete ? "text-lime-400" : "text-gray-500",
            )}
          />
          <h3 className="font-mono text-sm uppercase tracking-wider text-gray-400">
            Daily Goal
          </h3>
        </div>
        {isComplete && (
          <span className="px-2 py-0.5 bg-lime-400/20 text-lime-400 text-label font-mono border border-lime-400/30 clip-notch-sm">
            COMPLETE!
          </span>
        )}
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-3xl font-bold text-white tracking-tight">
            {completedToday}
            <span className="text-lg text-gray-500 font-mono">
              /{dailyGoal}
            </span>
          </p>
          <p className="text-label text-gray-500 font-mono uppercase tracking-wider">
            Jobs Completed
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-lime-400 font-mono">
            ${earningsToday}
          </p>
          <p className="text-label text-gray-500 font-mono uppercase tracking-wider">
            Earned Today
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-900 h-1.5 clip-notch-sm">
        <div
          className={cn(
            "h-1.5 transition-all",
            isComplete ? "bg-lime-400" : "bg-lime-400/70",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {!isComplete && (
        <p className="text-sm text-gray-500 mt-2">
          {dailyGoal - completedToday} more job
          {dailyGoal - completedToday !== 1 ? "s" : ""} to reach your goal!
        </p>
      )}
    </div>
  );
};

// Level Progress Widget - Ledger Style
export const LevelProgressWidget = ({
  completedJobs = 0,
}: {
  completedJobs?: number;
}) => {
  const levels = [
    { name: "Rookie", minJobs: 0, maxJobs: 10 },
    { name: "Apprentice", minJobs: 10, maxJobs: 50 },
    { name: "Professional", minJobs: 50, maxJobs: 100 },
    { name: "Expert", minJobs: 100, maxJobs: 250 },
    { name: "Master", minJobs: 250, maxJobs: 500 },
    { name: "Legend", minJobs: 500, maxJobs: Infinity },
  ];

  const currentLevel =
    levels.find(
      (l) => completedJobs >= l.minJobs && completedJobs < l.maxJobs,
    ) || levels[0];
  const nextLevel = levels[levels.indexOf(currentLevel) + 1];
  const progressInLevel = nextLevel
    ? ((completedJobs - currentLevel.minJobs) /
        (nextLevel.minJobs - currentLevel.minJobs)) *
      100
    : 100;

  const levelColors: Record<
    string,
    { text: string; bg: string; border: string }
  > = {
    Rookie: {
      text: "text-gray-400",
      bg: "bg-gray-400/10",
      border: "border-gray-400/30",
    },
    Apprentice: {
      text: "text-lime-400",
      bg: "bg-lime-400/10",
      border: "border-lime-400/30",
    },
    Professional: {
      text: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/30",
    },
    Expert: {
      text: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/30",
    },
    Master: {
      text: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/30",
    },
    Legend: {
      text: "text-amber-300",
      bg: "bg-amber-300/10",
      border: "border-amber-300/30",
    },
  };

  const colors = levelColors[currentLevel.name];

  return (
    <div className="relative bg-gray-950 border border-gray-800 p-4 clip-notch">
      {/* Bracket corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-purple-400/30" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-purple-400/30" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          <h3 className="font-mono text-sm uppercase tracking-wider text-gray-400">
            Your Level
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div
          className={cn(
            "w-14 h-14 flex items-center justify-center clip-notch border",
            colors.bg,
            colors.border,
          )}
        >
          <span className={cn("font-mono text-xl font-bold", colors.text)}>
            {String(levels.indexOf(currentLevel) + 1).padStart(2, "0")}
          </span>
        </div>
        <div>
          <p
            className={cn(
              "text-xl font-bold font-mono uppercase tracking-wider",
              colors.text,
            )}
          >
            {currentLevel.name}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-mono font-bold text-white">
              {completedJobs}
            </span>{" "}
            jobs completed
          </p>
        </div>
      </div>

      {nextLevel && (
        <>
          <div className="w-full bg-gray-900 h-1.5 clip-notch-sm mb-2">
            <div
              className={cn("h-1.5", colors.text.replace("text-", "bg-"))}
              style={{ width: `${progressInLevel}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">
            <span className="font-mono font-bold text-white">
              {nextLevel.minJobs - completedJobs}
            </span>{" "}
            jobs to{" "}
            <span
              className={cn(
                "font-mono uppercase",
                levelColors[nextLevel.name].text,
              )}
            >
              {nextLevel.name}
            </span>
          </p>
        </>
      )}
    </div>
  );
};
