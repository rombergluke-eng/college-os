import { Assignment, CalendarEvent, Priority, Task } from "./types";
import { daysUntil, isOverdue, minutesUntil } from "./dateUtils";

const PRIORITY_WEIGHT: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Higher score = do this sooner.
 * Combines urgency (days until due), stated importance, and how much
 * work is left, so a big high-priority item due soon rises to the top
 * without small low-priority items getting buried forever.
 */
export function assignmentScore(a: Assignment, now: Date = new Date()): number {
  if (a.status === "completed") return -1;
  const days = daysUntil(a.dueDate, now);
  const overdue = isOverdue(a.dueDate, now);
  const urgency = overdue ? 12 : days === null ? 0 : Math.max(0, 10 - days);
  const importance = PRIORITY_WEIGHT[a.priority] * 3;
  const effortFactor = Math.min(a.estimatedMinutes / 60, 4) * 0.75;
  const progressPenaltyRelief = a.status === "in-progress" ? 1.5 : 0;
  return urgency * 2 + importance + effortFactor + progressPenaltyRelief;
}

export function taskScore(t: Task, now: Date = new Date()): number {
  if (t.status === "completed") return -1;
  const days = daysUntil(t.deadline, now);
  const overdue = isOverdue(t.deadline, now);
  const urgency = overdue ? 10 : days === null ? 1 : Math.max(0, 8 - days);
  const importance = PRIORITY_WEIGHT[t.priority] * 2.5;
  return urgency * 2 + importance;
}

export function sortAssignmentsByPriority(list: Assignment[], now: Date = new Date()): Assignment[] {
  return [...list]
    .filter((a) => a.status !== "completed")
    .sort((a, b) => assignmentScore(b, now) - assignmentScore(a, now));
}

export function sortTasksByPriority(list: Task[], now: Date = new Date()): Task[] {
  return [...list]
    .filter((t) => t.status !== "completed")
    .sort((a, b) => taskScore(b, now) - taskScore(a, now));
}

export interface RankedItem {
  kind: "assignment" | "task";
  id: string;
  title: string;
  score: number;
  estimatedMinutes: number;
  dueLabel: string;
}

export function rankedPriorityList(
  assignments: Assignment[],
  tasks: Task[],
  now: Date = new Date(),
  limit = 5
): RankedItem[] {
  const items: RankedItem[] = [
    ...assignments
      .filter((a) => a.status !== "completed")
      .map((a) => ({
        kind: "assignment" as const,
        id: a.id,
        title: a.name,
        score: assignmentScore(a, now),
        estimatedMinutes: a.estimatedMinutes,
        dueLabel: a.dueDate,
      })),
    ...tasks
      .filter((t) => t.status !== "completed")
      .map((t) => ({
        kind: "task" as const,
        id: t.id,
        title: t.title,
        score: taskScore(t, now),
        estimatedMinutes: t.estimatedMinutes,
        dueLabel: t.deadline ?? "",
      })),
  ];
  return items.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function findNextEvent(events: CalendarEvent[], now: Date = new Date()): CalendarEvent | null {
  const upcoming = events
    .filter((e) => new Date(e.start).getTime() > now.getTime())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  return upcoming[0] ?? null;
}

/**
 * Builds the "What should I do?" recommendation: looks at minutes until the
 * next calendar event, and allocates that window across the top-ranked
 * work items proportionally to their estimated time.
 */
export function buildWhatShouldIDo(
  assignments: Assignment[],
  tasks: Task[],
  events: CalendarEvent[],
  now: Date = new Date()
): string {
  const ranked = rankedPriorityList(assignments, tasks, now, 3);
  if (ranked.length === 0) {
    return "You're all caught up — nothing urgent is on your list. Good time to get ahead on reading or add your next assignment.";
  }

  const nextEvent = findNextEvent(events, now);
  const minsAvailable = nextEvent ? minutesUntil(nextEvent.start, now) : null;

  if (minsAvailable !== null && minsAvailable > 0 && minsAvailable < 8 * 60) {
    let remaining = minsAvailable;
    const allocations: string[] = [];
    for (const item of ranked) {
      if (remaining <= 10) break;
      const chunk = Math.min(item.estimatedMinutes, Math.max(15, Math.round(remaining * 0.6)));
      const use = Math.min(chunk, remaining);
      allocations.push(`${use} minutes on ${item.title}`);
      remaining -= use;
    }
    const hours = Math.floor(minsAvailable / 60);
    const mins = minsAvailable % 60;
    const windowLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;
    return `You have ${windowLabel} before "${nextEvent?.title}". Spend ${allocations.join(", then ")}.`;
  }

  const top = ranked[0];
  return `Your top priority right now is "${top.title}" — it's the most urgent thing on your plate. Budget about ${top.estimatedMinutes} minutes for it.`;
}
