import { EventType } from "./types";

export const EVENT_TYPE_DOT: Record<EventType, string> = {
  class: "bg-crimson",
  meeting: "bg-amber-500",
  study: "bg-emerald-600",
  personal: "bg-sky-500",
  deadline: "bg-ink",
};

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  class: "Class",
  meeting: "Meeting",
  study: "Study block",
  personal: "Personal",
  deadline: "Deadline",
};

export const EVENT_TYPE_BADGE: Record<EventType, string> = {
  class: "bg-crimson-50 text-crimson",
  meeting: "bg-amber-50 text-amber-800",
  study: "bg-emerald-50 text-emerald-700",
  personal: "bg-sky-50 text-sky-700",
  deadline: "bg-ink/10 text-ink",
};
