import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { title, source } = (await req.json()) as { title?: string; source?: string };
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      enabled: false,
      message: "Add an ANTHROPIC_API_KEY environment variable in your Vercel project to turn on real AI-generated summaries here. Until then, read the full story at the link above.",
    });
  }

  if (!title) {
    return NextResponse.json({ enabled: true, error: "Missing title" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 350,
        messages: [
          {
            role: "user",
            content: `A college student sees this business/finance headline: "${title}" (source: ${source ?? "unknown"}).
Based only on the headline (you do not have the article body), write a short, clearly-labeled explainer with these fields:
- whatHappened: one sentence, hedged appropriately since you only have the headline
- whyItMatters: one sentence
- sectorsAffected: a short phrase, or "unclear from headline alone"
- marketImplications: one cautious sentence, explicitly framed as possible analysis, not fact
- whyShouldICare: one plain-language sentence for a business student
Respond as compact JSON with exactly those five keys and string values, nothing else.`,
          },
        ],
      }),
    });
    const data = await res.json();
    const text = data?.content?.find((b: { type: string }) => b.type === "text")?.text ?? "{}";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json({ enabled: true, summary: parsed });
  } catch {
    return NextResponse.json({ enabled: true, error: "Summary generation failed. Try again shortly." }, { status: 500 });
  }
}
