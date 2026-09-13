import React from "react";
import { Priority, Status } from "@/lib/types";

const PRIORITY_STYLES: Record<Priority, string> = {
  high: "bg-crimson-50 text-crimson border-crimson/20",
  medium: "bg-amber-50 text-amber-800 border-amber-200",
  low: "bg-ink-faint/10 text-ink-soft border-line",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[priority]}`}>
      {priority}
    </span>
  );
}

const STATUS_STYLES: Record<Status, string> = {
  "not-started": "bg-ink-faint/10 text-ink-soft",
  "in-progress": "bg-crimson-50 text-crimson",
  completed: "bg-positive/10 text-positive",
};

const STATUS_LABEL: Record<Status, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  completed: "Completed",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function SampleBadge() {
  return (
    <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border border-line text-ink-faint tracking-wide">
      SAMPLE
    </span>
  );
}
