import type { ReactNode } from "react";

type StatsCardProps = {
  label: string;
  value: string;
  footer?: string;
  valueClassName?: string;
  icon?: ReactNode;
  accentColor?: string;
  /** ใบเด่น: พื้นน้ำเงินไล่เฉด ตัวหนังสือขาวทั้งใบ */
  solid?: boolean;
  /** ลวดลายตกแต่งภายในการ์ด (เช่น กราฟคลื่น) */
  decoration?: ReactNode;
};

export default function StatsCard({
  label,
  value,
  footer,
  valueClassName = "text-text-primary",
  icon,
  accentColor = "#1a237e",
  solid = false,
  decoration,
}: StatsCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-6 shadow-level-1 transition-transform hover:-translate-y-1 md:p-8 ${
        solid ? "border-transparent" : "border-border-default/60 bg-white"
      }`}
      style={
        solid
          ? { background: "linear-gradient(135deg, #283593 0%, #1a237e 55%, #111857 100%)" }
          : undefined
      }
    >
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <span className={`font-sarabun text-body-md ${solid ? "text-white/80" : "text-text-muted"}`}>
            {label}
          </span>
          <p
            className={`mt-1 font-kanit text-[3rem] font-bold leading-tight md:text-[3.5rem] ${
              solid ? "text-white" : valueClassName
            }`}
          >
            {value}
          </p>
        </div>
        {icon && (
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-radius-full ${
              solid ? "bg-white/15" : ""
            }`}
            style={solid ? undefined : { backgroundColor: `${accentColor}15` }}
          >
            {icon}
          </div>
        )}
      </div>
      {footer ? (
        <p
          className={`relative z-10 mt-2 flex items-center gap-1 font-sarabun text-label font-normal ${
            solid ? "text-white/75" : ""
          }`}
          style={solid ? undefined : { color: accentColor }}
        >
          {footer}
        </p>
      ) : null}
      {decoration}
    </div>
  );
}
