import { NextRequest, NextResponse } from "next/server";

export const revalidate = 60;

interface Quote {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  open: number | null;
  error?: string;
}

/**
 * Stooq's /q/l/ endpoint is free and requires no API key or signup. It
 * returns the latest available close plus the day's open, so we treat
 * (close - open) as an approximation of the day's move. This is a good
 * fit for a free/no-key dashboard, but it is NOT the same as a real-time
 * "previous close" change you'd get from a paid market data provider —
 * see README.md for upgrading to Finnhub/Alpha Vantage later.
 */
async function fetchStooqQuote(symbol: string): Promise<Quote> {
  const stooqSymbol = `${symbol.toLowerCase()}.us`;
  const url = `https://stooq.com/q/l/?s=${stooqSymbol}&f=sd2t2ohlcv&h&e=csv`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    const text = await res.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return { symbol, price: null, change: null, changePercent: null, open: null, error: "no data" };
    const cols = lines[1].split(",");
    // Symbol,Date,Time,Open,High,Low,Close,Volume
    const open = parseFloat(cols[3]);
    const close = parseFloat(cols[6]);
    if (isNaN(close) || close <= 0 || cols[3] === "N/D") {
      return { symbol, price: null, change: null, changePercent: null, open: null, error: "unavailable" };
    }
    const change = !isNaN(open) && open > 0 ? close - open : null;
    const changePercent = change !== null && open > 0 ? (change / open) * 100 : null;
    return { symbol, price: close, change, changePercent, open: isNaN(open) ? null : open };
  } catch {
    return { symbol, price: null, change: null, changePercent: null, open: null, error: "fetch failed" };
  }
}

export async function GET(req: NextRequest) {
  const symbolsParam = req.nextUrl.searchParams.get("symbols") ?? "";
  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 12);

  if (symbols.length === 0) {
    return NextResponse.json({ quotes: [] });
  }

  const quotes = await Promise.all(symbols.map(fetchStooqQuote));
  return NextResponse.json({ quotes });
}
