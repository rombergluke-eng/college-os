import { NextResponse } from "next/server";
import Parser from "rss-parser";

export const revalidate = 300; // cache for 5 minutes

interface FeedSource {
  url: string;
  source: string;
  category: "Top Business News" | "Markets" | "Technology" | "AI & Business" | "Economy" | "Finance";
}

// All free, publicly available RSS feeds. No scraping of paywalled or
// scraping-prohibited sites — headline + source + link only.
const FEEDS: FeedSource[] = [
  { url: "https://www.cnbc.com/id/10001147/device/rss/rss.html", source: "CNBC", category: "Top Business News" },
  { url: "https://feeds.marketwatch.com/marketwatch/topstories/", source: "MarketWatch", category: "Top Business News" },
  { url: "https://feeds.marketwatch.com/marketwatch/marketpulse/", source: "MarketWatch", category: "Markets" },
  { url: "https://www.cnbc.com/id/15839069/device/rss/rss.html", source: "CNBC Markets", category: "Markets" },
  { url: "https://techcrunch.com/feed/", source: "TechCrunch", category: "Technology" },
  { url: "https://www.cnbc.com/id/19854910/device/rss/rss.html", source: "CNBC Tech", category: "Technology" },
  { url: "https://techcrunch.com/tag/artificial-intelligence/feed/", source: "TechCrunch AI", category: "AI & Business" },
  { url: "https://www.federalreserve.gov/feeds/press_all.xml", source: "Federal Reserve", category: "Economy" },
  { url: "https://www.cnbc.com/id/20910258/device/rss/rss.html", source: "CNBC Economy", category: "Economy" },
  { url: "https://www.cnbc.com/id/10000664/device/rss/rss.html", source: "CNBC Finance", category: "Finance" },
];

interface NewsItem {
  title: string;
  link: string;
  source: string;
  category: string;
  publishedAt: string | null;
}

let cache: { items: NewsItem[]; fetchedAt: number } | null = null;
const CACHE_MS = 5 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.fetchedAt < CACHE_MS) {
    return NextResponse.json({ items: cache.items, cached: true });
  }

  const parser = new Parser({ timeout: 8000 });
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      return (parsed.items ?? []).slice(0, 6).map((item) => ({
        title: item.title ?? "Untitled",
        link: item.link ?? "#",
        source: feed.source,
        category: feed.category,
        publishedAt: item.isoDate ?? item.pubDate ?? null,
      }));
    })
  );

  const items: NewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") items.push(...r.value);
  }

  // De-dupe by title, sort newest first
  const seen = new Set<string>();
  const deduped = items
    .filter((i) => {
      if (seen.has(i.title)) return false;
      seen.add(i.title);
      return true;
    })
    .sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return tb - ta;
    });

  if (deduped.length > 0) {
    cache = { items: deduped, fetchedAt: Date.now() };
  }

  return NextResponse.json({ items: deduped, cached: false });
}
