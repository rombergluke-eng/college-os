import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    anthropicConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
    googleCalendarConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  });
}
