"use client";

import React, { useMemo, useState } from "react";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Link2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { SampleBadge } from "@/components/ui/Badge";
import { formatTime } from "@/lib/dateUtils";
import { EVENT_TYPE_BADGE, EVENT_TYPE_LABEL } from "@/lib/eventStyles";
import { CalendarEvent } from "@/lib/types";

type ViewMode = "day" | "week";

export default function CalendarPage() {
  const { events, hydrated } = useStore();
  const [view, setView] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState(new Date());

  const weekStart = useMemo(() => startOfWeek(anchor, { weekStartsOn: 1 }), [anchor]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  function eventsFor(day: Date): CalendarEvent[] {
    return events
      .filter((e) => isSameDay(new Date(e.start), day))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }

  function shift(delta: number) {
    setAnchor((d) => addDays(d, view === "day" ? delta : delta * 7));
  }

  if (!hydrated) return <div className="text-ink-soft text-sm">Loading…</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">Calendar</h1>
          <p className="text-sm text-ink-soft">Read-only for now — nothing here is created, moved, or deleted automatically.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-line bg-paper">
            <button onClick={() => shift(-1)} className="p-2 hover:bg-cream rounded-l-md" aria-label="Previous">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setAnchor(new Date())} className="px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:bg-cream">
              Today
            </button>
            <button onClick={() => shift(1)} className="p-2 hover:bg-cream rounded-r-md" aria-label="Next">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex rounded-md border border-line bg-paper p-0.5">
            {(["day", "week"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded px-3 py-1 text-xs font-medium capitalize ${
                  view === v ? "bg-crimson text-white" : "text-ink-soft hover:bg-cream"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 rounded-md border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-crimson/40" title="Google Calendar sync arrives in Stage 2 — see Settings">
            <Link2 size={14} /> Connect Google
          </button>
        </div>
      </div>

      {view === "day" ? (
        <Card>
          <div className="mb-3 flex items-center gap-2 font-serif text-base font-semibold text-ink">
            <CalendarDays size={16} className="text-crimson" />
            {format(anchor, "EEEE, MMMM d")}
          </div>
          <DayList events={eventsFor(anchor)} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
          {weekDays.map((day) => (
            <Card key={day.toISOString()} className={isSameDay(day, new Date()) ? "border-crimson/40" : ""}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {format(day, "EEE d")}
              </div>
              <DayList events={eventsFor(day)} compact />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function DayList({ events, compact = false }: { events: CalendarEvent[]; compact?: boolean }) {
  if (events.length === 0) {
    return <p className="text-xs text-ink-faint">No events</p>;
  }
  return (
    <ul className="space-y-2.5">
      {events.map((e) => (
        <li key={e.id} className="border-l-2 border-crimson/30 pl-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${EVENT_TYPE_BADGE[e.type]}`}>
              {EVENT_TYPE_LABEL[e.type]}
            </span>
            {e.sample && <SampleBadge />}
          </div>
          <div className={`mt-1 font-medium text-ink ${compact ? "text-xs" : "text-sm"}`}>{e.title}</div>
          <div className="text-xs text-ink-soft font-mono">{formatTime(e.start)}</div>
          {!compact && e.location && <div className="text-xs text-ink-faint">{e.location}</div>}
        </li>
      ))}
    </ul>
  );
}
