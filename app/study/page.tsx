"use client";

import React, { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardHeader } from "@/components/ui/Card";
import { SampleBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { StudyPlan, StudyTopic } from "@/lib/types";
import { formatDateInput, formatFriendlyDate } from "@/lib/dateUtils";
import { generateStudyPlan } from "@/lib/studyPlanner";

const emptyForm = {
  examName: "",
  classId: "",
  examDate: formatDateInput(new Date(Date.now() + 7 * 86400000).toISOString()),
  availableMinutesPerDay: 60,
  topics: [{ name: "", confidence: 3 }] as StudyTopic[],
};

export default function StudyPage() {
  const { studyPlans, classes, addStudyPlan, deleteStudyPlan, hydrated } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);

  function updateTopic(i: number, patch: Partial<StudyTopic>) {
    setForm((f) => ({ ...f, topics: f.topics.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) }));
  }
  function addTopic() {
    setForm((f) => ({ ...f, topics: [...f.topics, { name: "", confidence: 3 }] }));
  }
  function removeTopic(i: number) {
    setForm((f) => ({ ...f, topics: f.topics.filter((_, idx) => idx !== i) }));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    addStudyPlan({
      examName: form.examName.trim() || "Untitled exam",
      classId: form.classId || null,
      examDate: new Date(form.examDate).toISOString(),
      topics: form.topics.filter((t) => t.name.trim()),
      availableMinutesPerDay: Number(form.availableMinutesPerDay) || 30,
    });
    setForm(emptyForm);
    setModalOpen(false);
  }

  function className(id: string | null) {
    return classes.find((c) => c.id === id)?.name ?? "";
  }

  if (!hydrated) return <div className="text-ink-soft text-sm">Loading…</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">Study</h1>
          <p className="text-sm text-ink-soft">Turn an exam and your confidence per topic into a day-by-day plan.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 rounded-md bg-crimson px-3.5 py-2 text-sm font-medium text-white hover:bg-crimson-dark">
          <Plus size={16} /> New study plan
        </button>
      </div>

      <div className="space-y-4">
        {studyPlans.map((plan) => (
          <StudyPlanCard
            key={plan.id}
            plan={plan}
            classLabel={className(plan.classId)}
            expanded={openPlanId === plan.id}
            onToggle={() => setOpenPlanId(openPlanId === plan.id ? null : plan.id)}
            onDelete={() => deleteStudyPlan(plan.id)}
          />
        ))}
        {studyPlans.length === 0 && <p className="text-sm text-ink-soft">No study plans yet — add an upcoming exam.</p>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New study plan">
        <form onSubmit={save} className="space-y-3">
          <Field label="Exam name">
            <input required value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} className="input" placeholder="e.g. Midterm 1" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Class">
              <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} className="input">
                <option value="">No class</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Exam date">
              <input type="date" required value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} className="input" />
            </Field>
          </div>
          <Field label="Minutes available per day">
            <input type="number" min={10} value={form.availableMinutesPerDay} onChange={(e) => setForm({ ...form, availableMinutesPerDay: Number(e.target.value) })} className="input" />
          </Field>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-ink-soft">Topics & confidence</span>
              <button type="button" onClick={addTopic} className="text-xs text-crimson hover:underline">+ Add topic</button>
            </div>
            <div className="space-y-2">
              {form.topics.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={t.name}
                    onChange={(e) => updateTopic(i, { name: e.target.value })}
                    placeholder="Topic name"
                    className="input"
                  />
                  <select value={t.confidence} onChange={(e) => updateTopic(i, { confidence: Number(e.target.value) })} className="input w-40">
                    <option value={1}>1 — shaky</option>
                    <option value={2}>2</option>
                    <option value={3}>3 — ok</option>
                    <option value={4}>4</option>
                    <option value={5}>5 — confident</option>
                  </select>
                  <button type="button" onClick={() => removeTopic(i)} className="p-1.5 text-ink-faint hover:text-negative">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-line px-3.5 py-2 text-sm font-medium text-ink-soft hover:bg-cream">
              Cancel
            </button>
            <button type="submit" className="rounded-md bg-crimson px-3.5 py-2 text-sm font-medium text-white hover:bg-crimson-dark">
              Generate plan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function StudyPlanCard({
  plan,
  classLabel,
  expanded,
  onToggle,
  onDelete,
}: {
  plan: StudyPlan;
  classLabel: string;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const days = generateStudyPlan(plan);
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif text-base font-semibold text-ink">{plan.examName}</h3>
            {plan.sample && <SampleBadge />}
          </div>
          <div className="text-xs text-ink-soft mt-0.5">
            {classLabel && `${classLabel} · `}Exam on {formatFriendlyDate(plan.examDate)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggle} className="text-xs font-medium text-crimson hover:underline">
            {expanded ? "Hide plan" : "View plan"}
          </button>
          <button onClick={onDelete} className="p-1.5 text-ink-faint hover:text-negative"><Trash2 size={14} /></button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {plan.topics.map((t, i) => (
          <span key={i} className="rounded-full border border-line px-2.5 py-0.5 text-[11px] text-ink-soft">
            {t.name} · confidence {t.confidence}/5
          </span>
        ))}
      </div>

      {expanded && (
        <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {days.map((d, i) => (
            <div key={i} className={`rounded-md border p-3 ${d.isReviewDay ? "border-crimson/30 bg-crimson-50/40" : "border-line"}`}>
              <div className="text-xs font-semibold text-ink">
                {formatFriendlyDate(d.date)} {d.isReviewDay && "· Full review"}
              </div>
              <ul className="mt-1.5 space-y-1">
                {d.blocks.map((b, j) => (
                  <li key={j} className="flex items-center justify-between text-xs text-ink-soft">
                    <span>{b.topic}</span>
                    <span className="font-mono">{b.minutes}m</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}
