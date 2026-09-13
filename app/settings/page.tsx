"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Circle, RefreshCw } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardHeader } from "@/components/ui/Card";

export default function SettingsPage() {
  const { userName, setUserName, resetAllData, hydrated } = useStore();
  const [nameDraft, setNameDraft] = useState(userName);
  const [status, setStatus] = useState<{ anthropicConfigured: boolean; googleCalendarConfigured: boolean } | null>(null);

  useEffect(() => setNameDraft(userName), [userName]);
  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  function saveName(e: React.FormEvent) {
    e.preventDefault();
    setUserName(nameDraft.trim() || "there");
  }

  function handleReset() {
    if (confirm("Reset all data back to the sample demo content? This clears your assignments, tasks, classes, watchlist, and chat.")) {
      resetAllData();
    }
  }

  if (!hydrated) return <div className="text-ink-soft text-sm">Loading…</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Settings</h1>
        <p className="text-sm text-ink-soft">Everything here is stored locally in this browser — nothing is sent to a server except optional integrations below.</p>
      </div>

      <Card>
        <CardHeader title="Profile" />
        <form onSubmit={saveName} className="flex items-end gap-2">
          <label className="flex-1 block">
            <span className="mb-1 block text-xs font-medium text-ink-soft">Display name</span>
            <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} className="input" placeholder="Your first name" />
          </label>
          <button type="submit" className="rounded-md bg-crimson px-3.5 py-2 text-sm font-medium text-white hover:bg-crimson-dark">
            Save
          </button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Integrations" />
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2.5">
            <StatusIcon on={status?.anthropicConfigured} />
            <div>
              <div className="font-medium text-ink">AI Assistant &amp; news summaries (Anthropic API)</div>
              <p className="text-xs text-ink-soft">
                {status?.anthropicConfigured
                  ? "Connected — the AI Assistant and news summaries can use a real model."
                  : "Not connected. Both features already work for free with a built-in rule-based engine. Add an ANTHROPIC_API_KEY environment variable in Vercel to upgrade to full model-generated answers."}
              </p>
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <StatusIcon on={status?.googleCalendarConfigured} />
            <div>
              <div className="font-medium text-ink">Google Calendar (read-only)</div>
              <p className="text-xs text-ink-soft">
                {status?.googleCalendarConfigured
                  ? "Credentials detected — see README.md to finish wiring the OAuth flow."
                  : "Not connected yet. This is Stage 2: create an OAuth client in Google Cloud Console (free), add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in Vercel, then follow README.md. Never share these values in chat — only in Vercel's dashboard."}
              </p>
            </div>
          </li>
        </ul>
      </Card>

      <Card>
        <CardHeader title="Data" />
        <p className="text-sm text-ink-soft mb-3">
          Your assignments, tasks, classes, watchlist, and chat are stored in this browser's local storage — free,
          simple, and private to this device. Clearing your browser data or switching browsers/devices will lose it.
        </p>
        <button onClick={handleReset} className="flex items-center gap-1.5 rounded-md border border-line px-3.5 py-2 text-sm font-medium text-ink hover:border-negative/40 hover:text-negative">
          <RefreshCw size={14} /> Reset to sample data
        </button>
      </Card>
    </div>
  );
}

function StatusIcon({ on }: { on?: boolean }) {
  return on ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-positive" /> : <Circle size={16} className="mt-0.5 shrink-0 text-ink-faint" />;
}
