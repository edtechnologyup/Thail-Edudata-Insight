"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  useMLModelDetail,
  useUpdateMLModel,
  useRetrainMLModel,
  useDeleteMLModel,
} from "@/hooks/useMLModels";
import DeleteMLModelModal from "@/components/ml-model/DeleteMLModelModal";

type FeatureImportance = { column: string; importance: number };
type ActualVsPredicted = { actual: number[]; predicted: number[] };

export default function ModelDetailPage() {
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const modelId = params.id as string;

  const { data: model, isLoading, isError } = useMLModelDetail(modelId);
  const updateMutation = useUpdateMLModel();
  const retrainMutation = useRetrainMLModel();

  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#01579b] border-t-transparent" />
      </div>
    );
  }

  if (isError || !model) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <p className="font-sarabun text-body-md text-status-error">ไม่พบโมเดล</p>
        <Link
          href={`/${locale}/models`}
          className="mt-4 inline-block font-sarabun text-label text-[#01579b] hover:underline"
        >
          กลับไปรายการโมเดล
        </Link>
      </div>
    );
  }

  const metrics = model.metrics ?? {};
  const isRegression = model.model_type === "regression";
  const featureImportance: FeatureImportance[] = metrics.feature_importance ?? [];
  const actualVsPredicted: ActualVsPredicted | null = metrics.actual_vs_predicted ?? null;
  const confusionMatrix: number[][] | null = metrics.confusion_matrix ?? null;
  const mainScore = isRegression
    ? metrics.r2_score
    : metrics.accuracy;

  const handleTogglePublic = () => {
    updateMutation.mutate(
      { modelId: model.id, is_public: !model.is_public },
      {
        onSuccess: () => setToast({ type: "success", msg: model.is_public ? "ปิดสาธารณะแล้ว" : "เปิดสาธารณะแล้ว" }),
        onError: (err) => setToast({ type: "error", msg: err.message }),
      },
    );
  };

  const handleRetrain = () => {
    retrainMutation.mutate(model.id, {
      onSuccess: () => setToast({ type: "success", msg: "เริ่มเทรนใหม่แล้ว" }),
      onError: (err) => setToast({ type: "error", msg: err.message }),
    });
  };

  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      {/* Header */}
      <header
        className="relative overflow-hidden rounded-2xl p-6 lg:p-7"
        style={{
          background: "linear-gradient(135deg, #01579b 0%, #0277bd 60%, #0288d1 100%)",
        }}
      >
        <div className="relative z-10">
          <Link
            href={`/${locale}/models`}
            className="mb-2 flex items-center gap-1 font-sarabun text-caption text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeftIcon /> กลับไปรายการโมเดล
          </Link>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-kanit text-xl font-bold text-white">{model.name}</h1>
              {model.description && (
                <p className="mt-1 font-sarabun text-sm text-white/70">{model.description}</p>
              )}
            </div>
            <StatusBadgeWhite status={model.status} />
          </div>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div
          className={`rounded-xl border px-4 py-3 font-sarabun text-label ${
            toast.type === "success"
              ? "border-[#43a047] bg-[#e8f5e9] text-[#2e7d32]"
              : "border-status-error bg-status-error-bg text-status-error"
          }`}
        >
          {toast.msg}
          <button type="button" onClick={() => setToast(null)} className="ml-3 font-bold">×</button>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <InfoCard label="ประเภท" value={isRegression ? "พยากรณ์ค่า" : "จำแนกประเภท"} />
        <InfoCard label="อัลกอริทึม" value={metrics.algorithm ?? "-"} />
        <InfoCard
          label="เวลาเทรน"
          value={model.training_duration ? `${model.training_duration} วินาที` : "-"}
        />
        <InfoCard label="ใช้ทำนาย" value={`${model.predict_count} ครั้ง`} />
      </div>

      {/* Data info */}
      <div className="rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1">
        <h2 className="mb-4 font-kanit text-lg font-bold text-text-primary">ข้อมูลที่ใช้</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="font-sarabun text-caption text-text-muted">Dataset</p>
            <Link
              href={`/${locale}/datasets/${model.dataset_id}`}
              className="font-sarabun text-body-md font-semibold text-[#01579b] hover:underline"
            >
              {model.dataset_title ?? model.dataset_id}
            </Link>
          </div>
          <div>
            <p className="font-sarabun text-caption text-text-muted">คอลัมน์เป้าหมาย</p>
            <p className="font-sarabun text-body-md font-semibold text-text-primary">
              {model.target_column}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="font-sarabun text-caption text-text-muted">คอลัมน์ข้อมูลที่ใช้ทำนาย</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {(model.feature_columns ?? []).map((col) => (
                <span
                  key={col}
                  className="rounded-full bg-[#e8eaf6] px-3 py-1 font-sarabun text-caption font-medium text-[#3949ab]"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
          {metrics.data_rows != null && (
            <div className="md:col-span-2">
              <p className="font-sarabun text-caption text-text-muted">
                ข้อมูลทั้งหมด {metrics.data_rows} แถว — ใช้เทรน {metrics.train_rows} แถว, ทดสอบ {metrics.test_rows} แถว
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Score + explanation */}
      {model.status === "ready" && (
        <div className="rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1">
          <h2 className="mb-4 font-kanit text-lg font-bold text-text-primary">ผลการเทรน</h2>

          {/* Main score */}
          <div className="mb-6 flex flex-col items-center rounded-xl bg-[#f8f9fa] py-6">
            <p className="font-sarabun text-caption text-text-muted">
              {isRegression ? "R² Score" : "Accuracy"}
            </p>
            <p
              className={`font-kanit text-4xl font-bold ${
                (mainScore ?? 0) >= 0.7
                  ? "text-[#43a047]"
                  : (mainScore ?? 0) >= 0.4
                    ? "text-[#f9a825]"
                    : "text-[#e53935]"
              }`}
            >
              {mainScore != null ? `${(mainScore * 100).toFixed(1)}%` : "-"}
            </p>
            <p className="mt-2 max-w-md text-center font-sarabun text-body-md text-text-secondary">
              {getScoreExplanation(isRegression, mainScore)}
            </p>
          </div>

          {/* All metrics */}
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-2">
            {isRegression ? (
              <>
                <MetricCard label="R² Score" value={fmtPct(metrics.r2_score)} hint="ยิ่งใกล้ 100% ยิ่งดี — แปลว่าโมเดลอธิบายข้อมูลได้มากแค่ไหน" />
                <MetricCard label="MAE" value={metrics.mae?.toFixed(2) ?? "-"} hint="ค่าเฉลี่ยที่ทำนายผิด — ยิ่งน้อยยิ่งดี" />
              </>
            ) : (
              <>
                <MetricCard label="Accuracy" value={fmtPct(metrics.accuracy)} hint="ทำนายถูกกี่เปอร์เซ็นต์จากทั้งหมด" />
                <MetricCard label="Precision" value={fmtPct(metrics.precision)} hint="ตอบว่า 'ใช่' แล้วถูกจริงกี่ %" />
                <MetricCard label="Recall" value={fmtPct(metrics.recall)} hint="ของจริงที่เป็น 'ใช่' หาเจอกี่ %" />
                <MetricCard label="F1 Score" value={fmtPct(metrics.f1)} hint="ค่าเฉลี่ยของ Precision กับ Recall" />
              </>
            )}
          </div>

          {/* Diagnosis */}
          {mainScore != null && mainScore < 0.5 && (
            <div className="mb-6 rounded-xl border border-[#e0c97f]/60 bg-[#fdf8eb] px-4 py-3">
              <p className="mb-1 font-sarabun text-caption font-bold text-[#8d6e00]">
                ทำไมค่าถึงต่ำ?
              </p>
              <ul className="list-disc pl-5 font-sarabun text-caption text-text-secondary">
                <li>ข้อมูลน้อยเกินไป</li>
                <li>คอลัมน์ที่เลือกอาจไม่เกี่ยวข้องกับเป้าหมาย</li>
                <li>ข้อมูลมีค่าซ้ำกันมาก หรือมีค่าว่างเยอะ</li>
              </ul>
              <p className="mt-1 font-sarabun text-caption font-semibold text-[#8d6e00]">
                แนะนำ: เพิ่มข้อมูล หรือเลือกคอลัมน์ใหม่แล้วสร้างโมเดลใหม่
              </p>
            </div>
          )}

          {/* Feature Importance Chart */}
          {featureImportance.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-1 font-kanit text-base font-bold text-text-primary">
                คอลัมน์ไหนมีผลต่อการทำนายมากสุด
              </h3>
              <p className="mb-3 font-sarabun text-caption text-text-muted">
                แท่งยิ่งยาว = คอลัมน์นั้นสำคัญมาก ถ้าค่าใกล้ 0 แปลว่าแทบไม่มีผล
              </p>
              <div className="max-w-xl space-y-2">
                {featureImportance.map((fi) => {
                  const pct = Math.max(fi.importance * 100, 1);
                  return (
                    <div key={fi.column} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 truncate font-sarabun text-label font-medium text-text-primary">
                        {fi.column}
                      </span>
                      <div className="flex-1">
                        <div className="h-6 rounded-full bg-[#f0f2f5]">
                          <div
                            className="flex h-6 items-center rounded-full bg-gradient-to-r from-[#01579b] to-[#0288d1] px-2"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          >
                            <span className="font-sarabun text-[11px] font-bold text-white">
                              {(fi.importance * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actual vs Predicted (Regression) */}
          {actualVsPredicted && (
            <div className="mb-6">
              <h3 className="mb-1 font-kanit text-base font-bold text-text-primary">
                ค่าจริง vs ค่าที่โมเดลทำนาย
              </h3>
              <p className="mb-3 font-sarabun text-caption text-text-muted">
                จุดยิ่งเกาะเส้นทแยง = โมเดลทำนายได้ยิ่งแม่นยำ
              </p>
              <ScatterChart
                actual={actualVsPredicted.actual}
                predicted={actualVsPredicted.predicted}
              />
            </div>
          )}

          {/* Confusion Matrix (Classification) */}
          {confusionMatrix && (
            <div className="mb-6">
              <h3 className="mb-1 font-kanit text-base font-bold text-text-primary">
                ตารางผลการจำแนก (Confusion Matrix)
              </h3>
              <p className="mb-3 font-sarabun text-caption text-text-muted">
                แนวตั้ง = ค่าจริง, แนวนอน = ค่าที่โมเดลทำนาย — ตัวเลขบนแนวทแยง = ทำนายถูก
              </p>
              <ConfusionMatrixTable matrix={confusionMatrix} />
            </div>
          )}
        </div>
      )}

      {/* Failed error */}
      {model.status === "failed" && model.error_message && (
        <div className="rounded-2xl border border-status-error bg-status-error-bg p-6">
          <h2 className="mb-2 font-kanit text-lg font-bold text-status-error">เทรนไม่สำเร็จ</h2>
          <p className="font-sarabun text-body-md text-status-error">{model.error_message}</p>
        </div>
      )}

      {/* Actions */}
      <div className="rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1">
        <h2 className="mb-4 font-kanit text-lg font-bold text-text-primary">จัดการโมเดล</h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleTogglePublic}
            disabled={updateMutation.isPending}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-sarabun text-label font-semibold transition-all ${
              model.is_public
                ? "bg-[#e8f5e9] text-[#2e7d32] hover:bg-[#c8e6c9]"
                : "bg-[#f0f2f5] text-text-secondary hover:bg-[#e0e0e0]"
            }`}
          >
            {model.is_public ? <GlobeIcon /> : <LockIcon />}
            {model.is_public ? "สาธารณะ — กดเพื่อปิด" : "ส่วนตัว — กดเพื่อเปิดสาธารณะ"}
          </button>

          <button
            type="button"
            onClick={handleRetrain}
            disabled={retrainMutation.isPending || model.status === "training"}
            className="inline-flex items-center gap-2 rounded-full bg-[#e3f2fd] px-5 py-2.5 font-sarabun text-label font-semibold text-[#1565c0] transition-all hover:bg-[#bbdefb] disabled:opacity-40"
          >
            <RetryIcon />
            {retrainMutation.isPending ? "กำลังเทรนใหม่..." : "เทรนใหม่"}
          </button>

          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#ffebee] px-5 py-2.5 font-sarabun text-label font-semibold text-[#e53935] transition-all hover:bg-[#ffcdd2]"
          >
            <TrashIcon />
            ลบโมเดล
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-6 font-sarabun text-caption text-text-muted">
        <span>สร้าง: {new Date(model.created_at).toLocaleDateString("th-TH")}</span>
        <span>อัปเดต: {new Date(model.updated_at).toLocaleDateString("th-TH")}</span>
      </div>

      <DeleteMLModelModal
        open={showDelete}
        model={showDelete ? { id: model.id, name: model.name } : null}
        onClose={() => setShowDelete(false)}
        onError={(msg) => setToast({ type: "error", msg })}
        onDeleted={() => router.push(`/${locale}/models`)}
      />
    </div>
  );
}

/* ─── Helper components ─── */

function getScoreExplanation(isRegression: boolean, score: number | undefined): string {
  if (score == null) return "";
  const pct = score * 100;

  if (isRegression) {
    if (score < 0) return `โมเดลทำนายได้แย่กว่าการเดาค่าเฉลี่ย (R² = ${pct.toFixed(1)}%) — คอลัมน์ที่เลือกอาจไม่เกี่ยวข้องกับเป้าหมาย`;
    if (score < 0.3) return `โมเดลอธิบายข้อมูลได้แค่ ${pct.toFixed(0)}% — ลองเพิ่มข้อมูลหรือเลือกคอลัมน์ที่เกี่ยวข้องมากกว่านี้`;
    if (score < 0.5) return `โมเดลอธิบายข้อมูลได้ ${pct.toFixed(0)}% — พอใช้ได้แต่ยังมีช่องว่างให้ปรับปรุง`;
    if (score < 0.7) return `โมเดลอธิบายข้อมูลได้ ${pct.toFixed(0)}% — ใช้งานได้ดีพอสมควร`;
    if (score < 0.9) return `โมเดลอธิบายข้อมูลได้ ${pct.toFixed(0)}% — ดีมาก ข้อมูลที่เลือกเกี่ยวข้องกับเป้าหมายสูง`;
    return `โมเดลอธิบายข้อมูลได้ ${pct.toFixed(0)}% — ยอดเยี่ยม`;
  }

  if (score < 0.4) return `ทำนายถูก ${pct.toFixed(0)}% — ยังต้องปรับปรุงอีกมาก ลองเลือกคอลัมน์ที่เกี่ยวข้องมากขึ้น`;
  if (score < 0.6) return `ทำนายถูก ${pct.toFixed(0)}% — พอใช้ได้แต่ยังไม่น่าเชื่อถือ`;
  if (score < 0.8) return `ทำนายถูก ${pct.toFixed(0)}% — ใช้งานได้ดีพอสมควร`;
  if (score < 0.95) return `ทำนายถูก ${pct.toFixed(0)}% — ดีมาก โมเดลน่าเชื่อถือ`;
  return `ทำนายถูก ${pct.toFixed(0)}% — ยอดเยี่ยม`;
}

function fmtPct(val: number | undefined): string {
  if (val == null) return "-";
  return `${(val * 100).toFixed(1)}%`;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-default/60 bg-surface-card px-4 py-4 shadow-level-1">
      <p className="font-sarabun text-[11px] font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="font-kanit text-lg font-bold text-text-primary">{value}</p>
    </div>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl bg-[#f8f9fa] px-4 py-3">
      <p className="font-sarabun text-caption font-semibold text-text-primary">{label}</p>
      <p className="font-kanit text-xl font-bold text-[#01579b]">{value}</p>
      <p className="mt-1 font-sarabun text-[11px] text-text-muted">{hint}</p>
    </div>
  );
}

function ScatterChart({ actual, predicted }: { actual: number[]; predicted: number[] }) {
  const allVals = [...actual, ...predicted];
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const range = max - min || 1;
  const w = 400;
  const h = 300;
  const pad = 40;

  const toX = (v: number) => pad + ((v - min) / range) * (w - 2 * pad);
  const toY = (v: number) => h - pad - ((v - min) / range) * (h - 2 * pad);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-2xl rounded-xl bg-[#f8f9fa]">
      {/* diagonal line */}
      <line x1={pad} y1={h - pad} x2={w - pad} y2={pad} stroke="#ccc" strokeWidth={1} strokeDasharray="4 4" />
      {/* axes labels */}
      <text x={w / 2} y={h - 5} textAnchor="middle" className="fill-text-muted" style={{ fontSize: 11 }}>
        ค่าจริง
      </text>
      <text x={10} y={h / 2} textAnchor="middle" transform={`rotate(-90,10,${h / 2})`} className="fill-text-muted" style={{ fontSize: 11 }}>
        ค่าทำนาย
      </text>
      {/* dots */}
      {actual.map((a, i) => (
        <circle
          key={i}
          cx={toX(a)}
          cy={toY(predicted[i])}
          r={3}
          fill="#0288d1"
          opacity={0.6}
        />
      ))}
    </svg>
  );
}

function ConfusionMatrixTable({ matrix }: { matrix: number[][] }) {
  const total = matrix.flat().reduce((a, b) => a + b, 0);
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse">
        <thead>
          <tr>
            <th className="px-3 py-2" />
            {matrix[0].map((_, j) => (
              <th key={j} className="px-3 py-2 font-sarabun text-caption font-semibold text-text-muted">
                ทำนาย {j}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td className="px-3 py-2 font-sarabun text-caption font-semibold text-text-muted">
                จริง {i}
              </td>
              {row.map((val, j) => {
                const isCorrect = i === j;
                return (
                  <td
                    key={j}
                    className={`px-3 py-2 text-center font-kanit text-base font-bold ${
                      isCorrect ? "bg-[#e8f5e9] text-[#2e7d32]" : "bg-[#ffebee] text-[#c62828]"
                    }`}
                  >
                    {val}
                    <span className="ml-1 font-sarabun text-[10px] font-normal text-text-muted">
                      ({total > 0 ? ((val / total) * 100).toFixed(0) : 0}%)
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadgeWhite({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string }> = {
    ready: { label: "พร้อมใช้", bg: "bg-[#43a047]" },
    training: { label: "กำลังเทรน", bg: "bg-[#f9a825]" },
    failed: { label: "ล้มเหลว", bg: "bg-[#e53935]" },
  };
  const c = config[status] ?? config.failed;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-sarabun text-label font-semibold text-white ${c.bg}`}>
      <span className="h-2 w-2 rounded-full bg-white/60" />
      {c.label}
    </span>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}
