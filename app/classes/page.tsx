"use client";

import React, { useState } from "react";
import { Plus, Trash2, Upload, MapPin, User, Clock } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardHeader } from "@/components/ui/Card";
import { SampleBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ClassItem, MeetingTime } from "@/lib/types";
import { formatFriendlyDate } from "@/lib/dateUtils";
import { extractDatesFromSyllabus } from "@/lib/syllabus";

const DAYS: MeetingTime["day"][] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const emptyForm = {
  name: "",
  professor: "",
  location: "",
  notes: "",
  meetingTimes: [] as MeetingTime[],
};

export default function ClassesPage() {
  const { classes, addClass, updateClass, deleteClass, addAssignment, hydrated } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [openClassId, setOpenClassId] = useState<string | null>(null);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }
  function openEdit(c: ClassItem) {
    setEditingId(c.id);
    setForm({ name: c.name, professor: c.professor, location: c.location, notes: c.notes, meetingTimes: c.meetingTimes });
    setModalOpen(true);
  }

  function addMeeting() {
    setForm((f) => ({ ...f, meetingTimes: [...f.meetingTimes, { day: "Mon", start: "09:00", end: "10:00" }] }));
  }
  function updateMeeting(i: number, patch: Partial<MeetingTime>) {
    setForm((f) => ({ ...f, meetingTimes: f.meetingTimes.map((m, idx) => (idx === i ? { ...m, ...patch } : m)) }));
  }
  function removeMeeting(i: number) {
    setForm((f) => ({ ...f, meetingTimes: f.meetingTimes.filter((_, idx) => idx !== i) }));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name.trim() || "Untitled class",
      professor: form.professor,
      location: form.location,
      notes: form.notes,
      meetingTimes: form.meetingTimes,
      syllabusText: "",
      importantDates: [],
    };
    if (editingId) updateClass(editingId, payload);
    else addClass(payload);
    setModalOpen(false);
  }

  if (!hydrated) return <div className="text-ink-soft text-sm">Loading…</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">Classes</h1>
          <p className="text-sm text-ink-soft">Meeting times, syllabus notes, and important dates per class.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-crimson px-3.5 py-2 text-sm font-medium text-white hover:bg-crimson-dark">
          <Plus size={16} /> Add class
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {classes.map((c) => (
          <ClassCard
            key={c.id}
            classItem={c}
            expanded={openClassId === c.id}
            onToggle={() => setOpenClassId(openClassId === c.id ? null : c.id)}
            onEdit={() => openEdit(c)}
            onDelete={() => deleteClass(c.id)}
            onUpdateSyllabus={(text, dates) => updateClass(c.id, { syllabusText: text, importantDates: [...c.importantDates, ...dates] })}
            onAddAssignmentFromDate={(label, date) =>
              addAssignment({
                name: label,
                classId: c.id,
                description: "Added from syllabus scan.",
                dueDate: date,
                priority: "medium",
                estimatedMinutes: 60,
                status: "not-started",
                notes: "",
              })
            }
          />
        ))}
        {classes.length === 0 && <p className="text-sm text-ink-soft">No classes yet — add your first one.</p>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit class" : "Add class"}>
        <form onSubmit={save} className="space-y-3">
          <Field label="Class name">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="e.g. FIN-K 300: Financial Management" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Professor">
              <input value={form.professor} onChange={(e) => setForm({ ...form, professor: e.target.value })} className="input" />
            </Field>
            <Field label="Location">
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" />
            </Field>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-ink-soft">Meeting times</span>
              <button type="button" onClick={addMeeting} className="text-xs text-crimson hover:underline">+ Add time</button>
            </div>
            <div className="space-y-2">
              {form.meetingTimes.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select value={m.day} onChange={(e) => updateMeeting(i, { day: e.target.value as MeetingTime["day"] })} className="input w-24">
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input type="time" value={m.start} onChange={(e) => updateMeeting(i, { start: e.target.value })} className="input" />
                  <input type="time" value={m.end} onChange={(e) => updateMeeting(i, { end: e.target.value })} className="input" />
                  <button type="button" onClick={() => removeMeeting(i)} className="p-1.5 text-ink-faint hover:text-negative">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <Field label="Notes">
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" rows={2} />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-line px-3.5 py-2 text-sm font-medium text-ink-soft hover:bg-cream">
              Cancel
            </button>
            <button type="submit" className="rounded-md bg-crimson px-3.5 py-2 text-sm font-medium text-white hover:bg-crimson-dark">
              {editingId ? "Save changes" : "Add class"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ClassCard({
  classItem: c,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onUpdateSyllabus,
  onAddAssignmentFromDate,
}: {
  classItem: ClassItem;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateSyllabus: (text: string, dates: { label: string; date: string }[]) => void;
  onAddAssignmentFromDate: (label: string, date: string) => void;
}) {
  const [syllabusDraft, setSyllabusDraft] = useState(c.syllabusText);
  const [scanResults, setScanResults] = useState<{ label: string; date: string }[] | null>(null);

  function scan() {
    const found = extractDatesFromSyllabus(syllabusDraft, new Date().getFullYear());
    setScanResults(found);
  }
  function saveScan() {
    if (scanResults) onUpdateSyllabus(syllabusDraft, scanResults);
    setScanResults(null);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".txt")) {
      alert("For now, syllabus upload accepts plain .txt files (or paste text below) — PDF/Word parsing is a Stage 2 addition. See Settings for details.");
      return;
    }
    file.text().then(setSyllabusDraft);
  }

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif text-base font-semibold text-ink">{c.name}</h3>
            {c.sample && <SampleBadge />}
          </div>
          <div className="mt-1 space-y-0.5 text-xs text-ink-soft">
            {c.professor && <div className="flex items-center gap-1.5"><User size={12} /> {c.professor}</div>}
            {c.location && <div className="flex items-center gap-1.5"><MapPin size={12} /> {c.location}</div>}
            {c.meetingTimes.map((m, i) => (
              <div key={i} className="flex items-center gap-1.5"><Clock size={12} /> {m.day} {m.start}–{m.end}</div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="text-xs text-crimson hover:underline">Edit</button>
          <button onClick={onDelete} className="p-1.5 text-ink-faint hover:text-negative"><Trash2 size={14} /></button>
        </div>
      </div>

      {c.importantDates.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-line pt-3">
          {c.importantDates.map((d, i) => (
            <li key={i} className="flex items-center justify-between text-xs">
              <span className="text-ink">{d.label}</span>
              <span className="text-ink-soft font-mono">{formatFriendlyDate(d.date)}</span>
            </li>
          ))}
        </ul>
      )}

      <button onClick={onToggle} className="mt-3 text-xs font-medium text-crimson hover:underline">
        {expanded ? "Hide syllabus tool" : "Syllabus & notes"}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-line pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-soft">Paste or upload syllabus text</span>
            <label className="flex cursor-pointer items-center gap-1 text-xs text-crimson hover:underline">
              <Upload size={12} /> Upload .txt
              <input type="file" accept=".txt" className="hidden" onChange={handleFile} />
            </label>
          </div>
          <textarea
            value={syllabusDraft}
            onChange={(e) => setSyllabusDraft(e.target.value)}
            rows={4}
            className="input"
            placeholder="Paste syllabus text here, e.g. 'Midterm exam: October 14' or 'Final paper due 12/5'"
          />
          <button onClick={scan} className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink hover:border-crimson/40">
            Scan for dates
          </button>
          {scanResults && (
            <div className="rounded-md border border-line bg-cream p-2.5">
              {scanResults.length === 0 ? (
                <p className="text-xs text-ink-soft">No dates found. Try phrasing like "Exam 2: November 3".</p>
              ) : (
                <>
                  <ul className="space-y-1 mb-2">
                    {scanResults.map((d, i) => (
                      <li key={i} className="flex items-center justify-between text-xs">
                        <span>{d.label}</span>
                        <span className="font-mono text-ink-soft">{formatFriendlyDate(d.date)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <button onClick={saveScan} className="rounded-md bg-crimson px-2.5 py-1 text-xs font-medium text-white hover:bg-crimson-dark">
                      Save as important dates
                    </button>
                    <button
                      onClick={() => {
                        scanResults.forEach((d) => onAddAssignmentFromDate(d.label, d.date));
                        saveScan();
                      }}
                      className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-ink hover:bg-white"
                    >
                      Also add as assignments
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {c.notes && <p className="text-xs text-ink-faint">{c.notes}</p>}
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
