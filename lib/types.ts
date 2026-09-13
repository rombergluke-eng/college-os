export type Priority = "low" | "medium" | "high";
export type Status = "not-started" | "in-progress" | "completed";

export interface Assignment {
  id: string;
  name: string;
  classId: string | null;
  description: string;
  dueDate: string; // ISO date string
  priority: Priority;
  estimatedMinutes: number;
  status: Status;
  notes: string;
  sample?: boolean;
}

export type TaskCategory = "personal" | "school" | "career" | "health" | "other";
export type Recurrence = "none" | "daily" | "weekly";

export interface Task {
  id: string;
  title: string;
  deadline: string | null; // ISO date string
  priority: Priority;
  estimatedMinutes: number;
  status: Status;
  category: TaskCategory;
  recurrence: Recurrence;
  sample?: boolean;
}

export interface MeetingTime {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  start: string; // "14:00"
  end: string; // "15:15"
}

export interface ImportantDate {
  label: string;
  date: string; // ISO date string
}

export interface ClassItem {
  id: string;
  name: string;
  professor: string;
  meetingTimes: MeetingTime[];
  location: string;
  syllabusText: string;
  notes: string;
  importantDates: ImportantDate[];
  sample?: boolean;
}

export type EventType = "class" | "meeting" | "study" | "personal" | "deadline";

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  start: string; // ISO datetime
  end: string; // ISO datetime
  location: string;
  people?: string[];
  agenda?: string;
  notes?: string;
  followUps?: string[];
  sample?: boolean;
}

export interface WatchlistItem {
  symbol: string;
}

export interface StudyTopic {
  name: string;
  confidence: number; // 1-5
}

export interface StudyPlan {
  id: string;
  examName: string;
  classId: string | null;
  examDate: string; // ISO date
  topics: StudyTopic[];
  availableMinutesPerDay: number;
  sample?: boolean;
}

export interface AppSettings {
  userName: string;
  watchlist: string[];
  googleCalendarConnected: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
