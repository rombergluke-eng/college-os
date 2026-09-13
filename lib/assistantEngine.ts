import { Assignment, CalendarEvent, ClassItem, Task } from "./types";
import {
  formatFriendlyDate,
  formatTime,
  isDueThisWeek,
  isDueToday,
  isDueTomorrow,
  isOverdue,
} from "./dateUtils";
import { buildWhatShouldIDo, findNextEvent, rankedPriorityList } from "./priority";

export interface AssistantContext {
  assignments: Assignment[];
  tasks: Task[];
  events: CalendarEvent[];
  classes: ClassItem[];
  userName: string;
}

function className(classes: ClassItem[], id: string | null): string {
  if (!id) return "";
  return classes.find((c) => c.id === id)?.name ?? "";
}

function listDueThisWeek(ctx: AssistantContext): string {
  const now = new Date();
  const assignments = ctx.assignments.filter(
    (a) => a.status !== "completed" && (isDueThisWeek(a.dueDate, now) || isOverdue(a.dueDate, now))
  );
  const tasks = ctx.tasks.filter(
    (t) => t.status !== "completed" && (isDueThisWeek(t.deadline, now) || isOverdue(t.deadline, now))
  );
  if (assignments.length === 0 && tasks.length === 0) {
    return "Nothing is due this week — you're clear.";
  }
  const lines: string[] = [];
  if (assignments.length) {
    lines.push(
      "Assignments: " +
        assignments
          .map((a) => `${a.name} (${formatFriendlyDate(a.dueDate)}${className(ctx.classes, a.classId) ? `, ${className(ctx.classes, a.classId)}` : ""})`)
          .join("; ")
    );
  }
  if (tasks.length) {
    lines.push("Tasks: " + tasks.map((t) => `${t.title} (${formatFriendlyDate(t.deadline)})`).join("; "));
  }
  return lines.join("\n");
}

function fallingBehind(ctx: AssistantContext): string {
  const now = new Date();
  const overdueAssignments = ctx.assignments.filter((a) => a.status !== "completed" && isOverdue(a.dueDate, now));
  const overdueTasks = ctx.tasks.filter((t) => t.status !== "completed" && isOverdue(t.deadline, now));
  if (overdueAssignments.length === 0 && overdueTasks.length === 0) {
    return "You're not behind on anything tracked here — nothing overdue right now.";
  }
  const parts: string[] = [];
  if (overdueAssignments.length) {
    parts.push(`${overdueAssignments.length} overdue assignment${overdueAssignments.length > 1 ? "s" : ""}: ${overdueAssignments.map((a) => a.name).join(", ")}`);
  }
  if (overdueTasks.length) {
    parts.push(`${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}: ${overdueTasks.map((t) => t.title).join(", ")}`);
  }
  return `Yes — ${parts.join("; and ")}. Worth tackling one of these next.`;
}

function scheduleConflicts(ctx: AssistantContext): string {
  const sorted = [...ctx.events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const conflicts: string[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (new Date(a.end).getTime() > new Date(b.start).getTime()) {
      conflicts.push(`"${a.title}" overlaps with "${b.title}" around ${formatTime(b.start)}`);
    }
  }
  if (conflicts.length === 0) return "No schedule conflicts found on your calendar.";
  return "Found a conflict: " + conflicts.join("; ");
}

function planMyDay(ctx: AssistantContext): string {
  const now = new Date();
  const todaysEvents = ctx.events
    .filter((e) => new Date(e.start).toDateString() === now.toDateString())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const scheduleLine = todaysEvents.length
    ? "Today: " + todaysEvents.map((e) => `${formatTime(e.start)} ${e.title}`).join(", ")
    : "Nothing fixed on today's calendar.";
  const recommendation = buildWhatShouldIDo(ctx.assignments, ctx.tasks, ctx.events, now);
  return `${scheduleLine}\n\n${recommendation}`;
}

function marketBriefing(): string {
  return "Check the Finance tab for today's market snapshot and your watchlist. I can talk through specific numbers once you're looking at that page — this chat doesn't have live market data wired in yet.";
}

function studyHelp(ctx: AssistantContext): string {
  return "Head to the Study tab to build a plan: enter the exam, date, topics, your confidence in each, and how much time you have per day. The planner will weight weaker topics more heavily as the exam gets closer.";
}

function findFreeBlock(ctx: AssistantContext, minutesNeeded: number): string {
  const now = new Date();
  const today = ctx.events
    .filter((e) => new Date(e.start).toDateString() === now.toDateString() && new Date(e.end).getTime() > now.getTime())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  let cursor = now;
  for (const e of today) {
    const gapMinutes = (new Date(e.start).getTime() - cursor.getTime()) / 60000;
    if (gapMinutes >= minutesNeeded) {
      return `You have a ${Math.round(gapMinutes)}-minute window from ${formatTime(cursor.toISOString())} to ${formatTime(e.start)} — enough for what you need.`;
    }
    cursor = new Date(e.end);
  }
  const endOfDay = new Date(now);
  endOfDay.setHours(22, 0, 0, 0);
  const finalGap = (endOfDay.getTime() - cursor.getTime()) / 60000;
  if (finalGap >= minutesNeeded) {
    return `Your evening is open after ${formatTime(cursor.toISOString())} — that gives you a ${Math.round(finalGap)}-minute block.`;
  }
  return "Today looks packed — I couldn't find a block that long. Tomorrow might be a better bet.";
}

/**
 * Very small pattern matcher over common dashboard questions. Returns null
 * if nothing matched, so the caller can fall back to a generic response
 * (or, if configured, hand the question to a real model).
 */
export function answerLocally(question: string, ctx: AssistantContext): string | null {
  const q = question.toLowerCase();

  if (/what should i do|priorit/i.test(q)) {
    return buildWhatShouldIDo(ctx.assignments, ctx.tasks, ctx.events, new Date());
  }
  if (/due this week|what'?s due/i.test(q)) {
    return listDueThisWeek(ctx);
  }
  if (/falling behind|behind on/i.test(q)) {
    return fallingBehind(ctx);
  }
  if (/conflict/i.test(q)) {
    return scheduleConflicts(ctx);
  }
  if (/plan my day/i.test(q)) {
    return planMyDay(ctx);
  }
  if (/market brief|biggest business stor|market overview/i.test(q)) {
    return marketBriefing();
  }
  if (/study/i.test(q) && /exam|help/i.test(q)) {
    return studyHelp(ctx);
  }
  const blockMatch = q.match(/(\d+)\s*(hour|hr|minute|min)/);
  if (/find.*block|free time|open time/i.test(q) || blockMatch) {
    let minutes = 120;
    if (blockMatch) {
      const num = parseInt(blockMatch[1], 10);
      minutes = blockMatch[2].startsWith("hour") || blockMatch[2] === "hr" ? num * 60 : num;
    }
    return findFreeBlock(ctx, minutes);
  }
  if (/what'?s coming up|this week/i.test(q)) {
    return listDueThisWeek(ctx);
  }
  if (/next class|next event/i.test(q)) {
    const next = findNextEvent(ctx.events);
    return next ? `Your next event is "${next.title}" at ${formatTime(next.start)} (${next.location}).` : "Nothing left on today's calendar.";
  }
  if (/top priorit|ranked/i.test(q)) {
    const ranked = rankedPriorityList(ctx.assignments, ctx.tasks, new Date(), 5);
    if (!ranked.length) return "Nothing urgent right now.";
    return ranked.map((r, i) => `${i + 1}. ${r.title} (${formatFriendlyDate(r.dueLabel)})`).join("\n");
  }

  return null;
}

export const SUGGESTED_PROMPTS = [
  "What should I do right now?",
  "What's due this week?",
  "Do I have any schedule conflicts?",
  "Plan my day.",
  "Am I falling behind on anything?",
  "Find me a two hour block today.",
];
