"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";

interface NewsItem {
  title: string;
  link: string;
  source: string;
  category: string;
  publishedAt: string | null;
}

const SECTIONS = ["Top Business News", "Markets", "Technology", "AI & Business", "Economy", "Finance"];

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">News</h1>
        <p className="text-sm text-ink-soft">
          Pulled from free, public RSS feeds. Paywalled sources like the WSJ aren't scraped — only headline, source, and a link out.
        </p>
      </div>

      {error && (
        <Card className="border-negative/30">
          <p className="text-sm text-negative">Couldn't reach the news feeds right now. Try refreshing in a moment.</p>
        </Card>
      )}

      {items === null && !error && <p className="text-sm text-ink-soft">Loading headlines…</p>}

      {items !== null &&
        SECTIONS.map((section) => {
          const sectionItems = items.filter((i) => i.category === section);
          if (sectionItems.length === 0) return null;
          return (
            <Card key={section}>
              <CardHeader title={section} />
              <ul className="divide-y divide-line">
                {sectionItems.map((item, i) => (
                  <NewsRow key={i} item={item} />
                ))}
              </ul>
            </Card>
          );
        })}
    </div>
  );
}

function NewsRow({ item }: { item: NewsItem }) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<
    { whatHappened: string; whyItMatters: string; sectorsAffected: string; marketImplications: string; whyShouldICare: string } | null
  >(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggle() {
    setOpen((o) => !o);
    if (!open && !summary && !note && !loading) fetchSummary();
  }

  function fetchSummary() {
    setLoading(true);
    fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: item.title, source: item.source }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.enabled === false) setNote(d.message);
        else if (d.summary) setSummary(d.summary);
        else setNote(d.error ?? "Couldn't generate a summary.");
      })
      .catch(() => setNote("Couldn't generate a summary."))
      .finally(() => setLoading(false));
  }

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <a href={item.link} target="_blank" rel="noreferrer" className="text-sm font-medium text-ink hover:text-crimson">
            {item.title}
          </a>
          <div className="text-xs text-ink-faint mt-0.5">{item.source}</div>
        </div>
        <button onClick={toggle} className="flex shrink-0 items-center gap-1 text-xs font-medium text-crimson hover:underline">
          <Sparkles size={12} /> {open ? "Hide" : "Why should I care?"}
        </button>
      </div>
      {open && (
        <div className="mt-2 rounded-md border border-line bg-cream p-3 text-xs text-ink-soft">
          {loading && "Generating…"}
          {!loading && note && <p>{note}</p>}
          {!loading && summary && (
            <dl className="space-y-1.5">
              <Row label="What happened" value={summary.whatHappened} />
              <Row label="Why it matters" value={summary.whyItMatters} />
              <Row label="Sectors affected" value={summary.sectorsAffected} />
              <Row label="Possible market implications" value={summary.marketImplications} />
              <Row label="Why should I care" value={summary.whyShouldICare} />
              <p className="pt-1 italic text-ink-faint">AI-generated analysis based on the headline only — not a substitute for reading the article.</p>
            </dl>
          )}
        </div>
      )}
    </li>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-medium text-ink">{label}: </span>
      <span>{value}</span>
    </div>
  );
}
