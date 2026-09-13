"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  ListPlus,
  Newspaper,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardHeader } from "@/components/ui/Card";
import { PriorityBadge } from "@/components/ui/Badge";
import {
  formatFriendlyDate,
  formatTime,
  greetingForHour,
} from "@/lib/dateUtils";
import {
  buildWhatShouldIDo,
  findNextEvent,
  rankedPriorityList,
  sortAssignmentsByPriority,
} from "@/lib/priority";
import { EVENT_TYPE_DOT } from "@/lib/eventStyles";

interface NewsItem {
  title: string;
  source: string;
  link: string;
  category: string;
}
interface QuoteItem {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
}

export default function HomePage() {
  const { hydrated, userName, assignments, tasks, events, classes } = useStore();
  const [now, setNow] = useState(new Date());
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [news, setNews] = useState<NewsItem[] | null>(null);
  const [quotes, setQuotes] = useState<QuoteItem[] | null>(null);
  const [watchlist, setWatchlistLocal] = useState<string[]>([]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => setNews(d.items?.slice(0, 4) ?? []))
      .catch(() => setNews([]));
  }, []);

  const { watchlist: storeWatchlist } = useStore();
  useEffect(() => setWatchlistLocal(storeWatchlist), [storeWatchlist]);

  useEffect(() => {
    if (watchlist.length === 0) return;
    fetch(`/api/stocks?symbols=${watchlist.slice(0, 4).join(",")}`)
      .then((r) => r.json())
      .then((d) => setQuotes(d.quotes ?? []))
      .catch(() => setQuotes(null));
  }, [watchlist]);

  const nextEvent = useMemo(() => findNextEvent(events, now), [events, now]);
  const todaysEvents = useMemo(
    () =>
      events
        .filter((e) => new Date(e.start).toDateString() === now.toDateString())
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [events, now]
  );
  const topAssignments = useMemo(() => sortAssignmentsByPriority(assignments, now).slice(0, 4), [assignments, now]);
  const topTask = useMemo(() => rankedPriorityList(assignments, tasks, now, 1)[0], [assignments, tasks, now]);
  const ranked = useMemo(() => rankedPriorityList(assignments, tasks, now, 5), [assignments, tasks, now]);
  const recommendation = useMemo(() => buildWhatShouldIDo(assignments, tasks, events, now), [assignments, tasks, events, now]);

  function className(id: string | null) {
    return classes.find((c) => c.id === id)?.name ?? "";
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/assistant?q=${encodeURIComponent(query.trim())}`);
  }

  if (!hydrated) return <div className="text-ink-soft text-sm">Loading your dashboard…</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">
            {greetingForHour(now)}, {userName !== "there" ? userName : "there"}
          </h1>
          <p className="text-sm text-ink-soft mt-0.5">
            {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} ·{" "}
            {now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
          </p>
        </div>
        <form onSubmit={submitSearch} className="w-full md:w-80">
          <div className="flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 shadow-card">
            <Search size={16} className="text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask the AI Assistant anything…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
            />
          </div>
        </form>
      </div>

      {/* Top tiles */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-crimson/25">
          <div className="flex items-center gap-2 text-crimson text-xs font-medium uppercase tracking-wide">
            <CalendarClock size={14} /> Next up
          </div>
          {nextEvent ? (
            <div className="mt-2">
              <div className="font-serif text-base font-semibold text-ink">{nextEvent.title}</div>
              <div className="text-sm text-ink-soft mt-0.5">
                {formatTime(nextEvent.start)} · {nextEvent.location}
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-ink-soft">Nothing left on today's calendar.</div>
          )}
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-ink-soft text-xs font-medium uppercase tracking-wide">
            Top task
          </div>
          {topTask ? (
            <div className="mt-2">
              <div className="font-serif text-base font-semibold text-ink">{topTask.title}</div>
              <div className="text-sm text-ink-soft mt-0.5">Due {formatFriendlyDate(topTask.dueLabel)}</div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-ink-soft">Nothing urgent right now.</div>
          )}
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-ink-soft text-xs font-medium uppercase tracking-wide">
            Assignment due soon
          </div>
          {topAssignments[0] ? (
            <div className="mt-2">
              <div className="font-serif text-base font-semibold text-ink">{topAssignments[0].name}</div>
              <div className="text-sm text-ink-soft mt-0.5">
                {formatFriendlyDate(topAssignments[0].dueDate)}
                {className(topAssignments[0].classId) ? ` · ${className(topAssignments[0].classId)}` : ""}
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-ink-soft">No assignments on the books.</div>
          )}
        </Card>
      </div>

      {/* What should I do */}
      <Card className="border-crimson/20 bg-crimson-50/40">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-crimson text-white">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-crimson">What should I do?</div>
            <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-ink">{recommendation}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Today's schedule */}
          <Card>
            <CardHeader title="Today's schedule" action={<Link href="/calendar" className="text-xs text-crimson hover:underline">View calendar</Link>} />
            {todaysEvents.length === 0 ? (
              <p className="text-sm text-ink-soft">Nothing scheduled today.</p>
            ) : (
              <ul className="space-y-3">
                {todaysEvents.map((e) => (
                  <li key={e.id} className="flex items-start gap-3">
                    <span className="w-16 shrink-0 text-xs font-mono text-ink-soft pt-0.5">{formatTime(e.start)}</span>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${EVENT_TYPE_DOT[e.type]}`} />
                    <div>
                      <div className="text-sm font-medium text-ink">{e.title}</div>
                      <div className="text-xs text-ink-soft">{e.location}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Assignments due soon */}
          <Card>
            <CardHeader title="Assignments due soon" action={<Link href="/assignments" className="text-xs text-crimson hover:underline">View all</Link>} />
            {topAssignments.length === 0 ? (
              <p className="text-sm text-ink-soft">Nothing due — nice work.</p>
            ) : (
              <ul className="divide-y divide-line">
                {topAssignments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div>
                      <div className="text-sm font-medium text-ink">{a.name}</div>
                      <div className="text-xs text-ink-soft">{className(a.classId)} · {formatFriendlyDate(a.dueDate)}</div>
                    </div>
                    <PriorityBadge priority={a.priority} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* News snapshot */}
          <Card>
            <CardHeader
              title="Business & finance news"
              icon={<Newspaper size={15} className="text-crimson" />}
              action={<Link href="/news" className="text-xs text-crimson hover:underline">Full feed</Link>}
            />
            {news === null ? (
              <p className="text-sm text-ink-soft">Loading headlines…</p>
            ) : news.length === 0 ? (
              <p className="text-sm text-ink-soft">Couldn't load news right now — check the News tab.</p>
            ) : (
              <ul className="space-y-2.5">
                {news.map((n, i) => (
                  <li key={i}>
                    <a href={n.link} target="_blank" rel="noreferrer" className="text-sm font-medium text-ink hover:text-crimson">
                      {n.title}
                    </a>
                    <div className="text-xs text-ink-faint">{n.source}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {/* AI recommended priorities */}
          <Card>
            <CardHeader title="AI recommended priorities" icon={<Sparkles size={15} className="text-crimson" />} />
            {ranked.length === 0 ? (
              <p className="text-sm text-ink-soft">Nothing urgent right now.</p>
            ) : (
              <ol className="space-y-2.5">
                {ranked.map((r, i) => (
                  <li key={r.id} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-crimson-50 text-[11px] font-semibold text-crimson">
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-sm text-ink">{r.title}</div>
                      <div className="text-xs text-ink-faint">Due {formatFriendlyDate(r.dueLabel)}</div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          {/* Market snapshot */}
          <Card>
            <CardHeader title="Market snapshot" icon={<TrendingUp size={15} className="text-crimson" />} action={<Link href="/finance" className="text-xs text-crimson hover:underline">Finance</Link>} />
            {quotes === null ? (
              <p className="text-sm text-ink-soft">Loading quotes…</p>
            ) : quotes.length === 0 ? (
              <p className="text-sm text-ink-soft">Add tickers to your watchlist in Finance.</p>
            ) : (
              <ul className="space-y-2">
                {quotes.map((q) => (
                  <li key={q.symbol} className="flex items-center justify-between text-sm">
                    <span className="font-mono font-medium text-ink">{q.symbol}</span>
                    <span className="font-mono text-ink-soft">{q.price !== null ? `$${q.price.toFixed(2)}` : "—"}</span>
                    <span className={`font-mono text-xs ${q.changePercent !== null && q.changePercent < 0 ? "text-negative" : "text-positive"}`}>
                      {q.changePercent !== null ? `${q.changePercent > 0 ? "+" : ""}${q.changePercent.toFixed(2)}%` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader title="Quick actions" />
            <div className="grid grid-cols-2 gap-2">
              <QuickAction href="/assignments" icon={<ListPlus size={15} />} label="Add assignment" />
              <QuickAction href="/tasks" icon={<ListPlus size={15} />} label="Add task" />
              <QuickAction href="/assistant" icon={<Sparkles size={15} />} label="Plan my day" />
              <QuickAction href="/finance" icon={<TrendingUp size={15} />} label="View markets" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-xs font-medium text-ink hover:border-crimson/40 hover:bg-crimson-50/40"
    >
      <span className="flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <ArrowRight size={13} className="text-ink-faint" />
    </Link>
  );
}
