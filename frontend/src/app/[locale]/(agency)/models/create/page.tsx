"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMyMLModels, useDatasetColumns, useCreateMLModel } from "@/hooks/useMLModels";
import { useAgencyDatasets } from "@/hooks/useAgencyDatasets";

type Step = 1 | 2 | 3;

export default function CreateModelPage() {
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [targetColumn, setTargetColumn] = useState<string | null>(null);
  const [featureColumns, setFeatureColumns] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dsPage, setDsPage] = useState(1);

  const { data: dsData, isLoading: dsLoading } = useAgencyDatasets("all", dsPage, 10);
  const datasets = dsData?.data ?? [];
  const dsTotalPages = dsData?.totalPages ?? 1;
  const dsTotal = dsData?.total ?? 0;
  const { data: columns, isLoading: colLoading } = useDatasetColumns(datasetId);
  const createMutation = useCreateMLModel();

  const selectedDataset = datasets.find((d) => d.id === datasetId);

  const toggleFeature = (col: string) => {
    setFeatureColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
    );
  };

  const handleSubmit = () => {
    if (!datasetId || !targetColumn || featureColumns.length === 0 || !name.trim()) return;
    setError(null);
    createMutation.mutate(
      {
        dataset_id: datasetId,
        name: name.trim(),
        description: description.trim() || undefined,
        target_column: targetColumn,
        feature_columns: featureColumns,
      },
      {
        onSuccess: () => {
          router.push(`/${locale}/models`);
        },
        onError: (err) => {
          setError(err.message || "สร้างโมเดลไม่สำเร็จ");
        },
      },
    );
  };

  const canNextStep2 = datasetId !== null;
  const canNextStep3 = targetColumn !== null && featureColumns.length > 0;

  const autoName =
    targetColumn && selectedDataset
      ? `พยากรณ์ ${targetColumn} — ${selectedDataset.title}`
      : "";

  const handleGoStep3 = () => {
    setName(autoName);
    setStep(3);
  };

  const [showGuide, setShowGuide] = useState(false);
  const canSubmit = autoName.length > 0 && !createMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header
        className="relative overflow-hidden rounded-2xl p-6 lg:p-7"
        style={{
          background:
            "linear-gradient(135deg, #4a148c 0%, #6a1b9a 60%, #7b1fa2 100%)",
        }}
      >
        <div className="relative z-10">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/models`)}
            className="mb-2 flex items-center gap-1 font-sarabun text-caption text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeftIcon /> กลับไปรายการโมเดล
          </button>
          <h1 className="font-kanit text-xl font-bold text-white">
            สร้างโมเดลใหม่
          </h1>
          <p className="mt-1 font-sarabun text-sm text-white/70">
            เลือก Dataset → กำหนดคอลัมน์ → ตั้งชื่อแล้วเทรน
          </p>
        </div>
      </header>

      {/* Guide toggle */}
      <div className="overflow-hidden rounded-2xl border border-border-default/60 bg-surface-card shadow-level-1">
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[#f7f9fc]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3e5f5] text-[#7b1fa2]">
              <BookIcon />
            </div>
            <span className="font-sarabun text-body-md font-bold text-text-primary">
              วิธีสร้างโมเดลทำนาย
            </span>
          </div>
          <span className={`text-text-muted transition-transform ${showGuide ? "rotate-180" : ""}`}>
            <ChevronDownIcon />
          </span>
        </button>

        {showGuide && (
          <div className="border-t border-border-default/40 px-6 pb-6 pt-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Step 1 guide */}
              <div className="rounded-xl bg-[#f3e5f5]/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4a148c] font-kanit text-[11px] font-bold text-white">1</span>
                  <span className="font-kanit text-label font-bold text-[#4a148c]">เลือก Dataset</span>
                </div>
                <p className="font-sarabun text-caption leading-relaxed text-text-secondary">
                  เลือกข้อมูลที่จะนำมาสร้างโมเดล เช่น &quot;สถิตินักเรียนรายจังหวัด&quot; ที่มีข้อมูลตัวเลขให้ทำนาย
                </p>
              </div>

              {/* Step 2 guide */}
              <div className="rounded-xl bg-[#f3e5f5]/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4a148c] font-kanit text-[11px] font-bold text-white">2</span>
                  <span className="font-kanit text-label font-bold text-[#4a148c]">กำหนดคอลัมน์</span>
                </div>
                <div className="space-y-1.5 font-sarabun text-caption leading-relaxed text-text-secondary">
                  <p>
                    <span className="inline-block h-2 w-2 rounded-full bg-[#e53935]" /> <span className="font-semibold">เป้าหมาย</span> = สิ่งที่อยากทำนาย เช่น &quot;จำนวนนักเรียน&quot;
                  </p>
                  <p>
                    <span className="inline-block h-2 w-2 rounded-full bg-[#1565c0]" /> <span className="font-semibold">ข้อมูลที่ใช้</span> = ข้อมูลที่ช่วยทำนาย เช่น &quot;จังหวัด&quot; + &quot;ปี&quot;
                  </p>
                  <p className="text-[#b71c1c]/70">
                    ไม่ควรเลือกคอลัมน์ที่ไม่เกี่ยว เช่น id หรือหมายเหตุ
                  </p>
                </div>
              </div>

              {/* Step 3 guide */}
              <div className="rounded-xl bg-[#f3e5f5]/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4a148c] font-kanit text-[11px] font-bold text-white">3</span>
                  <span className="font-kanit text-label font-bold text-[#4a148c]">สร้างโมเดล</span>
                </div>
                <p className="font-sarabun text-caption leading-relaxed text-text-secondary">
                  ระบบตั้งชื่อให้อัตโนมัติ กดสร้างแล้วรอ 1-5 วินาที ระบบจะเลือกวิธีทำนายที่ดีที่สุดให้เอง
                </p>
              </div>
            </div>

            {/* Warnings */}
            <div className="mt-4 rounded-xl border border-[#e0c97f]/60 bg-[#fdf8eb] p-4">
              <p className="mb-2 flex items-center gap-2 font-sarabun text-label font-bold text-[#8d6e00]">
                <WarningIcon />
                คำเตือน
              </p>
              <div className="space-y-1 font-sarabun text-caption text-text-secondary">
                <p>• Dataset ต้องมีข้อมูลอย่างน้อย <span className="font-semibold">10 แถว</span></p>
                <p>• สร้างได้ไม่เกิน <span className="font-semibold">2 โมเดล</span> ต่อ 1 Dataset</p>
                <p>• รองรับไฟล์ <span className="font-semibold">CSV, Excel, JSON, XML</span> เท่านั้น</p>
                <p>• คอลัมน์ที่มี <span className="font-semibold">ค่าว่างเยอะ</span> จะทำให้ผลไม่ดี</p>
                <p>• โมเดลที่ <span className="font-semibold">ลบแล้วกู้คืนไม่ได้</span></p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3">
        {[
          { n: 1 as Step, label: "เลือก Dataset" },
          { n: 2 as Step, label: "กำหนดคอลัมน์" },
          { n: 3 as Step, label: "ตั้งชื่อ & สร้าง" },
        ].map(({ n, label }) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full font-kanit text-label font-bold ${
                step === n
                  ? "bg-[#4a148c] text-white"
                  : step > n
                    ? "bg-[#e8f5e9] text-[#43a047]"
                    : "bg-[#f0f2f5] text-text-muted"
              }`}
            >
              {step > n ? <SmallCheckIcon /> : n}
            </div>
            <span
              className={`hidden font-sarabun text-label font-medium sm:inline ${
                step === n ? "text-[#4a148c]" : "text-text-muted"
              }`}
            >
              {label}
            </span>
            {n < 3 && (
              <div className="mx-1 h-px w-8 bg-border-default/40" />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-status-error bg-status-error-bg px-4 py-3 font-sarabun text-label text-status-error">
          {error}
        </div>
      )}

      {/* Step 1: Select Dataset */}
      {step === 1 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-kanit text-lg font-bold text-text-primary">
            เลือก Dataset ที่จะสร้างโมเดล
          </h2>
          {dsLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4a148c] border-t-transparent" />
            </div>
          ) : datasets.length === 0 ? (
            <p className="py-8 text-center font-sarabun text-body-md text-text-muted">
              ยังไม่มี Dataset — ต้องอัปโหลด Dataset ก่อนถึงจะสร้างโมเดลได้
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {datasets.map((ds) => (
                  <button
                    key={ds.id}
                    type="button"
                    onClick={() => {
                      setDatasetId(ds.id);
                      setTargetColumn(null);
                      setFeatureColumns([]);
                    }}
                    className={`flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all ${
                      datasetId === ds.id
                        ? "border-[#4a148c] bg-[#f3e5f5]"
                        : "border-transparent bg-[#f8f9fa] hover:border-[#e1bee7]"
                    }`}
                  >
                    <DatasetIcon selected={datasetId === ds.id} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sarabun text-body-md font-semibold text-text-primary">
                        {ds.title}
                      </p>
                      <p className="font-sarabun text-caption text-text-muted">
                        {ds.category} · {ds.fileFormat ?? "ไม่ทราบ"}
                      </p>
                    </div>
                    {datasetId === ds.id && (
                      <span className="text-[#4a148c]">
                        <SmallCheckIcon />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {dsTotalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-border-default/30 pt-4">
                  <p className="font-sarabun text-label text-text-muted">
                    แสดง {(dsPage - 1) * 10 + 1}-{Math.min(dsPage * 10, dsTotal)} จาก {dsTotal} รายการ
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDsPage((p) => p - 1)}
                      disabled={dsPage <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-container disabled:opacity-30"
                    >
                      <ChevronLeftIcon />
                    </button>
                    {Array.from({ length: dsTotalPages }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setDsPage(n)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg font-sarabun text-caption font-bold transition-colors ${
                          n === dsPage
                            ? "bg-[#4a148c] text-white"
                            : "text-text-primary hover:bg-surface-container"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setDsPage((p) => p + 1)}
                      disabled={dsPage >= dsTotalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-container disabled:opacity-30"
                    >
                      <ChevronRightIcon />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={!canNextStep2}
              onClick={() => setStep(2)}
              className="rounded-full bg-[#4a148c] px-6 py-2.5 font-sarabun text-label font-semibold text-white shadow-sm transition-all hover:bg-[#6a1b9a] disabled:opacity-40"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Columns */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Dataset info bar */}
          <div className="flex items-center gap-3 rounded-2xl border border-border-default/60 bg-surface-card px-6 py-4 shadow-level-1">
            <DatasetIcon selected={false} />
            <div>
              <p className="font-sarabun text-caption text-text-muted">Dataset ที่เลือก</p>
              <p className="font-sarabun text-body-md font-bold text-text-primary">{selectedDataset?.title}</p>
            </div>
          </div>

          {colLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4a148c] border-t-transparent" />
            </div>
          ) : !columns || columns.length === 0 ? (
            <div className="rounded-2xl border border-border-default/60 bg-surface-card px-6 py-16 text-center shadow-level-1">
              <p className="font-sarabun text-body-md text-text-muted">
                ไม่พบคอลัมน์ — ไฟล์อาจไม่รองรับการเทรน ML
              </p>
            </div>
          ) : (
            <>
              {/* Target column */}
              <div className="rounded-2xl border-2 border-[#e53935]/30 bg-surface-card p-6 shadow-level-1">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffebee]">
                    <TargetIcon />
                  </div>
                  <div>
                    <h3 className="font-kanit text-base font-bold text-[#c62828]">
                      คอลัมน์เป้าหมาย (Target)
                    </h3>
                    <p className="font-sarabun text-caption text-text-muted">
                      เลือก 1 คอลัมน์ที่ต้องการทำนาย
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {columns.map((col) => (
                    <button
                      key={col.column_name}
                      type="button"
                      onClick={() => {
                        setTargetColumn(col.column_name);
                        setFeatureColumns((prev) =>
                          prev.filter((c) => c !== col.column_name),
                        );
                      }}
                      className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                        targetColumn === col.column_name
                          ? "border-[#e53935] bg-[#ffebee]"
                          : "border-transparent bg-[#f8f9fa] hover:border-[#ffcdd2]"
                      }`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        targetColumn === col.column_name
                          ? "border-[#e53935] bg-[#e53935]"
                          : "border-[#ccc] bg-white"
                      }`}>
                        {targetColumn === col.column_name && (
                          <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="font-sarabun text-body-md font-semibold text-text-primary">
                          {col.column_name}
                        </p>
                        <p className="font-sarabun text-[11px] text-text-muted">
                          {col.dtype} · {col.unique_count} ค่า
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature columns */}
              <div className="rounded-2xl border-2 border-[#1565c0]/30 bg-surface-card p-6 shadow-level-1">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e3f2fd]">
                    <FeatureIcon />
                  </div>
                  <div>
                    <h3 className="font-kanit text-base font-bold text-[#1565c0]">
                      คอลัมน์ข้อมูล (Features)
                    </h3>
                    <p className="font-sarabun text-caption text-text-muted">
                      เลือกคอลัมน์ที่ใช้ในการทำนาย (เลือกได้หลายอัน)
                    </p>
                  </div>
                  {featureColumns.length > 0 && (
                    <span className="ml-auto rounded-full bg-[#1565c0] px-3 py-1 font-sarabun text-caption font-bold text-white">
                      เลือกแล้ว {featureColumns.length}
                    </span>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {columns
                    .filter((col) => col.column_name !== targetColumn)
                    .map((col) => {
                      const selected = featureColumns.includes(col.column_name);
                      return (
                        <button
                          key={col.column_name}
                          type="button"
                          onClick={() => toggleFeature(col.column_name)}
                          className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                            selected
                              ? "border-[#1565c0] bg-[#e3f2fd]"
                              : "border-transparent bg-[#f8f9fa] hover:border-[#bbdefb]"
                          }`}
                        >
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                            selected
                              ? "border-[#1565c0] bg-[#1565c0]"
                              : "border-[#ccc] bg-white"
                          }`}>
                            {selected && (
                              <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="font-sarabun text-body-md font-semibold text-text-primary">
                              {col.column_name}
                            </p>
                            <p className="font-sarabun text-[11px] text-text-muted">
                              {col.dtype} · {col.unique_count} ค่า
                            </p>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-full border border-border-default px-6 py-2.5 font-sarabun text-label font-medium text-text-secondary transition-all hover:bg-[#f0f2f5]"
            >
              ย้อนกลับ
            </button>
            <button
              type="button"
              disabled={!canNextStep3}
              onClick={handleGoStep3}
              className="rounded-full bg-[#4a148c] px-6 py-2.5 font-sarabun text-label font-semibold text-white shadow-sm transition-all hover:bg-[#6a1b9a] disabled:opacity-40"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Name & Create */}
      {step === 3 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-kanit text-lg font-bold text-text-primary">
            ตั้งชื่อแล้วสร้างโมเดล
          </h2>

          {/* Summary */}
          <div className="mb-6 rounded-xl bg-[#f3e5f5] px-5 py-4">
            <p className="font-sarabun text-caption text-text-muted">สรุป</p>
            <p className="font-sarabun text-body-md text-text-primary">
              <span className="font-semibold">ชื่อโมเดล:</span> {autoName}
            </p>
            <p className="font-sarabun text-body-md text-text-primary">
              <span className="font-semibold">Dataset:</span> {selectedDataset?.title}
            </p>
            <p className="font-sarabun text-body-md text-text-primary">
              <span className="font-semibold">เป้าหมาย:</span> {targetColumn}
            </p>
            <p className="font-sarabun text-body-md text-text-primary">
              <span className="font-semibold">ข้อมูลที่ใช้:</span>{" "}
              {featureColumns.join(", ")}
            </p>
          </div>

          <div>
            <label
              htmlFor="model-desc"
              className="mb-1 block font-sarabun text-label font-semibold text-text-primary"
            >
              คำอธิบาย (ไม่บังคับ)
            </label>
            <textarea
              id="model-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อธิบายสั้นๆ ว่าโมเดลนี้ทำอะไร"
              rows={3}
              className="w-full rounded-xl border border-border-default bg-white px-4 py-3 font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:border-[#4a148c] focus:outline-none focus:ring-2 focus:ring-[#4a148c]/20"
            />
          </div>

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-full border border-border-default px-6 py-2.5 font-sarabun text-label font-medium text-text-secondary transition-all hover:bg-[#f0f2f5]"
            >
              ย้อนกลับ
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-full bg-[#4a148c] px-6 py-2.5 font-sarabun text-label font-semibold text-white shadow-sm transition-all hover:bg-[#6a1b9a] disabled:opacity-40"
            >
              {createMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  กำลังเทรน...
                </>
              ) : (
                "สร้างโมเดล"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}

function SmallCheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

function DatasetIcon({ selected }: { selected: boolean }) {
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
        selected ? "bg-[#4a148c] text-white" : "bg-[#e8eaf6] text-[#3949ab]"
      }`}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 6H12L10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
      </svg>
    </div>
  );
}

function TargetIcon() {
  return (
    <svg className="h-4 w-4 text-[#e53935]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z" />
    </svg>
  );
}

function FeatureIcon() {
  return (
    <svg className="h-4 w-4 text-[#1565c0]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
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

function BookIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  );
}
