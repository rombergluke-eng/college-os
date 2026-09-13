"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Sparkles, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { answerLocally, SUGGESTED_PROMPTS } from "@/lib/assistantEngine";

function AssistantInner() {
  const { assignments, tasks, events, classes, userName, chat, addChatMessage, clearChat, hydrated } = useStore();
  const params = useSearchParams();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [consumedQuery, setConsumedQuery] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  function respond(question: string) {
    addChatMessage({ role: "user", content: question });
    const answer =
      answerLocally(question, { assignments, tasks, events, classes, userName }) ??
      "I can help with what's due, your schedule, priorities, finding free time, and study planning using what's on your dashboard. For open-ended questions beyond that, an administrator can add an ANTHROPIC_API_KEY to unlock a full conversational assistant (see Settings).";
    setTimeout(() => addChatMessage({ role: "assistant", content: answer }), 150);
  }

  useEffect(() => {
    const q = params.get("q");
    if (q && hydrated && !consumedQuery) {
      setConsumedQuery(true);
      respond(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, hydrated, consumedQuery]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    respond(input.trim());
    setInput("");
  }

  if (!hydrated) return <div className="text-ink-soft text-sm">Loading…</div>;

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">AI Assistant</h1>
          <p className="text-sm text-ink-soft">Answers using what's already on your dashboard — no API key required.</p>
        </div>
        {chat.length > 0 && (
          <button onClick={clearChat} className="flex items-center gap-1 text-xs text-ink-soft hover:text-negative">
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-1">
          {chat.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Sparkles className="text-crimson" size={22} />
              <p className="text-sm text-ink-soft">Ask about your schedule, deadlines, or priorities.</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button key={p} onClick={() => respond(p)} className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft hover:border-crimson/40 hover:text-crimson">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          <ul className="space-y-3">
            {chat.map((m) => (
              <li key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] whitespace-pre-line rounded-lg px-3.5 py-2.5 text-sm ${
                    m.role === "user" ? "bg-crimson text-white" : "bg-cream text-ink border border-line"
                  }`}
                >
                  {m.content}
                </div>
              </li>
            ))}
          </ul>
          <div ref={bottomRef} />
        </div>
        <form onSubmit={submit} className="mt-3 flex items-center gap-2 border-t border-line pt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What should I do right now?"
            className="input"
          />
          <button type="submit" className="rounded-md bg-crimson p-2.5 text-white hover:bg-crimson-dark" aria-label="Send">
            <Send size={16} />
          </button>
        </form>
      </Card>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="text-ink-soft text-sm">Loading…</div>}>
      <AssistantInner />
    </Suspense>
  );
}
