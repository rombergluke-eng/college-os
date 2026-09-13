"use client";

import React, { useEffect, useMemo, useState } from "react";
import { TrendingDown, TrendingUp, Plus, X, Send, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { answerFinanceLocally } from "@/lib/financeAssistant";

interface Quote {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  open: number | null;
  error?: string;
}
interface NewsItem {
  title: string;
  link: string;
  source: string;
  category: string;
}

const INDEX_PROXIES = [
  { symbol: "SPY", label: "S&P 500 (SPY)" },
  { symbol: "DIA", label: "Dow Jones (DIA)" },
  { symbol: "QQQ", label: "Nasdaq 100 (QQQ)" },
];

export default function FinancePage() {
  const { watchlist, setWatchlist, hydrated } = useStore();
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [indexQuotes, setIndexQuotes] = useState<Quote[] | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newTicker, setNewTicker] = useState("");
  const [detailSymbol, setDetailSymbol] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<{ role: "user" | "assistant"; text: string }[]>([]);

  useEffect(() => {
    if (!hydrated || watchlist.length === 0) return;
    fetch(`/api/stocks?symbols=${watchlist.join(",")}`)
      .then((r) => r.json())
      .then((d) => setQuotes(d.quotes ?? []))
      .catch(() => setQuotes(null));
  }, [hydrated, watchlist]);

  useEffect(() => {
    fetch(`/api/stocks?symbols=${INDEX_PROXIES.map((i) => i.symbol).join(",")}`)
      .then((r) => r.json())
      .then((d) => setIndexQuotes(d.quotes ?? []))
      .catch(() => setIndexQuotes(null));
  }, []);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => setNews(d.items ?? []))
      .catch(() => setNews([]));
  }, []);

  const economyNews = useMemo(() => news.filter((n) => n.category === "Economy").slice(0, 5), [news]);
  const financeMoversNews = useMemo(
    () => news.filter((n) => ["Finance", "Markets", "Top Business News"].includes(n.category)).slice(0, 6),
    [news]
  );

  function addTicker(e: React.FormEvent) {
    e.preventDefault();
    if (!newTicker.trim()) return;
    setWatchlist([...watchlist, newTicker.trim()]);
    setNewTicker("");
  }
  function removeTicker(sym: string) {
    setWatchlist(watchlist.filter((s) => s !== sym));
  }

  function askAssistant(e: React.FormEvent) {
    e.preventDefault();
    const question = chatInput.trim();
    if (!question) return;
    setChatLog((log) => [...log, { role: "user", text: question }]);
    const answer =
      answerFinanceLocally(question, { quotes: quotes ?? [], news }) ??
      "I can answer questions about your watchlist movers, today's headlines, or a quick market briefing. Try \"give me a market briefing\" or \"why is Nvidia up today?\"";
    setChatLog((log) => [...log, { role: "assistant", text: answer }]);
    setChatInput("");
  }

  const detail = quotes?.find((q) => q.symbol === detailSymbol) ?? null;

  if (!hydrated) return <div className="text-ink-soft text-sm">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Finance</h1>
        <p className="text-sm text-ink-soft">Market data from a free, keyless source — see Settings for notes on accuracy and upgrading.</p>
      </div>

      {/* Index snapshot */}
      <Card>
        <CardHeader title="Market snapshot" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {INDEX_PROXIES.map((idx) => {
            const q = indexQuotes?.find((x) => x.symbol === idx.symbol);
            return (
              <div key={idx.symbol} className="rounded-md border border-line p-3">
                <div className="text-xs text-ink-soft">{idx.label}</div>
                {q?.price != null ? (
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-lg font-semibold text-ink">${q.price.toFixed(2)}</span>
                    <ChangeTag changePercent={q.changePercent} />
                  </div>
                ) : (
                  <div className="mt-1 text-sm text-ink-faint">Loading…</div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Watchlist */}
          <Card>
            <CardHeader title="Your watchlist" />
            <form onSubmit={addTicker} className="mb-3 flex gap-2">
              <input
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                placeholder="Add ticker, e.g. NFLX"
                className="input"
              />
              <button type="submit" className="flex items-center gap-1 rounded-md bg-crimson px-3 py-2 text-xs font-medium text-white hover:bg-crimson-dark">
                <Plus size={14} /> Add
              </button>
            </form>
            {quotes === null ? (
              <p className="text-sm text-ink-soft">Loading quotes…</p>
            ) : (
              <ul className="divide-y divide-line">
                {watchlist.map((sym) => {
                  const q = quotes.find((x) => x.symbol === sym);
                  return (
                    <li key={sym} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <button onClick={() => setDetailSymbol(sym)} className="text-left">
                        <span className="font-mono text-sm font-semibold text-ink hover:text-crimson">{sym}</span>
                      </button>
                      <div className="flex items-center gap-3">
                        {q?.price != null ? (
                          <>
                            <span className="font-mono text-sm text-ink-soft">${q.price.toFixed(2)}</span>
                            <ChangeTag changePercent={q.changePercent} />
                          </>
                        ) : (
                          <span className="text-xs text-ink-faint">no data</span>
                        )}
                        <button onClick={() => removeTicker(sym)} className="p-1 text-ink-faint hover:text-negative" aria-label={`Remove ${sym}`}>
                          <X size={14} />
                        </button>
                      </div>
                    </li>
                  );
                })}
                {watchlist.length === 0 && <p className="text-sm text-ink-soft py-2">Your watchlist is empty — add a ticker above.</p>}
              </ul>
            )}
          </Card>

          {/* Finance/markets news */}
          <Card>
            <CardHeader title="Markets, earnings & company news" />
            <p className="text-xs text-ink-faint -mt-2 mb-2">
              Dedicated earnings/IPO/M&A calendars need a paid data feed — until you add one, this section shows related free headlines instead.
            </p>
            {financeMoversNews.length === 0 ? (
              <p className="text-sm text-ink-soft">Loading headlines…</p>
            ) : (
              <ul className="space-y-2.5">
                {financeMoversNews.map((n, i) => (
                  <li key={i}>
                    <a href={n.link} target="_blank" rel="noreferrer" className="text-sm font-medium text-ink hover:text-crimson">{n.title}</a>
                    <div className="text-xs text-ink-faint">{n.source} · {n.category}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {/* Economic indicators / Fed */}
          <Card>
            <CardHeader title="Economy & Fed" />
            {economyNews.length === 0 ? (
              <p className="text-sm text-ink-soft">Loading…</p>
            ) : (
              <ul className="space-y-2.5">
                {economyNews.map((n, i) => (
                  <li key={i}>
                    <a href={n.link} target="_blank" rel="noreferrer" className="text-sm font-medium text-ink hover:text-crimson">{n.title}</a>
                    <div className="text-xs text-ink-faint">{n.source}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* AI finance assistant */}
          <Card>
            <CardHeader title="AI finance assistant" icon={<Sparkles size={15} className="text-crimson" />} />
            <div className="mb-2 max-h-64 space-y-2 overflow-y-auto">
              {chatLog.length === 0 && (
                <p className="text-xs text-ink-faint">
                  Try: "Give me a five minute market briefing", "Why is Nvidia up today?", "What are the biggest business stories today?"
                </p>
              )}
              {chatLog.map((m, i) => (
                <div key={i} className={`rounded-md p-2 text-xs whitespace-pre-line ${m.role === "user" ? "bg-cream text-ink" : "bg-crimson-50 text-ink"}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={askAssistant} className="flex gap-2">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about markets…" className="input" />
              <button type="submit" className="rounded-md bg-crimson p-2 text-white hover:bg-crimson-dark" aria-label="Send">
                <Send size={14} />
              </button>
            </form>
          </Card>
        </div>
      </div>

      <Modal open={!!detailSymbol} onClose={() => setDetailSymbol(null)} title={detailSymbol ?? ""}>
        {detail ? (
          <div className="space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-2xl font-semibold text-ink">
                {detail.price != null ? `$${detail.price.toFixed(2)}` : "No data"}
              </span>
              <ChangeTag changePercent={detail.changePercent} />
            </div>
            <p className="text-xs text-ink-soft">
              Change is approximated from today's open vs. last close via a free data source. Earnings dates and
              company profile details require a paid market-data API — not included in this free build.
            </p>
          </div>
        ) : (
          <p className="text-sm text-ink-soft">No data available for this symbol.</p>
        )}
      </Modal>
    </div>
  );
}

function ChangeTag({ changePercent }: { changePercent: number | null }) {
  if (changePercent === null) return <span className="text-xs text-ink-faint">—</span>;
  const positive = changePercent >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-mono font-medium ${positive ? "text-positive" : "text-negative"}`}>
      {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {positive ? "+" : ""}
      {changePercent.toFixed(2)}%
    </span>
  );
}
