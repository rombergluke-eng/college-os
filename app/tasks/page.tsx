"use client";

import React, { useMemo, useState } from "react";
import { Plus, Trash2, Pencil, Repeat } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardHeader } from "@/components/ui/Card";
import { PriorityBadge, SampleBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Priority, Recurrence, Task, TaskCategory } from "@/lib/types";
import { formatDateInput, formatFriendlyDate } from "@/lib/dateUtils";
import { sortTasksByPriority } from "@/lib/priority";

const emptyForm = {
  title: "",
  deadline: "",
  priority: "medium" as Priority,
  estimatedMinutes: 30,
  category: "school" as TaskCategory,
  recurrence: "none" as Recurrence,
};

const CATEGORY_LABEL: Record<TaskCategory, string> = {
  personal: "Personal",
  school: "School",
  career: "Career",
  health: "Health",
  other: "Other",
};

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, hydrated } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<TaskCategory | "all">("all");

  const now = new Date();
  const visible = useMemo(() => {
    const active = tasks.filter((t) => (filter === "all" ? true : t.category === filter));
    return {
      active: sortTasksByPriority(active.filter((t) => t.status !== "completed"), now),
      completed: active.filter((t) => t.status === "completed"),
    };
  }, [tasks, filter, now]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }
  function openEdit(t: Task) {
    setEditingId(t.id);
    setForm({
      title: t.title,
      deadline: t.deadline ? formatDateInput(t.deadline) : "",
      priority: t.priority,
      estimatedMinutes: t.estimatedMinutes,
      category: t.category,
      recurrence: t.recurrence,
    });
    setModalOpen(true);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title.trim() || "Untitled task",
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      priority: form.priority,
      estimatedMinutes: Number(form.estimatedMinutes) || 15,
      status: "not-started" as const,
      category: form.category,
      recurrence: form.recurrence,
    };
    if (editingId) updateTask(editingId, payload);
    else addTask(payload);
    setModalOpen(false);
  }

  if (!hydrated) return <div className="text-ink-soft text-sm">Loading…</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">Tasks</h1>
          <p className="text-sm text-ink-soft">General to-dos, separate from class assignments.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-crimson px-3.5 py-2 text-sm font-medium text-white hover:bg-crimson-dark">
          <Plus size={16} /> Add task
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(["all", "school", "personal", "career", "health", "other"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-3 py-1 text-xs font-medium border ${
              filter === c ? "bg-crimson text-white border-crimson" : "border-line text-ink-soft hover:bg-cream"
            }`}
          >
            {c === "all" ? "All" : CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader title={`Open tasks (${visible.active.length})`} />
        {visible.active.length === 0 ? (
          <p className="text-sm text-ink-soft">Nothing here — add a task to get started.</p>
        ) : (
          <ul className="divide-y divide-line">
            {visible.active.map((t) => (
              <li key={t.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => updateTask(t.id, { status: "completed" })}
                    className="mt-1 h-4 w-4 accent-[#990000]"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-ink">{t.title}</span>
                      {t.recurrence !== "none" && (
                        <span className="flex items-center gap-1 text-[10px] text-ink-faint">
                          <Repeat size={11} /> {t.recurrence}
                        </span>
                      )}
                      {t.sample && <SampleBadge />}
                    </div>
                    <div className="text-xs text-ink-soft mt-0.5">
                      {CATEGORY_LABEL[t.category]} · {t.deadline ? formatFriendlyDate(t.deadline) : "No deadline"} · {t.estimatedMinutes} min
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={t.priority} />
                  <button onClick={() => openEdit(t)} className="p-1.5 text-ink-faint hover:text-crimson" aria-label="Edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteTask(t.id)} className="p-1.5 text-ink-faint hover:text-negative" aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {visible.completed.length > 0 && (
        <Card className="opacity-60">
          <CardHeader title={`Completed (${visible.completed.length})`} />
          <ul className="divide-y divide-line">
            {visible.completed.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className="text-sm text-ink line-through">{t.title}</span>
                <button onClick={() => deleteTask(t.id)} className="p-1.5 text-ink-faint hover:text-negative" aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit task" : "Add task"}>
        <form onSubmit={save} className="space-y-3">
          <Field label="Title">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Deadline (optional)">
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input" />
            </Field>
            <Field label="Estimated minutes">
              <input type="number" min={5} value={form.estimatedMinutes} onChange={(e) => setForm({ ...form, estimatedMinutes: Number(e.target.value) })} className="input" />
            </Field>
            <Field label="Priority">
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TaskCategory })} className="input">
                {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Repeats">
              <select value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value as Recurrence })} className="input">
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-line px-3.5 py-2 text-sm font-medium text-ink-soft hover:bg-cream">
              Cancel
            </button>
            <button type="submit" className="rounded-md bg-crimson px-3.5 py-2 text-sm font-medium text-white hover:bg-crimson-dark">
              {editingId ? "Save changes" : "Add task"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
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
