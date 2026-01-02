import { useState, useEffect, useCallback } from 'react';

interface CountdownResult {
  timeRemaining: string;
  hoursRemaining: number;
  isOverdue: boolean;
  isCritical: boolean;
  isUrgent: boolean;
}

const DEFAULT_RESULT: CountdownResult = {
  timeRemaining: '',
  hoursRemaining: Infinity,
  isOverdue: false,
  isCritical: false,
  isUrgent: false,
};

const NA_RESULT: CountdownResult = {
  timeRemaining: 'N/A',
  hoursRemaining: Infinity,
  isOverdue: false,
  isCritical: false,
  isUrgent: false,
};

function calculateCountdown(targetDate: string | Date): CountdownResult {
  const now = Date.now();
  const target = new Date(targetDate).getTime();
  const diff = target - now;
  const hoursRemaining = diff / (1000 * 60 * 60);

  if (diff <= 0) {
    const overdueDiff = Math.abs(diff);
    const overdueHours = Math.floor(overdueDiff / (1000 * 60 * 60));
    const overdueMinutes = Math.floor((overdueDiff % (1000 * 60 * 60)) / (1000 * 60));

    return {
      timeRemaining: overdueHours > 0 ? `${overdueHours}h ${overdueMinutes}m overdue` : `${overdueMinutes}m overdue`,
      hoursRemaining: -overdueHours,
      isOverdue: true,
      isCritical: true,
      isUrgent: true,
    };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let timeRemaining: string;
  if (hours < 1) {
    timeRemaining = `${minutes}m`;
  } else if (hours < 24) {
    timeRemaining = `${hours}h ${minutes}m`;
  } else {
    const days = Math.floor(hours / 24);
    timeRemaining = `${days}d ${hours % 24}h`;
  }

  return {
    timeRemaining,
    hoursRemaining,
    isOverdue: false,
    isCritical: hoursRemaining < 4,
    isUrgent: hoursRemaining < 24,
  };
}

export const useLiveCountdown = (targetDate: string | Date | null): CountdownResult => {
  const [result, setResult] = useState<CountdownResult>(() => {
    if (!targetDate) return NA_RESULT;
    return calculateCountdown(targetDate);
  });

  const updateCountdown = useCallback(() => {
    if (!targetDate) {
      setResult(NA_RESULT);
      return;
    }
    setResult(calculateCountdown(targetDate));
  }, [targetDate]);

  useEffect(() => {
    if (!targetDate) return;

    // Update every minute
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [targetDate, updateCountdown]);

  // Update when targetDate changes
  useEffect(() => {
    updateCountdown();
  }, [updateCountdown]);

  return result;
};

// Helper function for urgency styling
export const getUrgencyConfig = (hoursRemaining: number, isOverdue: boolean) => {
  if (isOverdue) {
    return {
      level: 'overdue' as const,
      label: 'OVERDUE',
      icon: '🚨',
      bgClass: 'bg-red-500/20 border-red-500/50',
      textClass: 'text-red-400',
      badgeClass: 'bg-red-500 text-white animate-pulse',
    };
  }

  if (hoursRemaining < 4) {
    return {
      level: 'critical' as const,
      label: 'DUE VERY SOON',
      icon: '🔥',
      bgClass: 'bg-red-500/20 border-red-500/50',
      textClass: 'text-red-400',
      badgeClass: 'bg-red-500/20 text-red-400 border border-red-500/50',
    };
  }

  if (hoursRemaining < 24) {
    return {
      level: 'high' as const,
      label: 'DUE TODAY',
      icon: '⚡',
      bgClass: 'bg-orange-500/20 border-orange-500/50',
      textClass: 'text-orange-400',
      badgeClass: 'bg-orange-500/20 text-orange-400 border border-orange-500/50',
    };
  }

  if (hoursRemaining < 48) {
    return {
      level: 'medium' as const,
      label: 'DUE TOMORROW',
      icon: '⏰',
      bgClass: 'bg-yellow-500/20 border-yellow-500/50',
      textClass: 'text-yellow-400',
      badgeClass: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50',
    };
  }

  return {
    level: 'normal' as const,
    label: '',
    icon: '',
    bgClass: '',
    textClass: 'text-[var(--foreground)]',
    badgeClass: '',
  };
};
