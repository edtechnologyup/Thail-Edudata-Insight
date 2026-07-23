"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useMyMLModels, useUpdateMLModel, type MLModelStatus } from "@/hooks/useMLModels";

type Props = {
  page: number;
  onPageChange: (page: number) => void;
  statusFilter?: MLModelStatus;
  search?: string;
  onDelete: (model: { id: string; name: string }) => void;
};

function StatusBadge({ status }: { status: MLModelStatus }) {
  const config = {
    ready: {
      label: "พร้อมใช้",
      dot: "bg-status-published",
      bg: "bg-status-published-bg",
      text: "text-status-published",
    },
    training: {
      label: "กำลังเทรน",
      dot: "bg-[#f9a825]",
      bg: "bg-[#fff8e1]",
      text: "text-[#f9a825]",
    },
    failed: {
      label: "ล้มเหลว",
      dot: "bg-status-error",
      bg: "bg-status-error-bg",
      text: "text-status-error",
    },
  };
  const c = config[status] ?? config.failed;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sarabun text-caption font-semibold ${c.bg} ${c.text}`}
    >
      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function ModelTypeBadge({ type }: { type: string }) {
  const isClassification = type === "classification";
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 font-sarabun text-caption font-medium ${
        isClassification
          ? "bg-primary-light text-primary-dark"
          : "bg-[#fce4ec] text-[#c62828]"
      }`}
    >
      {isClassification ? "จำแนก" : "พยากรณ์"}
    </span>
  );
}

function MetricsSummary({ metrics }: { metrics: Record<string, unknown> | null }) {
  if (!metrics) return <span className="text-text-muted">-</span>;
  if (metrics.accuracy != null) {
    return (
      <span className="font-sarabun text-body-md text-status-published">
        {(Number(metrics.accuracy) * 100).toFixed(1)}%
      </span>
    );
  }
  if (metrics.r2_score != null) {
    return (
      <span className="font-sarabun text-body-md text-primary-dark">
        R² {(Number(metrics.r2_score) * 100).toFixed(1)}%
      </span>
    );
  }
  return <span className="text-text-muted">-</span>;
}

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-14 rounded-xl bg-surface-container" />
      ))}
    </div>
  );
}

export default function AgencyMLModelTable({
  page,
  onPageChange,
  statusFilter,
  search,
  onDelete,
}: Props) {
  const locale = useLocale();
  const base = `/${locale}`;
  const { data, isLoading, isError } = useMyMLModels(page, statusFilter, search);
  const updateMutation = useUpdateMLModel();

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border-default/60 bg-surface-card shadow-level-1">
        <TableSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-status-error/30 bg-status-error/5 px-6 py-8 text-center shadow-level-1">
        <p className="font-sarabun text-body-md text-status-error">
          โหลดรายการโมเดลไม่สำเร็จ
        </p>
      </div>
    );
  }

  const models = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const pageSize = 10;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border-default/60 bg-surface-card px-6 py-16 text-center shadow-level-1">
        <ModelIcon />
        <p className="mt-3 font-sarabun text-body-lg text-text-secondary">
          ยังไม่มีโมเดล
        </p>
        <Link
          href={`${base}/models/create`}
          className="mt-4 rounded-xl bg-primary-dark px-6 py-2.5 font-sarabun text-label font-medium text-white transition-opacity hover:opacity-90"
        >
          สร้างโมเดลแรก
        </Link>
      </div>
    );
  }

  const handleTogglePublic = (modelId: string, currentPublic: boolean) => {
    updateMutation.mutate({ modelId, is_public: !currentPublic });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border-default/60 bg-surface-card shadow-level-1">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#eceef1]">
            <tr className="font-sarabun text-[15px] font-bold text-text-muted">
              <th className="px-6 py-3.5">ชื่อโมเดล</th>
              <th className="px-6 py-3.5">ประเภท</th>
              <th className="px-6 py-3.5">ความแม่นยำ</th>
              <th className="px-6 py-3.5">สถานะ</th>
              <th className="px-6 py-3.5 text-center">ใช้งาน</th>
              <th className="px-6 py-3.5 text-center">สาธารณะ</th>
              <th className="px-6 py-3.5 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/20">
            {models.map((m) => (
              <tr
                key={m.id}
                className="group transition-colors hover:bg-[#f7f9fc]"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <ModelRowIcon />
                    <div className="min-w-0">
                      <Link
                        href={`${base}/models/${m.id}`}
                        className="block max-w-[260px] truncate font-sarabun text-body-md font-bold text-text-primary hover:underline"
                      >
                        {m.name}
                      </Link>
                      {m.description && (
                        <p className="mt-0.5 max-w-[260px] truncate font-sarabun text-[11px] text-text-muted">
                          {m.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <ModelTypeBadge type={m.model_type ?? ""} />
                </td>
                <td className="px-6 py-4">
                  <MetricsSummary metrics={m.metrics} />
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={m.status} />
                </td>
                <td className="px-6 py-4 text-center font-sarabun text-body-md text-text-primary">
                  {m.predict_count.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    type="button"
                    onClick={() => handleTogglePublic(m.id, m.is_public)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      m.is_public ? "bg-status-published" : "bg-[#ccc]"
                    }`}
                    title={m.is_public ? "เปิดสาธารณะ" : "ส่วนตัว"}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        m.is_public ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`${base}/models/${m.id}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[#01579b] transition-colors hover:bg-[#e1f5fe]"
                      title="ดูรายละเอียด"
                    >
                      <EyeIcon />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete({ id: m.id, name: m.name })}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[#d01716] transition-colors hover:bg-[#ffdad6]"
                      title="ลบ"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div className="flex flex-col gap-4 border-t border-border-default/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sarabun text-label text-text-muted">
            แสดง {from}-{to} จาก {total} รายการ
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-container disabled:opacity-30"
            >
              <ChevronLeftIcon />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onPageChange(n)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg font-sarabun text-caption font-bold transition-colors ${
                  n === page
                    ? "bg-[#01579b] text-white"
                    : "text-text-primary hover:bg-surface-container"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-container disabled:opacity-30"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ModelIcon() {
  return (
    <svg className="h-12 w-12 text-text-muted/40" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.36.2-.8.2-1.14 0l-7.9-4.44A.994.994 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.36-.2.8-.2 1.14 0l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L5 8.09v7.82l7 3.94 7-3.94V8.09l-7-3.94z" />
    </svg>
  );
}

function ModelRowIcon() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded bg-surface-container text-primary-dark transition-colors group-hover:bg-primary-light">
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.36.2-.8.2-1.14 0l-7.9-4.44A.994.994 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.36-.2.8-.2 1.14 0l7.9 4.44c.32.17.53.5.53.88v9z" />
      </svg>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
    </svg>
  );
}
