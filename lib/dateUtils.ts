import {
  differenceInCalendarDays,
  differenceInMinutes,
  format,
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
  parseISO,
  startOfDay,
} from "date-fns";

export function safeParseISO(value: string | null | undefined): Date | null {
  if (!value) return null;
  try {
    const d = parseISO(value);
    if (isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}

export function daysUntil(dateStr: string | null | undefined, now: Date = new Date()): number | null {
  const d = safeParseISO(dateStr);
  if (!d) return null;
  return differenceInCalendarDays(startOfDay(d), startOfDay(now));
}

export function minutesUntil(dateStr: string | null | undefined, now: Date = new Date()): number | null {
  const d = safeParseISO(dateStr);
  if (!d) return null;
  return differenceInMinutes(d, now);
}

export function isOverdue(dateStr: string | null | undefined, now: Date = new Date()): boolean {
  const d = safeParseISO(dateStr);
  if (!d) return false;
  return isBefore(d, startOfDay(now)) && !isToday(d);
}

export function isDueToday(dateStr: string | null | undefined): boolean {
  const d = safeParseISO(dateStr);
  return d ? isToday(d) : false;
}

export function isDueTomorrow(dateStr: string | null | undefined): boolean {
  const d = safeParseISO(dateStr);
  return d ? isTomorrow(d) : false;
}

export function isDueThisWeek(dateStr: string | null | undefined, now: Date = new Date()): boolean {
  const days = daysUntil(dateStr, now);
  return days !== null && days >= 0 && days <= 7;
}

export function formatFriendlyDate(dateStr: string | null | undefined): string {
  const d = safeParseISO(dateStr);
  if (!d) return "No date";
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEE, MMM d");
}

export function formatTime(dateStr: string | null | undefined): string {
  const d = safeParseISO(dateStr);
  if (!d) return "";
  return format(d, "h:mm a");
}

export function formatDateInput(dateStr: string | null | undefined): string {
  const d = safeParseISO(dateStr);
  if (!d) return "";
  return format(d, "yyyy-MM-dd");
}

export function isFuture(dateStr: string | null | undefined, now: Date = new Date()): boolean {
  const d = safeParseISO(dateStr);
  return d ? isAfter(d, now) : false;
}

export function greetingForHour(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
