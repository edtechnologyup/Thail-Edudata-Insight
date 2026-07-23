"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import {
  useMLModelDetail,
  usePredictMLModel,
  usePredictionLogs,
  useModelFeatureInfo,
} from "@/hooks/useMLModels";

type FeatureImportance = { column: string; importance: number };
type ActualVsPredicted = { actual: number[]; predicted: number[] };

export default function PublicModelCardPage() {
  const locale = useLocale();
  const params = useParams();
  const datasetId = params.id as string;
  const modelId = params.modelId as string;

  const { data: model, isLoading, isError } = useMLModelDetail(modelId);
  const { data: agencyLogs } = usePredictionLogs(modelId);
  const { data: featureInfoList } = useModelFeatureInfo(modelId);
  const predictMutation = usePredictMLModel();

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [localPredictions, setLocalPredictions] = useState<
    { input: Record<string, unknown>; result: unknown; time: string }[]
  >([]);
  const [predictError, setPredictError] = useState<string | null>(null);
  const [apiTab, setApiTab] = useState<"curl" | "python">("curl");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#01579b] border-t-transparent" />
      </div>
    );
  }

  if (isError || !model) {
    return (
      <div className="mx-auto max-w-[960px] py-12 text-center">
        <p className="font-sarabun text-body-md text-status-error">ไม่พบโมเดล</p>
        <Link
          href={`/${locale}/datasets/${datasetId}`}
          className="mt-4 inline-block font-sarabun text-label text-[#01579b] hover:underline"
        >
          กลับไปหน้า Dataset
        </Link>
      </div>
    );
  }

  const metrics = (model.metrics ?? {}) as Record<string, unknown>;
  const isRegression = model.model_type === "regression";
  const featureImportance: FeatureImportance[] =
    (metrics.feature_importance as FeatureImportance[]) ?? [];
  const actualVsPredicted: ActualVsPredicted | null =
    (metrics.actual_vs_predicted as ActualVsPredicted) ?? null;
  const confusionMatrix: number[][] | null =
    (metrics.confusion_matrix as number[][]) ?? null;
  const mainScore = (
    isRegression ? metrics.r2_score : metrics.accuracy
  ) as number | undefined;
  const featureCols = model.feature_columns ?? [];

  const handlePredict = () => {
    setPredictError(null);
    const inputData: Record<string, unknown> = {};
    for (const col of featureCols) {
      const raw = formValues[col]?.trim();
      if (!raw) {
        setPredictError(`กรุณากรอก "${col}"`);
        return;
      }
      const num = Number(raw);
      inputData[col] = isNaN(num) ? raw : num;
    }
    predictMutation.mutate(
      { modelId: model.id, inputData },
      {
        onSuccess: (data) =>
          setLocalPredictions((prev) => [
            {
              input: inputData,
              result: data.prediction,
              time: new Date().toLocaleTimeString("th-TH"),
            },
            ...prev,
          ]),
        onError: (err) => setPredictError(err.message),
      },
    );
  };


  const handleDownloadModel = () => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    const url = `${base}/ml-models/${model.id}/download`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${model.name.replace(/ /g, "_")}.pkl`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const copyToClipboard = (text: string, key: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
      });
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const apiBase = typeof window !== "undefined" ? window.location.origin : "";
  const curlCode = `curl -X POST \\
  ${apiBase}/api/v1/ml-models/${model.id}/predict \\
  -H "Content-Type: application/json" \\
  -d '{"input_data": {${featureCols.map((c) => `"${c}": ...`).join(", ")}}}'`;
  const pythonCode = `import requests

res = requests.post(
    "${apiBase}/api/v1/ml-models/${model.id}/predict",
    json={"input_data": {${featureCols.map((c) => `"${c}": ...`).join(", ")}}}
)
print(res.json()["data"]["prediction"])`;

  return (
    <div className="mx-auto max-w-[1100px] pb-12">
      {/* A: Header — full width */}
      <header
        className="relative mb-5 overflow-hidden rounded-2xl p-6"
        style={{
          background:
            "linear-gradient(135deg, #01579b 0%, #0277bd 60%, #0288d1 100%)",
        }}
      >
        <Link
          href={`/${locale}/datasets/${datasetId}`}
          className="mb-2 flex items-center gap-1 font-sarabun text-caption text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeftIcon /> กลับไปหน้า Dataset
        </Link>
        <h1 className="font-kanit text-xl font-bold text-white">
          {model.name}
        </h1>
        {model.description && (
          <p className="mt-1 font-sarabun text-sm text-white/70">
            {model.description}
          </p>
        )}
        <p className="mt-1 font-sarabun text-caption text-white/50">
          Dataset: {model.dataset_title ?? datasetId} &middot; สร้างโดย:{" "}
          {model.agency_name ?? "-"}
        </p>
      </header>

      {/* 2-column layout: content + sidebar */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

      {/* ===== LEFT: Main content ===== */}
      <div className="min-w-0 flex-1 space-y-5">

      {/* 2: โมเดลนี้ทำอะไรได้? — เปิดปิดได้ (ปิด default) */}
      <details className="group rounded-2xl border border-border-default/60 bg-surface-card shadow-level-1">
        <summary className="flex cursor-pointer items-center gap-2 p-5 [&::-webkit-details-marker]:hidden">
          <InfoCircleIcon />
          <h2 className="font-kanit text-base font-bold text-text-primary">
            โมเดลนี้ทำอะไรได้?
          </h2>
          <ChevronIcon className="ml-auto h-5 w-5 text-text-muted transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-3 px-5 pb-5">
          <div className="rounded-xl bg-[#f0f7ff] px-4 py-3">
            <p className="font-sarabun text-sm font-semibold text-[#01579b]">
              {isRegression ? "พยากรณ์ค่าตัวเลข" : "จำแนกประเภท"} — คืออะไร?
            </p>
            <p className="mt-1 font-sarabun text-caption text-[#01579b]/80">
              {isRegression
                ? `โมเดลนี้ใช้ข้อมูลที่มีอยู่ (${featureCols.join(", ")}) เพื่อ "คาดการณ์" ว่าค่า "${model.target_column}" จะเป็นเท่าไหร่ — เหมือนกับการดูแนวโน้มข้อมูลในอดีตแล้วพยากรณ์ว่าอนาคตจะเป็นไปในทิศทางไหน`
                : `โมเดลนี้ใช้ข้อมูลที่มีอยู่ (${featureCols.join(", ")}) เพื่อ "จำแนก" ว่า "${model.target_column}" จะเป็นประเภทไหน — เหมือนกับการเรียนรู้จากตัวอย่างในอดีตแล้วบอกว่าข้อมูลใหม่น่าจะอยู่กลุ่มไหน`}
            </p>
          </div>
          <div className="rounded-xl bg-[#f0f7ff] px-4 py-3">
            <p className="font-sarabun text-sm font-semibold text-[#01579b]">
              ผลการทำนายบอกอะไร?
            </p>
            <p className="mt-1 font-sarabun text-caption text-[#01579b]/80">
              {isRegression
                ? `เมื่อกรอกข้อมูล ${featureCols.join(", ")} แล้วกดทำนาย — ผลที่ได้คือ "ค่าตัวเลขที่คาดการณ์" ของ ${model.target_column} ตัวอย่างเช่น ถ้าทำนายงบประมาณ ผลอาจออกมาเป็น 25,000 หมายความว่าจากข้อมูลที่กรอก โมเดลคาดว่า${model.target_column}น่าจะอยู่ที่ประมาณ 25,000`
                : `เมื่อกรอกข้อมูล ${featureCols.join(", ")} แล้วกดทำนาย — ผลที่ได้คือ "ประเภท" ที่โมเดลคาดว่า ${model.target_column} น่าจะเป็น ตัวอย่างเช่น ถ้าจำแนกระดับ ผลอาจออกมาเป็น "สูง" หมายความว่าจากข้อมูลที่กรอก โมเดลคาดว่าน่าจะอยู่ในกลุ่ม "สูง"`}
            </p>
          </div>
          <div className="rounded-xl bg-[#e8f5e9] px-4 py-3">
            <p className="font-sarabun text-sm font-semibold text-[#1b5e20]">
              เอาผลไปใช้ทำอะไรได้?
            </p>
            <ul className="mt-1 list-disc pl-5 font-sarabun text-caption text-[#2e7d32]/80 space-y-0.5">
              <li>วางแผนล่วงหน้า — ใช้ผลคาดการณ์ประกอบการจัดสรรงบประมาณ ทรัพยากร หรือบุคลากร</li>
              <li>วิเคราะห์แนวโน้ม — ดูว่าถ้าเปลี่ยนปัจจัยต่างๆ ผลลัพธ์จะเปลี่ยนไปในทิศทางไหน</li>
              <li>เปรียบเทียบ — ลองกรอกข้อมูลหลายๆ ชุด แล้วเทียบว่าผลต่างกันยังไง</li>
              <li>ประกอบการตัดสินใจ — ใช้เป็นข้อมูลอ้างอิงเพิ่มเติม ไม่ใช่คำตอบสุดท้าย</li>
            </ul>
          </div>
          <div className="rounded-xl border border-[#e0c97f]/60 bg-[#fdf8eb] px-4 py-3">
            <p className="font-sarabun text-sm font-semibold text-[#8d6e00]">
              ข้อควรระวัง
            </p>
            <ul className="mt-1 list-disc pl-5 font-sarabun text-caption text-[#6d5600] space-y-0.5">
              <li>ผลทำนายเป็นการ &quot;คาดการณ์&quot; จากข้อมูลในอดีต ไม่ใช่ความจริงที่จะเกิดขึ้นแน่นอน</li>
              <li>ความแม่นยำขึ้นอยู่กับคุณภาพและปริมาณข้อมูลที่ใช้สอน</li>
              <li>ควรใช้ร่วมกับข้อมูลอื่นๆ ประกอบ ไม่ควรตัดสินใจจากผลทำนายเพียงอย่างเดียว</li>
            </ul>
          </div>
        </div>
      </details>

      {/* 3: ลองทำนาย — ย้ายขึ้นมา เห็นเลย */}
      <div id="section-predict" className="rounded-2xl border border-border-default/60 bg-surface-card p-5 shadow-level-1">
        <div className="mb-3 flex items-center gap-2">
          <PlayIcon />
          <h2 className="font-kanit text-base font-bold text-text-primary">
            ลองทำนาย
          </h2>
        </div>

        <div className="mb-4 rounded-xl bg-[#f0f7ff] px-4 py-3">
          <p className="font-sarabun text-sm text-[#01579b]">
            กรอกข้อมูลด้านล่างแล้วกด &quot;ทำนาย&quot; เพื่อดูผลลัพธ์ที่โมเดลคาดการณ์
          </p>
          <p className="mt-1 font-sarabun text-caption text-[#01579b]/70">
            โมเดลนี้ใช้ข้อมูล{" "}
            <b>{featureCols.join(", ")}</b>{" "}
            เพื่อทำนายค่า <b>{model.target_column}</b>{" "}
            — ลองเปลี่ยนค่าต่างๆ ดูว่าผลลัพธ์เปลี่ยนไปยังไง สามารถนำผลไปใช้วางแผน วิเคราะห์แนวโน้ม หรือประกอบการตัดสินใจได้
          </p>
        </div>

        {featureInfoList && featureInfoList.length > 0 && (
          <div className="mb-4 rounded-xl border border-border-default/40 bg-[#f8f9fa] px-4 py-3">
            <p className="mb-2 font-sarabun text-caption font-semibold text-text-primary">
              ข้อมูลที่มีใน Dataset นี้
            </p>
            <div className="space-y-1.5">
              {featureInfoList.map((fi) => (
                <div key={fi.column_name} className="flex items-start gap-2 font-sarabun text-caption">
                  <span className="shrink-0 font-semibold text-[#01579b]">{fi.column_name}</span>
                  <span className="text-text-muted">—</span>
                  {fi.dtype === "number" ? (
                    <span className="text-text-secondary">
                      ตัวเลข ตั้งแต่ {fi.min?.toLocaleString()} ถึง {fi.max?.toLocaleString()} (เฉลี่ย {fi.mean?.toLocaleString()})
                    </span>
                  ) : (
                    <span className="text-text-secondary">
                      {fi.options?.length} ค่า เช่น {fi.options?.slice(0, 3).join(", ")}
                      {(fi.options?.length ?? 0) > 3 && " ..."}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {featureCols.map((col) => {
            const fi = featureInfoList?.find((f) => f.column_name === col);
            const isText = fi?.dtype === "text";
            return (
              <div key={col}>
                <label className="mb-1 block font-sarabun text-caption font-medium text-text-primary">
                  {col}
                </label>
                {isText && fi?.options ? (
                  <select
                    value={formValues[col] ?? ""}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        [col]: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border-default/60 bg-white px-3 py-2.5 font-sarabun text-sm text-text-primary outline-none transition-colors focus:border-[#01579b]"
                  >
                    <option value="">เลือก {col}</option>
                    {fi.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={fi?.dtype === "number" ? "number" : "text"}
                    placeholder={
                      fi?.dtype === "number" && fi.mean != null
                        ? `เช่น ${fi.mean.toLocaleString()}`
                        : `กรอกค่า ${col}`
                    }
                    value={formValues[col] ?? ""}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        [col]: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border-default/60 bg-white px-3 py-2.5 font-sarabun text-sm text-text-primary outline-none transition-colors focus:border-[#01579b]"
                  />
                )}
              </div>
            );
          })}
        </div>
        {predictError && (
          <p className="mb-3 font-sarabun text-caption text-status-error">
            {predictError}
          </p>
        )}
        <button
          type="button"
          onClick={handlePredict}
          disabled={predictMutation.isPending}
          className="w-full rounded-xl bg-[#01579b] px-5 py-3 font-sarabun text-sm font-semibold text-white transition-colors hover:bg-[#0277bd] disabled:opacity-50"
        >
          {predictMutation.isPending ? "กำลังทำนาย..." : "ทำนาย"}
        </button>

        {localPredictions.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="font-sarabun text-caption font-semibold text-text-muted">
              ผลการทำนายของคุณ (ปิดหน้าเว็บจะหายไป)
            </p>
            {localPredictions.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-[#e8f5e9] px-4 py-3"
              >
                <div>
                  <p className="font-kanit text-lg font-bold text-[#1b5e20]">
                    {String(p.result)}
                  </p>
                  <p className="font-sarabun text-[11px] text-[#2e7d32]/70">
                    {featureCols.map((c) => `${c}: ${p.input[c]}`).join(", ")}
                  </p>
                </div>
                <span className="font-sarabun text-[11px] text-text-muted">
                  {p.time}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4: ผลทำนายโดยหน่วยงาน */}
      {agencyLogs && agencyLogs.length > 0 && (
        <div className="rounded-2xl border border-border-default/60 bg-surface-card p-5 shadow-level-1">
          <div className="mb-4 flex items-center gap-2">
            <HistoryIcon />
            <h2 className="font-kanit text-base font-bold text-text-primary">
              ผลทำนายโดยหน่วยงาน
            </h2>
          </div>
          <p className="mb-3 font-sarabun text-caption text-text-muted">
            ผลทำนายที่หน่วยงานเจ้าของโมเดลทดสอบไว้
          </p>
          <div className="space-y-2">
            {agencyLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-xl border border-border-default/40 bg-[#f8f9fa] px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-kanit text-base font-bold text-text-primary">
                    {String(log.result?.prediction ?? "-")}
                  </p>
                  <p className="truncate font-sarabun text-[11px] text-text-muted">
                    {Object.entries(log.input_data)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")}
                  </p>
                </div>
                <span className="ml-3 shrink-0 font-sarabun text-[11px] text-text-muted">
                  {new Date(log.created_at).toLocaleDateString("th-TH")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5: คำอธิบายผลลัพธ์ + คอลัมน์ — เปิดปิดได้ */}
      {mainScore != null && (
        <details id="section-explanation" className="group rounded-2xl border border-border-default/60 bg-surface-card shadow-level-1">
          <summary className="flex cursor-pointer items-center gap-2 p-5 [&::-webkit-details-marker]:hidden">
            <InfoCircleIcon />
            <h2 className="font-kanit text-base font-bold text-text-primary">
              คำอธิบายผลลัพธ์
            </h2>
            <ChevronIcon className="ml-auto h-5 w-5 text-text-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-3 px-5 pb-5">
            <div
              className={`rounded-xl px-4 py-3 ${
                mainScore >= 0.7
                  ? "bg-[#e8f5e9]"
                  : mainScore >= 0.4
                    ? "bg-[#fff8e1]"
                    : "bg-[#ffebee]"
              }`}
            >
              <p
                className={`font-sarabun text-sm ${
                  mainScore >= 0.7
                    ? "text-[#1b5e20]"
                    : mainScore >= 0.4
                      ? "text-[#6d5600]"
                      : "text-[#b71c1c]"
                }`}
              >
                <b>
                  {isRegression ? "R²" : "Accuracy"} ={" "}
                  {(mainScore * 100).toFixed(1)}%
                </b>{" "}
                — {getScoreExplanation(isRegression, mainScore)}
              </p>
            </div>

            {mainScore < 0.5 && (
              <div className="rounded-xl border border-[#e0c97f]/60 bg-[#fdf8eb] px-4 py-3">
                <div className="flex items-start gap-2">
                  <WarningIcon />
                  <div>
                    <p className="font-sarabun text-caption font-bold text-[#8d6e00]">
                      สิ่งที่ควรระวัง
                    </p>
                    <ul className="mt-1 list-disc pl-5 font-sarabun text-caption text-[#6d5600]">
                      <li>ข้อมูลอาจน้อยเกินไป</li>
                      <li>คอลัมน์ที่เลือกอาจไม่เกี่ยวข้องกับเป้าหมาย</li>
                      <li>ข้อมูลมีค่าซ้ำกันมาก หรือมีค่าว่างเยอะ</li>
                    </ul>
                    <p className="mt-1 font-sarabun text-caption font-semibold text-[#8d6e00]">
                      แนะนำ: เพิ่มข้อมูลหรือเลือกคอลัมน์ที่เกี่ยวข้องมากขึ้น
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* คอลัมน์ที่ใช้ */}
            <div className="rounded-xl border border-border-default/40 bg-[#f8f9fa] px-4 py-3">
              <p className="mb-2 font-sarabun text-caption font-semibold text-text-primary">คอลัมน์ที่ใช้</p>
              <div className="mb-2">
                <p className="font-sarabun text-caption text-text-muted">เป้าหมาย (ทำนายค่านี้)</p>
                <span className="mt-1 inline-block rounded-full bg-[#e3f2fd] px-3 py-1 font-sarabun text-caption font-semibold text-[#01579b]">
                  {model.target_column}
                </span>
              </div>
              <div>
                <p className="font-sarabun text-caption text-text-muted">คอลัมน์ข้อมูลที่ใช้ทำนาย</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {featureCols.map((col) => (
                    <span key={col} className="rounded-full bg-[#f0f2f5] px-3 py-1 font-sarabun text-caption font-medium text-text-primary">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </details>
      )}

      {/* 6: กราฟต่างๆ — เปิดปิดได้ */}
      {featureImportance.length > 0 && (
        <details id="section-feature-importance" className="group rounded-2xl border border-border-default/60 bg-surface-card shadow-level-1">
          <summary className="flex cursor-pointer items-center gap-2 p-5 [&::-webkit-details-marker]:hidden">
            <ChartBarIcon />
            <h2 className="font-kanit text-base font-bold text-text-primary">
              คอลัมน์ที่มีผลต่อการทำนาย
            </h2>
            <ChevronIcon className="ml-auto h-5 w-5 text-text-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-4 px-5 pb-5">
            <div className="rounded-xl bg-[#f0f7ff] px-4 py-3 space-y-2">
              <p className="font-sarabun text-sm font-semibold text-[#01579b]">
                กราฟนี้แสดงอะไร?
              </p>
              <ul className="list-disc pl-5 font-sarabun text-caption text-[#01579b]/80 space-y-1">
                <li>
                  <b>แต่ละแท่ง</b> = คอลัมน์ข้อมูล 1 คอลัมน์ที่ใช้ทำนาย <b>{model.target_column}</b>
                </li>
                <li>
                  <b>ความยาวแท่ง (เปอร์เซ็นต์)</b> = คอลัมน์นั้นมีผลต่อการทำนายมากแค่ไหน ยิ่งยาว = ยิ่งสำคัญ
                </li>
                <li>
                  คอลัมน์ที่มีค่าสูงสุด = ปัจจัยหลักที่โมเดลใช้ตัดสินใจ
                </li>
              </ul>
              <p className="font-sarabun text-sm font-semibold text-[#01579b]">
                ใช้ข้อมูลนี้ยังไง?
              </p>
              <ul className="list-disc pl-5 font-sarabun text-caption text-[#01579b]/80 space-y-1">
                <li>
                  ดูว่าปัจจัยไหนมีผลต่อ {model.target_column} มากที่สุด เพื่อนำไปวางแผนหรือตัดสินใจ
                </li>
                <li>
                  ถ้าคอลัมน์ที่ควรสำคัญกลับมีค่าน้อย อาจแปลว่าข้อมูลในคอลัมน์นั้นยังไม่ดีพอ
                </li>
              </ul>
            </div>
            <FeatureImportanceChart data={featureImportance} />
          </div>
        </details>
      )}

      {actualVsPredicted && (
        <details id="section-scatter" className="group rounded-2xl border border-border-default/60 bg-surface-card shadow-level-1">
          <summary className="flex cursor-pointer items-center gap-2 p-5 [&::-webkit-details-marker]:hidden">
            <ChartDotsIcon />
            <h2 className="font-kanit text-base font-bold text-text-primary">
              ค่าจริง vs ค่าที่ทำนาย
            </h2>
            <ChevronIcon className="ml-auto h-5 w-5 text-text-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-4 px-5 pb-5">
            <div className="rounded-xl bg-[#f0f7ff] px-4 py-3 space-y-2">
              <p className="font-sarabun text-sm font-semibold text-[#01579b]">
                กราฟนี้แสดงอะไร?
              </p>
              <ul className="list-disc pl-5 font-sarabun text-caption text-[#01579b]/80 space-y-1">
                <li>
                  <b>จุดแต่ละจุด (สีฟ้า)</b> = ข้อมูล 1 ตัวอย่าง — แกนนอนคือ &quot;ค่าจริง&quot; ที่เกิดขึ้นจริงๆ, แกนตั้งคือ &quot;ค่าที่โมเดลทำนาย&quot;
                </li>
                <li>
                  <b>เส้นประสีแดง (เส้นทแยง)</b> = เส้นอ้างอิง ถ้าโมเดลทำนายแม่นยำ 100% จุดทุกจุดจะอยู่บนเส้นนี้พอดี
                </li>
                <li>
                  <b>จุดอยู่ชิดเส้น</b> = ทำนายแม่น, <b>จุดอยู่ไกลเส้น</b> = ทำนายคลาดเคลื่อน
                </li>
              </ul>
              <p className="font-sarabun text-sm font-semibold text-[#01579b]">
                อ่านผลยังไง?
              </p>
              <ul className="list-disc pl-5 font-sarabun text-caption text-[#01579b]/80 space-y-1">
                <li>
                  ถ้าจุดส่วนใหญ่กระจุกตัวรอบเส้นทแยง = โมเดลทำนาย <b>{model.target_column}</b> ได้แม่นยำ
                </li>
                <li>
                  ถ้าจุดกระจายออกจากเส้นมาก = โมเดลยังทำนายผิดพลาดอยู่ ควรเพิ่มข้อมูลหรือปรับคอลัมน์
                </li>
                <li>
                  จุดที่อยู่ <b>เหนือเส้น</b> = โมเดลทำนายสูงกว่าความเป็นจริง, <b>ใต้เส้น</b> = ทำนายต่ำกว่าจริง
                </li>
              </ul>
            </div>
            <ScatterSummary actual={actualVsPredicted.actual} predicted={actualVsPredicted.predicted} targetColumn={model.target_column} />
            <ScatterChart
              actual={actualVsPredicted.actual}
              predicted={actualVsPredicted.predicted}
            />
          </div>
        </details>
      )}

      {confusionMatrix && (
        <details id="section-confusion" className="group rounded-2xl border border-border-default/60 bg-surface-card shadow-level-1">
          <summary className="flex cursor-pointer items-center gap-2 p-5 [&::-webkit-details-marker]:hidden">
            <ChartBarIcon />
            <h2 className="font-kanit text-base font-bold text-text-primary">
              ตารางผลการจำแนก (Confusion Matrix)
            </h2>
            <ChevronIcon className="ml-auto h-5 w-5 text-text-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-4 px-5 pb-5">
            <div className="rounded-xl bg-[#f0f7ff] px-4 py-3 space-y-2">
              <p className="font-sarabun text-sm font-semibold text-[#01579b]">
                ตารางนี้แสดงอะไร?
              </p>
              <ul className="list-disc pl-5 font-sarabun text-caption text-[#01579b]/80 space-y-1">
                <li>
                  <b>แนวตั้ง (แถว)</b> = ค่าจริงที่เกิดขึ้นจริงๆ, <b>แนวนอน (คอลัมน์)</b> = ค่าที่โมเดลทำนายออกมา
                </li>
                <li>
                  <b>ช่องสีเขียว (แนวทแยง)</b> = ทำนายถูกต้อง — ตัวเลขยิ่งมากยิ่งดี
                </li>
                <li>
                  <b>ช่องสีแดง</b> = ทำนายผิด — เช่น ค่าจริงเป็น 0 แต่โมเดลทำนายเป็น 1
                </li>
              </ul>
              <p className="font-sarabun text-sm font-semibold text-[#01579b]">
                อ่านผลยังไง?
              </p>
              <ul className="list-disc pl-5 font-sarabun text-caption text-[#01579b]/80 space-y-1">
                <li>
                  ถ้าตัวเลขในช่องสีเขียวมีค่าสูง (เปอร์เซ็นต์มาก) = โมเดลจำแนก <b>{model.target_column}</b> ได้แม่นยำ
                </li>
                <li>
                  ถ้าช่องสีแดงมีตัวเลขสูง = โมเดลยังสับสนระหว่างประเภทนั้น ควรเพิ่มข้อมูลหรือปรับคอลัมน์
                </li>
                <li>
                  เปอร์เซ็นต์ในวงเล็บ = สัดส่วนของข้อมูลที่ตกอยู่ในช่องนั้นจากทั้งหมด
                </li>
              </ul>
            </div>
            <ConfusionMatrixTable matrix={confusionMatrix} />
          </div>
        </details>
      )}

      {/* F: API */}
      <div id="section-api" className="rounded-2xl border border-border-default/60 bg-surface-card p-5 shadow-level-1">
        <div className="mb-4 flex items-center gap-2">
          <CodeIcon />
          <h2 className="font-kanit text-base font-bold text-text-primary">
            API สำหรับนักพัฒนา
          </h2>
        </div>
        <div className="mb-3 flex gap-2">
          {(["curl", "python"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setApiTab(tab)}
              className={`rounded-lg px-3 py-1.5 font-sarabun text-caption font-medium transition-colors ${
                apiTab === tab
                  ? "bg-[#e3f2fd] text-[#01579b]"
                  : "text-text-muted hover:bg-[#f0f2f5]"
              }`}
            >
              {tab === "curl" ? "curl" : "Python"}
            </button>
          ))}
        </div>
        <div className="relative">
          <pre className="overflow-x-auto rounded-xl bg-[#1e1e1e] px-4 py-3 font-mono text-xs leading-relaxed text-[#d4d4d4]">
            {apiTab === "curl" ? curlCode : pythonCode}
          </pre>
          <button
            type="button"
            onClick={() =>
              copyToClipboard(
                apiTab === "curl" ? curlCode : pythonCode,
                "api",
              )
            }
            className="absolute right-2 top-2 rounded bg-white/10 px-2 py-1 font-sarabun text-[11px] text-[#d4d4d4] transition-colors hover:bg-white/20"
          >
            {copiedKey === "api" ? "✓ คัดลอกแล้ว" : "Copy"}
          </button>
        </div>
      </div>

      {/* G: Download */}
      <div className="rounded-2xl border border-border-default/60 bg-surface-card p-5 shadow-level-1">
        <div className="mb-4 flex items-center gap-2">
          <DownloadIcon />
          <h2 className="font-kanit text-base font-bold text-text-primary">
            ดาวน์โหลดโมเดล
          </h2>
        </div>
        <div className="mb-4 flex items-center gap-4 rounded-xl bg-[#f8f9fa] px-4 py-4">
          <FileIcon />
          <div className="min-w-0 flex-1">
            <p className="font-sarabun text-sm font-semibold text-text-primary">
              {model.name.replace(/ /g, "_")}.pkl
            </p>
            <p className="font-sarabun text-caption text-text-muted">
              Python 3.9+ &middot; scikit-learn
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadModel}
            className="flex items-center gap-1.5 rounded-lg bg-[#01579b] px-4 py-2 font-sarabun text-caption font-semibold text-white transition-colors hover:bg-[#0277bd]"
          >
            <DownloadIcon /> ดาวน์โหลด
          </button>
        </div>
        <div className="relative">
          <pre className="overflow-x-auto rounded-xl bg-[#1e1e1e] px-4 py-3 font-mono text-xs leading-relaxed text-[#d4d4d4]">
            {`import pickle
import pandas as pd

with open("${model.name.replace(/ /g, "_")}.pkl", "rb") as f:
    model = pickle.load(f)

result = model["model"].predict(pd.DataFrame([{
${featureCols.map((c) => `    "${c}": ...`).join(",\n")}
}]))
print(result)`}
          </pre>
          <button
            type="button"
            onClick={() =>
              copyToClipboard(
                `import pickle\nimport pandas as pd\n\nwith open("${model.name.replace(/ /g, "_")}.pkl", "rb") as f:\n    model = pickle.load(f)\n\nresult = model["model"].predict(pd.DataFrame([{\n${featureCols.map((c) => `    "${c}": ...`).join(",\n")}\n}]))\nprint(result)`,
                "download-code",
              )
            }
            className="absolute right-2 top-2 rounded bg-white/10 px-2 py-1 font-sarabun text-[11px] text-[#d4d4d4] transition-colors hover:bg-white/20"
          >
            {copiedKey === "download-code" ? "✓ คัดลอกแล้ว" : "Copy"}
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-6 font-sarabun text-caption text-text-muted">
        <span>
          สร้าง: {new Date(model.created_at).toLocaleDateString("th-TH")}
        </span>
        <span>
          อัปเดต: {new Date(model.updated_at).toLocaleDateString("th-TH")}
        </span>
      </div>

      </div>{/* END left column */}

      {/* ===== RIGHT: Sidebar ===== */}
      <aside className="hidden w-[260px] shrink-0 lg:block">
        <div className="sticky top-4 space-y-4">
          {/* ข้อมูลโมเดล */}
          <div className="rounded-2xl border border-border-default/60 bg-surface-card p-4 shadow-level-1">
            <h3 className="mb-3 font-kanit text-sm font-bold text-text-primary">
              ข้อมูลโมเดล
            </h3>
            <div className="space-y-2.5">
              <SidebarItem label="ประเภท" value={isRegression ? "พยากรณ์ค่า" : "จำแนกประเภท"} />
              <SidebarItem label="อัลกอริทึม" value={(metrics.algorithm as string) ?? "-"} />
              <SidebarItem
                label={isRegression ? "R² Score" : "Accuracy"}
                value={mainScore != null ? `${(mainScore * 100).toFixed(1)}%` : "-"}
                valueColor={getScoreColor(mainScore)}
              />
              <SidebarItem label="ใช้ทำนาย" value={`${model.predict_count} ครั้ง`} />
              <SidebarItem label="เป้าหมาย" value={model.target_column} />
            </div>
          </div>

          {/* ดาวน์โหลด */}
          <button
            type="button"
            onClick={handleDownloadModel}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#01579b] px-4 py-2.5 font-sarabun text-sm font-semibold text-white transition-colors hover:bg-[#0277bd]"
          >
            <DownloadIcon /> ดาวน์โหลดโมเดล
          </button>

          {/* สารบัญ */}
          <div className="rounded-2xl border border-border-default/60 bg-surface-card p-4 shadow-level-1">
            <h3 className="mb-3 font-kanit text-sm font-bold text-text-primary">
              สารบัญ
            </h3>
            <nav className="space-y-1.5">
              <SidebarLink href="#section-predict" label="ลองทำนาย" />
              {mainScore != null && (
                <SidebarLink href="#section-explanation" label="คำอธิบายผลลัพธ์" />
              )}
              {featureImportance.length > 0 && (
                <SidebarLink href="#section-feature-importance" label="คอลัมน์ที่มีผลต่อการทำนาย" />
              )}
              {actualVsPredicted && (
                <SidebarLink href="#section-scatter" label="ค่าจริง vs ค่าทำนาย" />
              )}
              {confusionMatrix && (
                <SidebarLink href="#section-confusion" label="ตารางผลการจำแนก" />
              )}
              <SidebarLink href="#section-api" label="API สำหรับนักพัฒนา" />
            </nav>
          </div>

          {/* วันที่ */}
          <div className="space-y-1 font-sarabun text-caption text-text-muted">
            <p>สร้าง: {new Date(model.created_at).toLocaleDateString("th-TH")}</p>
            <p>อัปเดต: {new Date(model.updated_at).toLocaleDateString("th-TH")}</p>
          </div>
        </div>
      </aside>

      </div>{/* END 2-column layout */}
    </div>
  );
}

/* ─── Helper functions ─── */

function getScoreColor(score: number | undefined): string {
  if (score == null) return "";
  if (score >= 0.7) return "text-[#2e7d32]";
  if (score >= 0.4) return "text-[#f9a825]";
  return "text-[#e53935]";
}

function getScoreExplanation(isRegression: boolean, score: number): string {
  const pct = score * 100;
  if (isRegression) {
    if (score < 0)
      return `โมเดลทำนายได้แย่กว่าการเดาค่าเฉลี่ย (R² = ${pct.toFixed(1)}%) — คอลัมน์ที่เลือกอาจไม่เกี่ยวข้อง`;
    if (score < 0.3)
      return `อธิบายข้อมูลได้แค่ ${pct.toFixed(0)}% — ลองเพิ่มข้อมูลหรือเลือกคอลัมน์ใหม่`;
    if (score < 0.5)
      return `อธิบายข้อมูลได้ ${pct.toFixed(0)}% — พอใช้ได้แต่ยังมีช่องว่างให้ปรับปรุง`;
    if (score < 0.7)
      return `อธิบายข้อมูลได้ ${pct.toFixed(0)}% — ใช้งานได้ดีพอสมควร`;
    if (score < 0.9)
      return `อธิบายข้อมูลได้ ${pct.toFixed(0)}% — ดีมาก ค่าที่ทำนายใกล้เคียงค่าจริง`;
    return `อธิบายข้อมูลได้ ${pct.toFixed(0)}% — ยอดเยี่ยม`;
  }
  if (score < 0.4)
    return `ทำนายถูก ${pct.toFixed(0)}% — ยังต้องปรับปรุง ลองเลือกคอลัมน์ใหม่`;
  if (score < 0.6)
    return `ทำนายถูก ${pct.toFixed(0)}% — พอใช้ได้แต่ยังไม่น่าเชื่อถือมาก`;
  if (score < 0.8)
    return `ทำนายถูก ${pct.toFixed(0)}% — ใช้งานได้ดีพอสมควร`;
  if (score < 0.95)
    return `ทำนายถูก ${pct.toFixed(0)}% — ดีมาก โมเดลน่าเชื่อถือ`;
  return `ทำนายถูก ${pct.toFixed(0)}% — ยอดเยี่ยม`;
}

/* ─── Chart components ─── */

function FeatureImportanceChart({ data }: { data: FeatureImportance[] }) {
  const w = 500;
  const barH = 28;
  const gap = 6;
  const labelW = 120;
  const h = data.length * (barH + gap) + 10;
  const maxImp = Math.max(...data.map((d) => d.importance), 0.01);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-xl">
      {data.map((fi, i) => {
        const y = i * (barH + gap) + 5;
        const barW = ((fi.importance / maxImp) * (w - labelW - 60)) || 2;
        const pct = (fi.importance * 100).toFixed(1);
        return (
          <g key={fi.column}>
            <text
              x={labelW - 8}
              y={y + barH / 2 + 4}
              textAnchor="end"
              className="font-sarabun text-xs"
              fill="#555"
            >
              {fi.column.length > 14
                ? fi.column.slice(0, 14) + "…"
                : fi.column}
            </text>
            <rect
              x={labelW}
              y={y}
              width={barW}
              height={barH}
              rx={4}
              fill="#0288d1"
              opacity={0.85}
            />
            <text
              x={labelW + barW + 6}
              y={y + barH / 2 + 4}
              className="font-sarabun text-xs font-semibold"
              fill="#01579b"
            >
              {pct}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ScatterSummary({
  actual,
  predicted,
  targetColumn,
}: {
  actual: number[];
  predicted: number[];
  targetColumn: string;
}) {
  const n = actual.length;
  if (n === 0) return null;

  const errors = actual.map((a, i) => predicted[i] - a);
  const absErrors = errors.map((e) => Math.abs(e));
  const avgError = absErrors.reduce((s, v) => s + v, 0) / n;
  const overCount = errors.filter((e) => e > 0).length;
  const underCount = errors.filter((e) => e < 0).length;
  const exactCount = errors.filter((e) => e === 0).length;

  const actualMin = Math.min(...actual);
  const actualMax = Math.max(...actual);
  const range = actualMax - actualMin || 1;
  const avgErrorPct = (avgError / range) * 100;

  let quality: string;
  let qualityColor: string;
  if (avgErrorPct < 10) {
    quality = "ดีมาก — ค่าที่ทำนายใกล้เคียงค่าจริง";
    qualityColor = "text-[#1b5e20]";
  } else if (avgErrorPct < 25) {
    quality = "พอใช้ได้ — ทำนายคลาดเคลื่อนบ้าง";
    qualityColor = "text-[#6d5600]";
  } else {
    quality = "ยังไม่ดี — ค่าที่ทำนายห่างจากค่าจริงมาก";
    qualityColor = "text-[#b71c1c]";
  }

  return (
    <div className="rounded-xl border border-border-default/40 bg-[#f8f9fa] px-4 py-3 space-y-1.5">
      <p className="font-sarabun text-sm font-semibold text-text-primary">
        สรุปผลจากกราฟ
      </p>
      <ul className="list-disc pl-5 font-sarabun text-caption text-text-secondary space-y-1">
        <li>
          มีข้อมูลทั้งหมด <b>{n} จุด</b> — ค่า {targetColumn} จริงอยู่ระหว่าง{" "}
          <b>{actualMin.toLocaleString()}</b> ถึง <b>{actualMax.toLocaleString()}</b>
        </li>
        <li>
          โมเดลทำนาย <b>สูงกว่าจริง {overCount} จุด</b>, <b>ต่ำกว่าจริง {underCount} จุด</b>
          {exactCount > 0 && <>, <b>ตรงพอดี {exactCount} จุด</b></>}
        </li>
        <li>
          ค่าคลาดเคลื่อนเฉลี่ย <b>{avgError.toLocaleString(undefined, { maximumFractionDigits: 1 })}</b>{" "}
          (ประมาณ {avgErrorPct.toFixed(0)}% ของช่วงข้อมูล)
        </li>
        <li className={qualityColor}>
          <b>สรุป: {quality}</b>
        </li>
      </ul>
    </div>
  );
}

function ScatterChart({
  actual,
  predicted,
}: {
  actual: number[];
  predicted: number[];
}) {
  const allVals = [...actual, ...predicted];
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const range = max - min || 1;
  const w = 460;
  const h = 320;
  const pad = 45;

  const toX = (v: number) => pad + ((v - min) / range) * (w - 2 * pad);
  const toY = (v: number) => h - pad - ((v - min) / range) * (h - 2 * pad);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-2xl rounded-xl bg-[#f8f9fa]">
      <line
        x1={pad}
        y1={h - pad}
        x2={w - pad}
        y2={pad}
        stroke="#e53935"
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.5}
      />
      <text
        x={w / 2}
        y={h - 8}
        textAnchor="middle"
        fill="#999"
        style={{ fontSize: 11 }}
      >
        ค่าจริง
      </text>
      <text
        x={12}
        y={h / 2}
        textAnchor="middle"
        transform={`rotate(-90,12,${h / 2})`}
        fill="#999"
        style={{ fontSize: 11 }}
      >
        ค่าทำนาย
      </text>
      {actual.map((a, i) => (
        <circle
          key={i}
          cx={toX(a)}
          cy={toY(predicted[i])}
          r={3.5}
          fill="#0288d1"
          opacity={0.55}
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
              <th
                key={j}
                className="px-3 py-2 font-sarabun text-caption font-semibold text-text-muted"
              >
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
                      isCorrect
                        ? "bg-[#e8f5e9] text-[#2e7d32]"
                        : "bg-[#ffebee] text-[#c62828]"
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

/* ─── Info Card ─── */

function InfoCard({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-xl border border-border-default/60 bg-surface-card px-4 py-3 shadow-level-1">
      <p className="font-sarabun text-[11px] font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p
        className={`font-kanit text-lg font-bold ${valueColor || "text-text-primary"}`}
      >
        {value}
      </p>
    </div>
  );
}

/* ─── Icons ─── */

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}

function InfoCircleIcon() {
  return (
    <svg className="h-5 w-5 text-[#01579b]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#8d6e00]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  );
}

function ChartBarIcon() {
  return (
    <svg className="h-5 w-5 text-[#01579b]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z" />
    </svg>
  );
}

function ChartDotsIcon() {
  return (
    <svg className="h-5 w-5 text-[#01579b]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 18a2 2 0 110-4 2 2 0 010 4zm5-5a2 2 0 110-4 2 2 0 010 4zm5-5a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="h-5 w-5 text-[#01579b]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg className="h-5 w-5 text-[#01579b]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="h-7 w-7 text-[#01579b]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg className="h-5 w-5 text-[#01579b]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 3a9 9 0 00-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
    </svg>
  );
}

/* ─── Sidebar components ─── */

function SidebarItem({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div>
      <p className="font-sarabun text-[11px] text-text-muted">{label}</p>
      <p className={`font-kanit text-sm font-bold ${valueColor || "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block rounded-lg px-2.5 py-1.5 font-sarabun text-caption text-[#01579b] transition-colors hover:bg-[#e3f2fd]"
    >
      {label}
    </a>
  );
}
