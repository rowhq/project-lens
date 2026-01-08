"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  MapPin,
  AlertCircle,
  Check,
  X,
  Loader2,
  Settings,
} from "lucide-react";

interface DaySchedule {
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
}

interface WeeklySchedule {
  [key: string]: DaySchedule;
}

const defaultSchedule: WeeklySchedule = {
  Sun: { isAvailable: false },
  Mon: { isAvailable: true, startTime: "08:00", endTime: "18:00" },
  Tue: { isAvailable: true, startTime: "08:00", endTime: "18:00" },
  Wed: { isAvailable: true, startTime: "08:00", endTime: "18:00" },
  Thu: { isAvailable: true, startTime: "08:00", endTime: "18:00" },
  Fri: { isAvailable: true, startTime: "08:00", endTime: "18:00" },
  Sat: { isAvailable: false },
};

export default function SchedulePage() {
  const { toast } = useToast();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showWeeklySettingsModal, setShowWeeklySettingsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [weeklySchedule, setWeeklySchedule] =
    useState<WeeklySchedule>(defaultSchedule);
  const [dateOverrides, setDateOverrides] = useState<
    Record<string, DaySchedule>
  >({});

  // Form state for the modal
  const [formStartTime, setFormStartTime] = useState("08:00");
  const [formEndTime, setFormEndTime] = useState("18:00");
  const [formUnavailable, setFormUnavailable] = useState(false);

  // tRPC queries and mutations
  const {
    data: schedule,
    isLoading: loadingSchedule,
    isError: scheduleError,
    refetch,
  } = trpc.appraiser.schedule.get.useQuery();
  const {
    data: activeJobs,
    isLoading: loadingJobs,
    isError: jobsError,
  } = trpc.job.myActive.useQuery();

  const isLoading = loadingSchedule || loadingJobs;
  const isError = scheduleError && jobsError;

  const setWeeklyAvailability =
    trpc.appraiser.schedule.setWeeklyAvailability.useMutation({
      onSuccess: () => {
        refetch();
        setShowWeeklySettingsModal(false);
        toast({
          title: "Schedule saved",
          description: "Your weekly availability has been updated.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description:
            error.message || "Failed to save schedule. Please try again.",
          variant: "destructive",
        });
      },
    });

  const setDateAvailability =
    trpc.appraiser.schedule.setDateAvailability.useMutation({
      onSuccess: () => {
        refetch();
        setShowAvailabilityModal(false);
        setSelectedDate(null);
        toast({
          title: "Availability updated",
          description: "Your availability for this date has been saved.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description:
            error.message || "Failed to update availability. Please try again.",
          variant: "destructive",
        });
      },
    });

  // Load saved schedule from query
  useEffect(() => {
    if (schedule?.preferredSchedule) {
      const saved = schedule.preferredSchedule as Record<string, unknown>;

      // Load weekly schedule
      const loadedWeekly: WeeklySchedule = { ...defaultSchedule };
      for (const day of ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]) {
        if (saved[day] && typeof saved[day] === "object") {
          loadedWeekly[day] = saved[day] as DaySchedule;
        }
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWeeklySchedule(loadedWeekly);

      // Load date overrides
      if (saved.dateOverrides && typeof saved.dateOverrides === "object") {
        setDateOverrides(saved.dateOverrides as Record<string, DaySchedule>);
      }
    }
  }, [schedule]);

  // Generate week days
  const getWeekDays = (date: Date): Date[] => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(currentWeek);
  const today = new Date();

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
      return newDate;
    });
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Map active jobs to scheduled jobs format
  const scheduledJobs = (activeJobs || []).map((job) => ({
    id: job.id,
    date: job.slaDueAt ? new Date(job.slaDueAt) : new Date(),
    time: job.slaDueAt
      ? new Date(job.slaDueAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      : "TBD",
    address: job.property?.addressLine1 || "Unknown",
    city: job.property?.city || "",
    type: job.jobType?.replace("_", " ") || "Inspection",
  }));

  // Get availability for a specific date (check overrides first, then weekly)
  const getAvailabilityForDate = (date: Date): DaySchedule => {
    const dateKey = date.toISOString().split("T")[0];
    if (dateOverrides[dateKey]) {
      return dateOverrides[dateKey];
    }
    const dayName = dayNames[date.getDay()];
    return weeklySchedule[dayName] || { isAvailable: false };
  };

  const handleOpenDayModal = (date: Date) => {
    setSelectedDate(date);
    const availability = getAvailabilityForDate(date);
    setFormStartTime(availability.startTime || "08:00");
    setFormEndTime(availability.endTime || "18:00");
    setFormUnavailable(!availability.isAvailable);
    setShowAvailabilityModal(true);
  };

  const handleSaveDateAvailability = () => {
    if (!selectedDate) return;

    // Validate time range
    if (!formUnavailable && formStartTime >= formEndTime) {
      toast({
        title: "Invalid time range",
        description: "Start time must be before end time.",
        variant: "destructive",
      });
      return;
    }

    const dateKey = selectedDate.toISOString().split("T")[0];
    setDateAvailability.mutate({
      date: dateKey,
      isAvailable: !formUnavailable,
      startTime: formUnavailable ? undefined : formStartTime,
      endTime: formUnavailable ? undefined : formEndTime,
    });
  };

  const handleSaveWeeklySchedule = () => {
    // Validate all time ranges
    for (const day of dayNames) {
      const daySchedule = weeklySchedule[day];
      if (
        daySchedule?.isAvailable &&
        daySchedule.startTime &&
        daySchedule.endTime
      ) {
        if (daySchedule.startTime >= daySchedule.endTime) {
          toast({
            title: "Invalid time range",
            description: `${day}: Start time must be before end time.`,
            variant: "destructive",
          });
          return;
        }
      }
    }
    setWeeklyAvailability.mutate({ schedule: weeklySchedule });
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Loading state
  if (isLoading && !schedule) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-[var(--secondary)] rounded mb-2" />
            <div className="h-4 w-64 bg-[var(--secondary)] rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-36 bg-[var(--secondary)] rounded-lg" />
            <div className="h-10 w-36 bg-[var(--secondary)] rounded-lg" />
          </div>
        </div>

        {/* Week navigation skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 bg-[var(--secondary)] rounded-lg" />
          <div className="h-6 w-64 bg-[var(--secondary)] rounded" />
          <div className="h-10 w-10 bg-[var(--secondary)] rounded-lg" />
        </div>

        {/* Calendar grid skeleton - scrollable on mobile */}
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-x-auto">
          <div className="grid grid-cols-7 min-w-[700px]">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="border-r border-b border-[var(--border)] last:border-r-0"
              >
                <div className="p-3 text-center border-b border-[var(--border)]">
                  <div className="h-3 w-8 bg-[var(--secondary)] rounded mx-auto mb-2" />
                  <div className="h-6 w-8 bg-[var(--secondary)] rounded mx-auto" />
                </div>
                <div className="min-h-[120px] p-2 space-y-2">
                  <div className="h-12 bg-[var(--secondary)] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming appointments skeleton */}
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <div className="h-5 w-48 bg-[var(--secondary)] rounded" />
          </div>
          <div className="divide-y divide-[var(--border)]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--secondary)] rounded-lg" />
                  <div>
                    <div className="h-4 w-48 bg-[var(--secondary)] rounded mb-2" />
                    <div className="h-3 w-32 bg-[var(--secondary)] rounded" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 w-24 bg-[var(--secondary)] rounded mb-2" />
                  <div className="h-3 w-16 bg-[var(--secondary)] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError && !schedule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
          Unable to load schedule
        </h2>
        <p className="text-[var(--muted-foreground)] text-center max-w-md mb-6">
          We couldn&apos;t load your schedule data. Please check your connection
          and try again.
        </p>
        <button
          onClick={() => refetch()}
          className="px-6 py-3 bg-[var(--primary)] text-black font-medium rounded-lg hover:bg-[var(--primary)]/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Schedule
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Manage your availability and appointments
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowWeeklySettingsModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
          >
            <Settings className="w-4 h-4" />
            Weekly Settings
          </button>
          <button
            onClick={() => handleOpenDayModal(today)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-black font-medium rounded-lg hover:bg-[var(--primary)]/90"
          >
            <Clock className="w-4 h-4" />
            Set Availability
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateWeek("prev")}
          className="p-2 hover:bg-[var(--muted)] rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-lg font-semibold text-[var(--foreground)]">
          {monthNames[weekDays[0].getMonth()]} {weekDays[0].getDate()} -{" "}
          {monthNames[weekDays[6].getMonth()]} {weekDays[6].getDate()},{" "}
          {weekDays[0].getFullYear()}
        </div>
        <button
          onClick={() => navigateWeek("next")}
          className="p-2 hover:bg-[var(--muted)] rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile scroll hint */}
      <p className="text-xs text-[var(--muted-foreground)] text-center md:hidden mb-2">
        Swipe to see all days
      </p>

      {/* Week View - horizontally scrollable on mobile */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-x-auto">
        <div className="grid grid-cols-7 min-w-[700px]">
          {weekDays.map((day, index) => {
            const isToday = day.toDateString() === today.toDateString();
            const isPast = day < today && !isToday;
            const dayAvailability = getAvailabilityForDate(day);
            const dayJobs = scheduledJobs.filter(
              (job) => job.date.toDateString() === day.toDateString(),
            );

            return (
              <div
                key={index}
                onClick={() => !isPast && handleOpenDayModal(day)}
                className={`border-r border-b border-[var(--border)] last:border-r-0 cursor-pointer transition-colors ${
                  isPast
                    ? "bg-[var(--secondary)] cursor-not-allowed"
                    : "hover:bg-[var(--secondary)]/50"
                }`}
              >
                {/* Day Header */}
                <div
                  className={`p-3 text-center border-b border-[var(--border)] ${
                    isToday ? "bg-[var(--primary)] text-black font-medium" : ""
                  }`}
                >
                  <p
                    className={`text-xs ${isToday ? "text-white/70" : "text-[var(--muted-foreground)]"}`}
                  >
                    {dayNames[index]}
                  </p>
                  <p
                    className={`text-lg font-bold ${isToday ? "text-white" : "text-[var(--foreground)]"}`}
                  >
                    {day.getDate()}
                  </p>
                  {!isPast && dayAvailability.isAvailable && (
                    <p className="text-xs text-green-400">
                      {
                        formatTime(dayAvailability.startTime || "08:00").split(
                          " ",
                        )[0]
                      }
                      -
                      {
                        formatTime(dayAvailability.endTime || "18:00").split(
                          " ",
                        )[0]
                      }
                    </p>
                  )}
                  {!isPast && !dayAvailability.isAvailable && (
                    <p className="text-xs text-red-400">Unavailable</p>
                  )}
                </div>

                {/* Day Content */}
                <div className="min-h-[120px] p-2 space-y-1">
                  {dayJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-2 bg-[var(--primary)]/20 rounded text-xs cursor-pointer hover:bg-[var(--primary)]/30"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="font-semibold text-[var(--primary)]">
                        {job.time}
                      </p>
                      <p className="text-[var(--primary)]/80 truncate">
                        {job.address}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--foreground)]">
            Upcoming Appointments
          </h2>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {scheduledJobs.length === 0 ? (
            <div className="p-8 text-center text-[var(--muted-foreground)]">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
              <p>No upcoming appointments</p>
            </div>
          ) : (
            scheduledJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--primary)]/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {job.address}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {job.city} - {job.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[var(--foreground)]">
                    {dayNames[job.date.getDay()]},{" "}
                    {monthNames[job.date.getMonth()]} {job.date.getDate()}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {job.time}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Weekly Availability Summary */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--foreground)]">
            Default Weekly Availability
          </h2>
          <button
            onClick={() => setShowWeeklySettingsModal(true)}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="space-y-3">
          {dayNames.map((day) => {
            const daySchedule = weeklySchedule[day];
            return (
              <div key={day} className="flex items-center justify-between py-2">
                <span className="font-medium text-[var(--foreground)] w-20">
                  {day}
                </span>
                {!daySchedule?.isAvailable ? (
                  <span className="text-[var(--muted-foreground)]">
                    Not Available
                  </span>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="text-[var(--foreground)]">
                      {formatTime(daySchedule.startTime || "08:00")} -{" "}
                      {formatTime(daySchedule.endTime || "18:00")}
                    </span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Available
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Set Availability Modal (for specific date) */}
      {showAvailabilityModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  Set Availability
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}
                  , {selectedDate.getFullYear()}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAvailabilityModal(false);
                  setSelectedDate(null);
                }}
                className="p-2 hover:bg-[var(--muted)] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formUnavailable}
                    onChange={(e) => setFormUnavailable(e.target.checked)}
                    className="w-4 h-4 text-[var(--primary)] rounded"
                  />
                  <span className="text-sm text-[var(--foreground)]">
                    Mark as unavailable
                  </span>
                </label>
              </div>
              {!formUnavailable && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--card)] text-[var(--foreground)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--card)] text-[var(--foreground)]"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-4 border-t border-[var(--border)]">
              <button
                onClick={() => {
                  setShowAvailabilityModal(false);
                  setSelectedDate(null);
                }}
                className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDateAvailability}
                disabled={setDateAvailability.isPending}
                className="flex-1 px-4 py-2 bg-[var(--primary)] text-black font-medium rounded-lg hover:bg-[var(--primary)]/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {setDateAvailability.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Settings Modal */}
      {showWeeklySettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-lg w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Weekly Availability Settings
              </h2>
              <button
                onClick={() => setShowWeeklySettingsModal(false)}
                className="p-2 hover:bg-[var(--muted)] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {dayNames.map((day) => {
                const daySchedule = weeklySchedule[day] || {
                  isAvailable: false,
                };
                return (
                  <div
                    key={day}
                    className="border border-[var(--border)] rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-[var(--foreground)]">
                        {day}
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={daySchedule.isAvailable}
                          onChange={(e) => {
                            setWeeklySchedule({
                              ...weeklySchedule,
                              [day]: {
                                ...daySchedule,
                                isAvailable: e.target.checked,
                                startTime: e.target.checked
                                  ? daySchedule.startTime || "08:00"
                                  : undefined,
                                endTime: e.target.checked
                                  ? daySchedule.endTime || "18:00"
                                  : undefined,
                              },
                            });
                          }}
                          className="w-4 h-4 text-[var(--primary)] rounded"
                        />
                        <span className="text-sm text-[var(--foreground)]">
                          Available
                        </span>
                      </label>
                    </div>
                    {daySchedule.isAvailable && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-[var(--muted-foreground)] mb-1">
                            Start
                          </label>
                          <input
                            type="time"
                            value={daySchedule.startTime || "08:00"}
                            onChange={(e) => {
                              setWeeklySchedule({
                                ...weeklySchedule,
                                [day]: {
                                  ...daySchedule,
                                  startTime: e.target.value,
                                },
                              });
                            }}
                            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--muted-foreground)] mb-1">
                            End
                          </label>
                          <input
                            type="time"
                            value={daySchedule.endTime || "18:00"}
                            onChange={(e) => {
                              setWeeklySchedule({
                                ...weeklySchedule,
                                [day]: {
                                  ...daySchedule,
                                  endTime: e.target.value,
                                },
                              });
                            }}
                            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 p-4 border-t border-[var(--border)]">
              <button
                onClick={() => setShowWeeklySettingsModal(false)}
                className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWeeklySchedule}
                disabled={setWeeklyAvailability.isPending}
                className="flex-1 px-4 py-2 bg-[var(--primary)] text-black font-medium rounded-lg hover:bg-[var(--primary)]/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {setWeeklyAvailability.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Weekly Schedule"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
