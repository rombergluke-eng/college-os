"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  ListChecks,
  CheckSquare,
  GraduationCap,
  LineChart,
  Newspaper,
  BookOpen,
  Sparkles,
  Settings,
} from "lucide-react";
import React from "react";
import { useStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/assignments", label: "Assignments", icon: ListChecks },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/classes", label: "Classes", icon: GraduationCap },
  { href: "/finance", label: "Finance", icon: LineChart },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/study", label: "Study", icon: BookOpen },
  { href: "/assistant", label: "AI Assistant", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userName } = useStore();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-crimson text-white">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/15">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 font-serif text-lg font-bold">
            IU
          </div>
          <div className="leading-tight">
            <div className="font-serif text-[15px] font-semibold">College OS</div>
            <div className="text-[11px] text-white/70">Kelley School of Business</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-[13.5px] transition-colors ${
                  active ? "bg-white/15 font-medium text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={17} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-white/15 text-[11px] text-white/60">
          Signed in as {userName !== "there" ? userName : "you"} · data stored on this device
        </div>
      </aside>

      <main className="flex-1 min-w-0 bg-cream">
        <MobileNav pathname={pathname} />
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-7">{children}</div>
      </main>
    </div>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <div className="md:hidden sticky top-0 z-40 flex items-center gap-1 overflow-x-auto border-b border-line bg-crimson px-3 py-2">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] ${
              active ? "bg-white/15 text-white font-medium" : "text-white/75"
            }`}
          >
            <Icon size={14} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
