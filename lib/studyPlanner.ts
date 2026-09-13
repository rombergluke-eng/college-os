import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";
import { StudyPlan } from "./types";

export interface DayPlan {
  date: string; // ISO date
  isReviewDay: boolean;
  blocks: { topic: string; minutes: number }[];
}

/**
 * Weight is inverse of confidence: a topic rated 1 (low confidence) gets
 * roughly 5x the attention of a topic rated 5 (high confidence). The final
 * day before the exam becomes a review day touching every topic briefly.
 */
export function generateStudyPlan(plan: StudyPlan, now: Date = new Date()): DayPlan[] {
  const examDay = startOfDay(new Date(plan.examDate));
  const today = startOfDay(now);
  const totalDays = Math.max(1, differenceInCalendarDays(examDay, today));
  const studyDays = Math.max(1, totalDays - 1); // reserve the last day for review
  const topics = plan.topics.length > 0 ? plan.topics : [{ name: "General review", confidence: 3 }];

  const weights = topics.map((t) => Math.max(1, 6 - t.confidence));
  const weightSum = weights.reduce((a, b) => a + b, 0);

  const days: DayPlan[] = [];
  for (let i = 0; i < studyDays; i++) {
    const date = addDays(today, i).toISOString();
    const blocks = topics
      .map((t, idx) => ({
        topic: t.name,
        minutes: Math.round((weights[idx] / weightSum) * plan.availableMinutesPerDay),
      }))
      .filter((b) => b.minutes > 0);
    days.push({ date, isReviewDay: false, blocks });
  }

  if (totalDays >= 1) {
    const reviewMinutesEach = Math.max(10, Math.round(plan.availableMinutesPerDay / topics.length));
    days.push({
      date: addDays(today, totalDays - 1).toISOString(),
      isReviewDay: true,
      blocks: topics.map((t) => ({ topic: t.name, minutes: reviewMinutesEach })),
    });
  }

  return days;
}
