"use client";

import {
  Trophy,
  Target,
  Award,
  ChevronRight,
} from "lucide-react";

// Badge definitions
export const BADGES = [
  { id: "first_job", name: "First Job", icon: "🎯", description: "Complete your first job", requirement: 1, type: "jobs" },
  { id: "speed_demon", name: "Speed Demon", icon: "⚡", description: "Complete a job in under 2 hours", requirement: 1, type: "speed" },
  { id: "early_bird", name: "Early Bird", icon: "🌅", description: "Complete a job before 8 AM", requirement: 1, type: "time" },
  { id: "night_owl", name: "Night Owl", icon: "🦉", description: "Complete a job after 8 PM", requirement: 1, type: "time" },
  { id: "week_warrior", name: "Week Warrior", icon: "🔥", description: "Maintain a 7-day streak", requirement: 7, type: "streak" },
  { id: "century", name: "Century Club", icon: "💯", description: "Complete 100 jobs", requirement: 100, type: "jobs" },
  { id: "perfect_week", name: "Perfect Week", icon: "⭐", description: "5.0 rating for 20+ jobs", requirement: 20, type: "rating" },
  { id: "explorer", name: "Explorer", icon: "🗺️", description: "Work in 10 different cities", requirement: 10, type: "cities" },
  { id: "high_roller", name: "High Roller", icon: "💰", description: "Earn $10,000 total", requirement: 10000, type: "earnings" },
  { id: "marathon", name: "Marathon", icon: "🏃", description: "Complete 5 jobs in one day", requirement: 5, type: "daily" },
  { id: "consistency", name: "Consistency", icon: "📅", description: "30-day streak", requirement: 30, type: "streak" },
  { id: "elite", name: "Elite Appraiser", icon: "👑", description: "Complete 500 jobs", requirement: 500, type: "jobs" },
] as const;

export type Badge = typeof BADGES[number];

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
        isUnlocked = (stats.rating || 0) >= 5.0 && (stats.ratedJobs || 0) >= badge.requirement;
        break;
      // Speed, time, cities, daily badges would need additional tracking
      default:
        break;
    }

    if (isUnlocked) {
      unlocked.push(badge);
    }
  });

  return unlocked;
};

// Streak Banner Component
export const StreakBanner = ({
  currentStreak = 0,
  longestStreak = 0,
}: {
  currentStreak?: number;
  longestStreak?: number;
}) => {
  if (currentStreak === 0) {
    return (
      <div className="bg-gradient-to-r from-gray-500/20 to-gray-600/20 rounded-xl p-4 border border-gray-500/30">
        <div className="flex items-center gap-3">
          <div className="text-4xl opacity-50">🔥</div>
          <div>
            <p className="text-lg font-bold text-[var(--foreground)]">Start Your Streak!</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Complete a job today to begin your streak
            </p>
          </div>
        </div>
      </div>
    );
  }

  const streakLevel = currentStreak >= 30 ? "legendary" : currentStreak >= 14 ? "epic" : currentStreak >= 7 ? "hot" : "warm";
  const gradients = {
    legendary: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    epic: "from-orange-500/20 to-red-500/20 border-orange-500/30",
    hot: "from-orange-500/20 to-yellow-500/20 border-orange-500/30",
    warm: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
  };

  return (
    <div className={`bg-gradient-to-r ${gradients[streakLevel]} rounded-xl p-4 border`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`text-4xl ${currentStreak >= 7 ? "animate-pulse" : ""}`}>
            {currentStreak >= 30 ? "👑" : currentStreak >= 14 ? "🔥" : currentStreak >= 7 ? "🔥" : "🔥"}
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {currentStreak} Day{currentStreak !== 1 ? "s" : ""} Streak
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {currentStreak >= 7
                ? "Amazing! Keep the momentum going!"
                : "Complete a job today to keep it going!"}
            </p>
          </div>
        </div>
        {longestStreak > 0 && (
          <div className="text-right">
            <p className="text-xs text-[var(--muted-foreground)]">Best Streak</p>
            <p className="text-lg font-bold text-orange-400">{longestStreak} days</p>
          </div>
        )}
      </div>

      {/* Progress to next milestone */}
      {currentStreak < 30 && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]/50">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-[var(--muted-foreground)]">
              Next milestone: {currentStreak < 7 ? "7 days" : currentStreak < 14 ? "14 days" : "30 days"}
            </span>
            <span className="font-medium text-[var(--foreground)]">
              {currentStreak < 7 ? 7 - currentStreak : currentStreak < 14 ? 14 - currentStreak : 30 - currentStreak} to go
            </span>
          </div>
          <div className="w-full bg-[var(--muted)] rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500"
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

// Badge Display Component
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
  const unlockedCount = BADGES.filter((b) => unlockedBadges.includes(b.id)).length;

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h3 className="font-bold text-[var(--foreground)]">Achievements</h3>
        </div>
        <span className="text-sm text-[var(--muted-foreground)]">
          {unlockedCount} / {BADGES.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {displayBadges.map((badge) => {
          const isUnlocked = unlockedBadges.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                isUnlocked
                  ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50"
                  : "bg-[var(--muted)] opacity-40"
              }`}
              title={badge.description}
            >
              <div className={`text-2xl mb-1 ${!isUnlocked ? "grayscale" : ""}`}>
                {badge.icon}
              </div>
              <p className="text-xs text-center font-medium text-[var(--foreground)] line-clamp-1">
                {badge.name}
              </p>
              {isUnlocked && (
                <span className="text-xs text-yellow-400 mt-0.5">✓</span>
              )}
            </div>
          );
        })}
      </div>

      {!showAll && onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full mt-4 py-2 text-sm text-[var(--primary)] hover:bg-[var(--secondary)] rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          View All Achievements
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Daily Goal Widget
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
    <div className={`rounded-xl p-4 border ${
      isComplete
        ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30"
        : "bg-[var(--card)] border-[var(--border)]"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className={`w-5 h-5 ${isComplete ? "text-green-400" : "text-[var(--muted-foreground)]"}`} />
          <h3 className="font-bold text-[var(--foreground)]">Daily Goal</h3>
        </div>
        {isComplete && (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
            COMPLETE!
          </span>
        )}
      </div>

      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-3xl font-bold text-[var(--foreground)]">
            {completedToday}
            <span className="text-lg text-[var(--muted-foreground)]">/{dailyGoal}</span>
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">jobs completed</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-green-400">${earningsToday}</p>
          <p className="text-sm text-[var(--muted-foreground)]">earned today</p>
        </div>
      </div>

      <div className="w-full bg-[var(--muted)] rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all ${
            isComplete
              ? "bg-gradient-to-r from-green-500 to-emerald-500"
              : "bg-gradient-to-r from-[var(--primary)] to-blue-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {!isComplete && (
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          {dailyGoal - completedToday} more job{dailyGoal - completedToday !== 1 ? "s" : ""} to reach your goal!
        </p>
      )}
    </div>
  );
};

// Level Progress Widget
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

  const currentLevel = levels.find((l) => completedJobs >= l.minJobs && completedJobs < l.maxJobs) || levels[0];
  const nextLevel = levels[levels.indexOf(currentLevel) + 1];
  const progressInLevel = nextLevel
    ? ((completedJobs - currentLevel.minJobs) / (nextLevel.minJobs - currentLevel.minJobs)) * 100
    : 100;

  const levelColors: Record<string, string> = {
    Rookie: "from-gray-500 to-gray-600",
    Apprentice: "from-green-500 to-emerald-500",
    Professional: "from-blue-500 to-cyan-500",
    Expert: "from-purple-500 to-pink-500",
    Master: "from-orange-500 to-red-500",
    Legend: "from-yellow-500 to-amber-500",
  };

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-[var(--foreground)]">Your Level</h3>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${levelColors[currentLevel.name]} flex items-center justify-center text-white font-bold text-xl`}>
          {levels.indexOf(currentLevel) + 1}
        </div>
        <div>
          <p className="text-xl font-bold text-[var(--foreground)]">{currentLevel.name}</p>
          <p className="text-sm text-[var(--muted-foreground)]">{completedJobs} jobs completed</p>
        </div>
      </div>

      {nextLevel && (
        <>
          <div className="w-full bg-[var(--muted)] rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${levelColors[currentLevel.name]}`}
              style={{ width: `${progressInLevel}%` }}
            />
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            {nextLevel.minJobs - completedJobs} jobs to {nextLevel.name}
          </p>
        </>
      )}
    </div>
  );
};
