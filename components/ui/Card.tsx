import React from "react";

export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`bg-paper border border-line rounded-card shadow-card ${padded ? "p-5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
  icon,
}: {
  title: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-serif text-[15px] font-semibold text-ink">{title}</h3>
      </div>
      {action}
    </div>
  );
}
