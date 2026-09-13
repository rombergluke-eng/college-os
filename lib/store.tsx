"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Assignment,
  CalendarEvent,
  ChatMessage,
  ClassItem,
  StudyPlan,
  Task,
} from "./types";
import {
  DEFAULT_WATCHLIST,
  SAMPLE_ASSIGNMENTS,
  SAMPLE_CLASSES,
  SAMPLE_EVENTS,
  SAMPLE_STUDY_PLANS,
  SAMPLE_TASKS,
} from "./sampleData";

const KEYS = {
  assignments: "collegeos.assignments.v1",
  tasks: "collegeos.tasks.v1",
  classes: "collegeos.classes.v1",
  events: "collegeos.events.v1",
  studyPlans: "collegeos.studyPlans.v1",
  watchlist: "collegeos.watchlist.v1",
  userName: "collegeos.userName.v1",
  chat: "collegeos.chat.v1",
};

function loadOrSeed<T>(key: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
    window.localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  } catch {
    return seed;
  }
}

function persist<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable - fail silently, data stays in memory for this session
  }
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface StoreValue {
  hydrated: boolean;
  userName: string;
  setUserName: (v: string) => void;

  assignments: Assignment[];
  addAssignment: (a: Omit<Assignment, "id">) => void;
  updateAssignment: (id: string, patch: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  tasks: Task[];
  addTask: (t: Omit<Task, "id">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  classes: ClassItem[];
  addClass: (c: Omit<ClassItem, "id">) => void;
  updateClass: (id: string, patch: Partial<ClassItem>) => void;
  deleteClass: (id: string) => void;

  events: CalendarEvent[];
  addEvent: (e: Omit<CalendarEvent, "id">) => void;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  studyPlans: StudyPlan[];
  addStudyPlan: (s: Omit<StudyPlan, "id">) => void;
  updateStudyPlan: (id: string, patch: Partial<StudyPlan>) => void;
  deleteStudyPlan: (id: string) => void;

  watchlist: string[];
  setWatchlist: (symbols: string[]) => void;

  chat: ChatMessage[];
  addChatMessage: (m: Omit<ChatMessage, "id" | "createdAt">) => void;
  clearChat: () => void;

  resetAllData: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [userName, setUserNameState] = useState("there");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [watchlist, setWatchlistState] = useState<string[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);

  useEffect(() => {
    setUserNameState(loadOrSeed(KEYS.userName, "there"));
    setAssignments(loadOrSeed(KEYS.assignments, SAMPLE_ASSIGNMENTS));
    setTasks(loadOrSeed(KEYS.tasks, SAMPLE_TASKS));
    setClasses(loadOrSeed(KEYS.classes, SAMPLE_CLASSES));
    setEvents(loadOrSeed(KEYS.events, SAMPLE_EVENTS));
    setStudyPlans(loadOrSeed(KEYS.studyPlans, SAMPLE_STUDY_PLANS));
    setWatchlistState(loadOrSeed(KEYS.watchlist, DEFAULT_WATCHLIST));
    setChat(loadOrSeed(KEYS.chat, [] as ChatMessage[]));
    setHydrated(true);
  }, []);

  const setUserName = useCallback((v: string) => {
    setUserNameState(v);
    persist(KEYS.userName, v);
  }, []);

  const addAssignment = useCallback((a: Omit<Assignment, "id">) => {
    setAssignments((prev) => {
      const next = [...prev, { ...a, id: uid("asg") }];
      persist(KEYS.assignments, next);
      return next;
    });
  }, []);
  const updateAssignment = useCallback((id: string, patch: Partial<Assignment>) => {
    setAssignments((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...patch } : a));
      persist(KEYS.assignments, next);
      return next;
    });
  }, []);
  const deleteAssignment = useCallback((id: string) => {
    setAssignments((prev) => {
      const next = prev.filter((a) => a.id !== id);
      persist(KEYS.assignments, next);
      return next;
    });
  }, []);

  const addTask = useCallback((t: Omit<Task, "id">) => {
    setTasks((prev) => {
      const next = [...prev, { ...t, id: uid("tsk") }];
      persist(KEYS.tasks, next);
      return next;
    });
  }, []);
  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...patch } : t));
      persist(KEYS.tasks, next);
      return next;
    });
  }, []);
  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      persist(KEYS.tasks, next);
      return next;
    });
  }, []);

  const addClass = useCallback((c: Omit<ClassItem, "id">) => {
    setClasses((prev) => {
      const next = [...prev, { ...c, id: uid("cls") }];
      persist(KEYS.classes, next);
      return next;
    });
  }, []);
  const updateClass = useCallback((id: string, patch: Partial<ClassItem>) => {
    setClasses((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...patch } : c));
      persist(KEYS.classes, next);
      return next;
    });
  }, []);
  const deleteClass = useCallback((id: string) => {
    setClasses((prev) => {
      const next = prev.filter((c) => c.id !== id);
      persist(KEYS.classes, next);
      return next;
    });
  }, []);

  const addEvent = useCallback((e: Omit<CalendarEvent, "id">) => {
    setEvents((prev) => {
      const next = [...prev, { ...e, id: uid("evt") }];
      persist(KEYS.events, next);
      return next;
    });
  }, []);
  const updateEvent = useCallback((id: string, patch: Partial<CalendarEvent>) => {
    setEvents((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...patch } : e));
      persist(KEYS.events, next);
      return next;
    });
  }, []);
  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id);
      persist(KEYS.events, next);
      return next;
    });
  }, []);

  const addStudyPlan = useCallback((s: Omit<StudyPlan, "id">) => {
    setStudyPlans((prev) => {
      const next = [...prev, { ...s, id: uid("study") }];
      persist(KEYS.studyPlans, next);
      return next;
    });
  }, []);
  const updateStudyPlan = useCallback((id: string, patch: Partial<StudyPlan>) => {
    setStudyPlans((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...patch } : s));
      persist(KEYS.studyPlans, next);
      return next;
    });
  }, []);
  const deleteStudyPlan = useCallback((id: string) => {
    setStudyPlans((prev) => {
      const next = prev.filter((s) => s.id !== id);
      persist(KEYS.studyPlans, next);
      return next;
    });
  }, []);

  const setWatchlist = useCallback((symbols: string[]) => {
    const cleaned = Array.from(new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean)));
    setWatchlistState(cleaned);
    persist(KEYS.watchlist, cleaned);
  }, []);

  const addChatMessage = useCallback((m: Omit<ChatMessage, "id" | "createdAt">) => {
    setChat((prev) => {
      const next = [...prev, { ...m, id: uid("msg"), createdAt: new Date().toISOString() }];
      persist(KEYS.chat, next);
      return next;
    });
  }, []);
  const clearChat = useCallback(() => {
    setChat([]);
    persist(KEYS.chat, []);
  }, []);

  const resetAllData = useCallback(() => {
    setAssignments(SAMPLE_ASSIGNMENTS);
    setTasks(SAMPLE_TASKS);
    setClasses(SAMPLE_CLASSES);
    setEvents(SAMPLE_EVENTS);
    setStudyPlans(SAMPLE_STUDY_PLANS);
    setWatchlistState(DEFAULT_WATCHLIST);
    setChat([]);
    persist(KEYS.assignments, SAMPLE_ASSIGNMENTS);
    persist(KEYS.tasks, SAMPLE_TASKS);
    persist(KEYS.classes, SAMPLE_CLASSES);
    persist(KEYS.events, SAMPLE_EVENTS);
    persist(KEYS.studyPlans, SAMPLE_STUDY_PLANS);
    persist(KEYS.watchlist, DEFAULT_WATCHLIST);
    persist(KEYS.chat, []);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      hydrated,
      userName,
      setUserName,
      assignments,
      addAssignment,
      updateAssignment,
      deleteAssignment,
      tasks,
      addTask,
      updateTask,
      deleteTask,
      classes,
      addClass,
      updateClass,
      deleteClass,
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      studyPlans,
      addStudyPlan,
      updateStudyPlan,
      deleteStudyPlan,
      watchlist,
      setWatchlist,
      chat,
      addChatMessage,
      clearChat,
      resetAllData,
    }),
    [
      hydrated,
      userName,
      setUserName,
      assignments,
      addAssignment,
      updateAssignment,
      deleteAssignment,
      tasks,
      addTask,
      updateTask,
      deleteTask,
      classes,
      addClass,
      updateClass,
      deleteClass,
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      studyPlans,
      addStudyPlan,
      updateStudyPlan,
      deleteStudyPlan,
      watchlist,
      setWatchlist,
      chat,
      addChatMessage,
      clearChat,
      resetAllData,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
