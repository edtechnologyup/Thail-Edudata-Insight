import type { ReactNode } from "react";

type StatsCardProps = {
  label: string;
  value: string;
  footer?: string;
  valueClassName?: string;
  icon?: ReactNode;
  accentColor?: string;
};

export default function StatsCard({
  label,
  value,
  footer,
  valueClassName = "text-text-primary",
  icon,
  accentColor = "#00695c",
}: StatsCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-default/60 bg-white p-5 shadow-level-1 transition-transform hover:-translate-y-1 md:p-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-sarabun text-label text-text-muted">{label}</span>
          <p className={`mt-1 font-kanit text-[2.5rem] font-bold leading-tight ${valueClassName}`}>
            {value}
          </p>
        </div>
        {icon && (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            {icon}
          </div>
        )}
      </div>
      {footer ? (
        <p className="mt-2 flex items-center gap-1 font-sarabun text-caption font-semibold" style={{ color: accentColor }}>
          {footer}
        </p>
      ) : null}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  );
}
