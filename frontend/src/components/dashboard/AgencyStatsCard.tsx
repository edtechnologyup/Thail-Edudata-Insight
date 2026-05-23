"use client";

import type { ReactNode } from "react";

type AgencyStatsCardProps = {
  label: string;
  value: string;
  footer?: ReactNode;
  icon: ReactNode;
  iconClassName?: string;
};

export default function AgencyStatsCard({
  label,
  value,
  footer,
  icon,
  iconClassName = "bg-primary-light text-primary-dark",
}: AgencyStatsCardProps) {
  return (
    <div className="rounded-radius-lg border border-border-default/80 bg-surface-card p-5 shadow-level-1 transition-shadow hover:shadow-level-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-sarabun text-body-md text-text-muted">{label}</p>
          <p className="mt-2 font-kanit text-[32px] font-bold leading-tight text-text-primary">
            {value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-radius-full ${iconClassName}`}
        >
          {icon}
        </div>
      </div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}
