"use client";

import type { ReactNode } from "react";

type AdminStatsCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  iconClassName?: string;
  variant?: "default" | "warning";
  badge?: ReactNode;
};

export default function AdminStatsCard({
  label,
  value,
  icon,
  iconClassName = "bg-surface-container text-status-draft",
  variant = "default",
  badge,
}: AdminStatsCardProps) {
  const isWarning = variant === "warning";

  return (
    <div
      className={`rounded-radius-lg border p-6 shadow-level-1 transition-all hover:-translate-y-1 hover:shadow-level-2 ${
        isWarning
          ? "border-status-warning/10 bg-status-warning-bg"
          : "border-border-default/80 bg-surface-card"
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-radius-md ${
            isWarning ? "bg-surface-card/50 text-status-warning" : iconClassName
          }`}
        >
          {icon}
        </div>
        {badge}
      </div>
      <p
        className={`mb-1 font-sarabun text-label ${
          isWarning ? "text-status-warning" : "text-text-muted"
        }`}
      >
        {label}
      </p>
      <p
        className={`font-kanit text-heading-2 font-bold leading-tight ${
          isWarning
            ? "text-status-warning"
            : value.includes(",")
              ? "text-text-primary"
              : "text-primary-dark"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
