import { addDays, setHours, setMinutes, startOfDay } from "date-fns";
import {
  Assignment,
  CalendarEvent,
  ClassItem,
  StudyPlan,
  Task,
} from "./types";

function at(dayOffset: number, hour: number, minute = 0): string {
  const base = startOfDay(addDays(new Date(), dayOffset));
  return setMinutes(setHours(base, hour), minute).toISOString();
}

function dateOnly(dayOffset: number): string {
  return startOfDay(addDays(new Date(), dayOffset)).toISOString();
}

export const SAMPLE_CLASSES: ClassItem[] = [
  {
    id: "cls-fin300",
    name: "FIN-K 300: Financial Management",
    professor: "Prof. R. Alvarez",
    meetingTimes: [
      { day: "Mon", start: "14:00", end: "15:15" },
      { day: "Wed", start: "14:00", end: "15:15" },
    ],
    location: "Hodge Hall 1020",
    syllabusText: "",
    notes: "Midterm covers chapters 1-6. Office hours Tue 1-2pm.",
    importantDates: [
      { label: "Midterm 1", date: dateOnly(9) },
      { label: "Case study due", date: dateOnly(3) },
    ],
    sample: true,
  },
  {
    id: "cls-bus200",
    name: "BUS-A 200: Foundations of Accounting",
    professor: "Prof. L. Chen",
    meetingTimes: [
      { day: "Tue", start: "09:30", end: "10:45" },
      { day: "Thu", start: "09:30", end: "10:45" },
    ],
    location: "Hodge Hall 2075",
    syllabusText: "",
    notes: "Weekly problem sets due Sundays at 11:59pm.",
    importantDates: [{ label: "Exam 2", date: dateOnly(14) }],
    sample: true,
  },
  {
    id: "cls-econ251",
    name: "ECON-E 251: Microeconomics",
    professor: "Prof. D. Okafor",
    meetingTimes: [
      { day: "Mon", start: "11:15", end: "12:30" },
      { day: "Wed", start: "11:15", end: "12:30" },
      { day: "Fri", start: "11:15", end: "12:05" },
    ],
    location: "Woodburn Hall 101",
    syllabusText: "",
    notes: "",
    importantDates: [{ label: "Problem Set 4 due", date: dateOnly(1) }],
    sample: true,
  },
];

export const SAMPLE_ASSIGNMENTS: Assignment[] = [
  {
    id: "asg-1",
    name: "Case study: Capital budgeting",
    classId: "cls-fin300",
    description: "Analyze NPV/IRR for the Baldwin case and submit a 3-page writeup.",
    dueDate: dateOnly(3),
    priority: "high",
    estimatedMinutes: 180,
    status: "in-progress",
    notes: "Need to pull WACC figures from lecture 8 slides.",
    sample: true,
  },
  {
    id: "asg-2",
    name: "Accounting problem set 6",
    classId: "cls-bus200",
    description: "Chapter 9 exercises 1-12.",
    dueDate: dateOnly(1),
    priority: "medium",
    estimatedMinutes: 90,
    status: "not-started",
    notes: "",
    sample: true,
  },
  {
    id: "asg-3",
    name: "Microeconomics problem set 4",
    classId: "cls-econ251",
    description: "Elasticity and consumer surplus problems.",
    dueDate: dateOnly(1),
    priority: "medium",
    estimatedMinutes: 60,
    status: "not-started",
    notes: "",
    sample: true,
  },
  {
    id: "asg-4",
    name: "Reading response: Chapter 6",
    classId: "cls-fin300",
    description: "One-paragraph reflection on bond valuation reading.",
    dueDate: dateOnly(-1),
    priority: "low",
    estimatedMinutes: 20,
    status: "not-started",
    notes: "Overdue - submit late for partial credit.",
    sample: true,
  },
  {
    id: "asg-5",
    name: "Group project proposal",
    classId: "cls-bus200",
    description: "One-page proposal outlining the semester audit project.",
    dueDate: dateOnly(6),
    priority: "high",
    estimatedMinutes: 45,
    status: "not-started",
    notes: "Coordinate with group over GroupMe first.",
    sample: true,
  },
];

export const SAMPLE_TASKS: Task[] = [
  {
    id: "tsk-1",
    title: "Finish Kelley Consulting Group application",
    deadline: dateOnly(0),
    priority: "high",
    estimatedMinutes: 60,
    status: "in-progress",
    category: "career",
    recurrence: "none",
    sample: true,
  },
  {
    id: "tsk-2",
    title: "Gym - leg day",
    deadline: dateOnly(0),
    priority: "low",
    estimatedMinutes: 60,
    status: "not-started",
    category: "health",
    recurrence: "weekly",
    sample: true,
  },
  {
    id: "tsk-3",
    title: "Reply to club officer emails",
    deadline: dateOnly(2),
    priority: "medium",
    estimatedMinutes: 20,
    status: "not-started",
    category: "school",
    recurrence: "none",
    sample: true,
  },
  {
    id: "tsk-4",
    title: "Plan weekend trip logistics",
    deadline: dateOnly(4),
    priority: "low",
    estimatedMinutes: 30,
    status: "not-started",
    category: "personal",
    recurrence: "none",
    sample: true,
  },
  {
    id: "tsk-5",
    title: "Weekly budget check-in",
    deadline: dateOnly(5),
    priority: "medium",
    estimatedMinutes: 15,
    status: "not-started",
    category: "personal",
    recurrence: "weekly",
    sample: true,
  },
];

export const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: "evt-1",
    title: "Financial Management",
    type: "class",
    start: at(0, 14, 0),
    end: at(0, 15, 15),
    location: "Hodge Hall 1020",
    sample: true,
  },
  {
    id: "evt-2",
    title: "Microeconomics",
    type: "class",
    start: at(0, 11, 15),
    end: at(0, 12, 30),
    location: "Woodburn Hall 101",
    sample: true,
  },
  {
    id: "evt-3",
    title: "Kelley Investment Club meeting",
    type: "meeting",
    start: at(0, 17, 0),
    end: at(0, 18, 0),
    location: "Hodge Hall 2100",
    people: ["Sam K.", "Priya R."],
    agenda: "Review portfolio performance and pitch two new stocks.",
    sample: true,
  },
  {
    id: "evt-4",
    title: "Study block: FIN-K 300 case study",
    type: "study",
    start: at(0, 19, 0),
    end: at(0, 20, 30),
    location: "Herman B Wells Library",
    sample: true,
  },
  {
    id: "evt-5",
    title: "Accounting problem set due",
    type: "deadline",
    start: at(1, 23, 59),
    end: at(1, 23, 59),
    location: "Canvas",
    sample: true,
  },
  {
    id: "evt-6",
    title: "Coffee with academic advisor",
    type: "personal",
    start: at(2, 10, 0),
    end: at(2, 10, 30),
    location: "Kelley School of Business",
    sample: true,
  },
];

export const SAMPLE_STUDY_PLANS: StudyPlan[] = [
  {
    id: "study-1",
    examName: "Midterm 1",
    classId: "cls-fin300",
    examDate: dateOnly(9),
    topics: [
      { name: "Time value of money", confidence: 4 },
      { name: "Capital budgeting (NPV/IRR)", confidence: 2 },
      { name: "Bond valuation", confidence: 3 },
      { name: "Risk and return", confidence: 2 },
    ],
    availableMinutesPerDay: 60,
    sample: true,
  },
];

export const DEFAULT_WATCHLIST = [
  "AAPL",
  "NVDA",
  "MSFT",
  "AMZN",
  "GOOGL",
  "META",
  "TSLA",
];
