interface QuoteLike {
  symbol: string;
  price: number | null;
  changePercent: number | null;
}
interface NewsLike {
  title: string;
  source: string;
  category: string;
}

export interface FinanceContext {
  quotes: QuoteLike[];
  news: NewsLike[];
}

function findTicker(question: string, quotes: QuoteLike[]): QuoteLike | null {
  const NAME_MAP: Record<string, string> = {
    apple: "AAPL",
    nvidia: "NVDA",
    microsoft: "MSFT",
    amazon: "AMZN",
    google: "GOOGL",
    alphabet: "GOOGL",
    meta: "META",
    facebook: "META",
    tesla: "TSLA",
  };
  const lower = question.toLowerCase();
  for (const [name, ticker] of Object.entries(NAME_MAP)) {
    if (lower.includes(name)) return quotes.find((q) => q.symbol === ticker) ?? { symbol: ticker, price: null, changePercent: null };
  }
  const upperWords = question.match(/\b[A-Z]{2,5}\b/g) ?? [];
  for (const w of upperWords) {
    const found = quotes.find((q) => q.symbol === w);
    if (found) return found;
  }
  return null;
}

export function answerFinanceLocally(question: string, ctx: FinanceContext): string | null {
  const q = question.toLowerCase();

  if (/why is .* (up|down)|why did .* (rise|fall|drop|climb)/.test(q)) {
    const ticker = findTicker(question, ctx.quotes);
    if (!ticker || ticker.changePercent === null) {
      return "I don't have a live number for that one — add it to your watchlist so I can reference its move, and check the News tab for the story behind it.";
    }
    const direction = ticker.changePercent >= 0 ? "up" : "down";
    return `${ticker.symbol} is ${direction} about ${Math.abs(ticker.changePercent).toFixed(2)}% today based on your watchlist data. For the specific news driving that move, check today's headlines in the Finance and News tabs — I don't have a confirmed causal story to attach to this number.`;
  }

  if (/biggest (business|market) stor|today'?s (news|headlines)/.test(q)) {
    if (ctx.news.length === 0) return "Headlines haven't loaded yet — check the News tab.";
    return "Today's top stories:\n" + ctx.news.slice(0, 5).map((n) => `• ${n.title} (${n.source})`).join("\n");
  }

  if (/market briefing|five minute|5 minute|market overview|what happened in the markets/.test(q)) {
    const moversText = ctx.quotes.length
      ? ctx.quotes
          .filter((q) => q.changePercent !== null)
          .sort((a, b) => Math.abs(b.changePercent ?? 0) - Math.abs(a.changePercent ?? 0))
          .slice(0, 3)
          .map((q) => `${q.symbol} ${(q.changePercent ?? 0) >= 0 ? "+" : ""}${(q.changePercent ?? 0).toFixed(2)}%`)
          .join(", ")
      : "no watchlist data loaded";
    const headline = ctx.news[0]?.title ?? "no headline loaded";
    return `Quick briefing: your biggest watchlist movers are ${moversText}. Top story right now: "${headline}". For the full picture, the Finance and News tabs have live detail.`;
  }

  if (/fed decision|federal reserve|rate decision/.test(q)) {
    const fedNews = ctx.news.find((n) => n.source.toLowerCase().includes("federal reserve") || n.category === "Economy");
    if (fedNews) {
      return `The most recent Fed-related item I have is "${fedNews.title}" — open it in the News tab for the full release. I can't respond in real time to a Fed decision I haven't ingested, so double-check the date.`;
    }
    return "I don't have a recent Fed item loaded. Check the Economy section of the News tab.";
  }

  if (/what should i watch this week|watch this week/.test(q)) {
    return "Based on your watchlist, keep an eye on anything with a large move today (see Market snapshot), plus this week's Economy headlines for scheduled data releases.";
  }

  if (/like a college student|explain.*simpl|eli5/.test(q)) {
    return "Sure — ask me about a specific stock, index, or headline and I'll explain it in plain terms, without the jargon.";
  }

  return null;
}
