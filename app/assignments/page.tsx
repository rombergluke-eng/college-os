"use client";

import React, { useMemo, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardHeader } from "@/components/ui/Card";
import { PriorityBadge, SampleBadge, StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Assignment, Priority, Status } from "@/lib/types";
import { formatDateInput, formatFriendlyDate, isDueThisWeek, isDueToday, isDueTomorrow, isOverdue } from "@/lib/dateUtils";
import { assignmentScore } from "@/lib/priority";

const emptyForm = {
  name: "",
  classId: "",
  description: "",
  dueDate: formatDateInput(new Date().toISOString()),
  priority: "medium" as Priority,
  estimatedMinutes: 60,
  status: "not-started" as Status,
  notes: "",
};

export default function AssignmentsPage() {
  const { assignments, classes, addAssignment, updateAssignment, deleteAssignment, hydrated } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const now = new Date();
  const groups = useMemo(() => {
    const overdue: Assignment[] = [];
    const today: Assignment[] = [];
    const tomorrow: Assignment[] = [];
    const thisWeek: Assignment[] = [];
    const upcoming: Assignment[] = [];
    for (const a of assignments) {
      if (a.status === "completed") continue;
      if (isOverdue(a.dueDate, now)) overdue.push(a);
      else if (isDueToday(a.dueDate)) today.push(a);
      else if (isDueTomorrow(a.dueDate)) tomorrow.push(a);
      else if (isDueThisWeek(a.dueDate, now)) thisWeek.push(a);
      else upcoming.push(a);
    }
    const byScore = (a: Assignment, b: Assignment) => assignmentScore(b, now) - assignmentScore(a, now);
    return {
      overdue: overdue.sort(byScore),
      today: today.sort(byScore),
      tomorrow: tomorrow.sort(byScore),
      thisWeek: thisWeek.sort(byScore),
      upcoming: upcoming.sort(byScore),
      completed: assignments.filter((a) => a.status === "completed"),
    };
  }, [assignments, now]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }
  function openEdit(a: Assignment) {
    setEditingId(a.id);
    setForm({
      name: a.name,
      classId: a.classId ?? "",
      description: a.description,
      dueDate: formatDateInput(a.dueDate),
      priority: a.priority,
      estimatedMinutes: a.estimatedMinutes,
      status: a.status,
      notes: a.notes,
    });
    setModalOpen(true);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name.trim() || "Untitled assignment",
      classId: form.classId || null,
      description: form.description,
      dueDate: new Date(form.dueDate).toISOString(),
      priority: form.priority,
      estimatedMinutes: Number(form.estimatedMinutes) || 30,
      status: form.status,
      notes: form.notes,
    };
    if (editingId) updateAssignment(editingId, payload);
    else addAssignment(payload);
    setModalOpen(false);
  }

  function className(id: string | null) {
    return classes.find((c) => c.id === id)?.name ?? "No class";
  }

  if (!hydrated) return <div className="text-ink-soft text-sm">Loading…</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">Assignments</h1>
          <p className="text-sm text-ink-soft">Ranked by an urgency + importance + effort score.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-crimson px-3.5 py-2 text-sm font-medium text-white hover:bg-crimson-dark">
          <Plus size={16} /> Add assignment
        </button>
      </div>

      <Section title="Overdue" items={groups.overdue} className={className} onEdit={openEdit} onDelete={deleteAssignment} onUpdate={updateAssignment} tone="negative" />
      <Section title="Due today" items={groups.today} className={className} onEdit={openEdit} onDelete={deleteAssignment} onUpdate={updateAssignment} />
      <Section title="Due tomorrow" items={groups.tomorrow} className={className} onEdit={openEdit} onDelete={deleteAssignment} onUpdate={updateAssignment} />
      <Section title="Due this week" items={groups.thisWeek} className={className} onEdit={openEdit} onDelete={deleteAssignment} onUpdate={updateAssignment} />
      <Section title="Upcoming" items={groups.upcoming} className={className} onEdit={openEdit} onDelete={deleteAssignment} onUpdate={updateAssignment} />
      {groups.completed.length > 0 && (
        <Section title="Completed" items={groups.completed} className={className} onEdit={openEdit} onDelete={deleteAssignment} onUpdate={updateAssignment} muted />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit assignment" : "Add assignment"}>
        <form onSubmit={save} className="space-y-3">
          <Field label="Name">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </Field>
          <Field label="Class">
            <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} className="input">
              <option value="">No class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Due date">
              <input type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input" />
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
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })} className="input">
                <option value="not-started">Not started</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </Field>
          </div>
          <Field label="Notes">
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" rows={2} />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-line px-3.5 py-2 text-sm font-medium text-ink-soft hover:bg-cream">
              Cancel
            </button>
            <button type="submit" className="rounded-md bg-crimson px-3.5 py-2 text-sm font-medium text-white hover:bg-crimson-dark">
              {editingId ? "Save changes" : "Add assignment"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Section({
  title,
  items,
  className,
  onEdit,
  onDelete,
  onUpdate,
  tone,
  muted,
}: {
  title: string;
  items: Assignment[];
  className: (id: string | null) => string;
  onEdit: (a: Assignment) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Assignment>) => void;
  tone?: "negative";
  muted?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <Card>
      <CardHeader title={`${title} (${items.length})`} />
      <ul className={`divide-y divide-line ${muted ? "opacity-60" : ""}`}>
        {items.map((a) => (
          <li key={a.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={a.status === "completed"}
                onChange={(e) => onUpdate(a.id, { status: e.target.checked ? "completed" : "not-started" })}
                className="mt-1 h-4 w-4 accent-[#990000]"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${tone === "negative" ? "text-negative" : "text-ink"}`}>{a.name}</span>
                  {a.sample && <SampleBadge />}
                </div>
                <div className="text-xs text-ink-soft mt-0.5">
                  {className(a.classId)} · {formatFriendlyDate(a.dueDate)} · {a.estimatedMinutes} min
                </div>
                {a.description && <p className="text-xs text-ink-faint mt-1 max-w-lg">{a.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <PriorityBadge priority={a.priority} />
              <StatusBadge status={a.status} />
              <button onClick={() => onEdit(a)} className="p-1.5 text-ink-faint hover:text-crimson" aria-label="Edit">
                <Pencil size={14} />
              </button>
              <button onClick={() => onDelete(a.id)} className="p-1.5 text-ink-faint hover:text-negative" aria-label="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
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
