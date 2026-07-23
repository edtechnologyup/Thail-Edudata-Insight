"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useState } from "react";
import AgencyMLModelTable from "@/components/ml-model/AgencyMLModelTable";
import DeleteMLModelModal from "@/components/ml-model/DeleteMLModelModal";
import type { MLModelStatus } from "@/hooks/useMLModels";
import { useMyMLModels } from "@/hooks/useMLModels";

type StatusTab = "all" | MLModelStatus;

export default function AgencyModelsPage() {
  const locale = useLocale();
  const base = `/${locale}`;

  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const { data: allData } = useMyMLModels(1);
  const allModels = allData?.data ?? [];
  const totalCount = allData?.total ?? 0;
  const readyCount = allModels.filter((m) => m.status === "ready").length;
  const trainingCount = allModels.filter((m) => m.status === "training").length;
  const failedCount = allModels.filter((m) => m.status === "failed").length;

  const tabs: { id: StatusTab; label: string; count: number }[] = [
    { id: "all", label: "ทั้งหมด", count: totalCount },
    { id: "ready", label: "พร้อมใช้", count: readyCount },
    { id: "training", label: "กำลังเทรน", count: trainingCount },
    { id: "failed", label: "ล้มเหลว", count: failedCount },
  ];

  const handleTabChange = (tab: StatusTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <header
        className="relative overflow-hidden rounded-2xl p-6 lg:p-7"
        style={{
          background:
            "linear-gradient(135deg, #4a148c 0%, #6a1b9a 60%, #7b1fa2 100%)",
        }}
      >
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-kanit text-xl font-bold text-white">
              ML Models
            </h1>
            <p className="mt-1 font-sarabun text-sm text-white/70">
              จัดการโมเดล Machine Learning ของคุณ
            </p>
          </div>
          <Link
            href={`${base}/models/create`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 font-sarabun text-label font-medium text-[#4a148c] shadow-sm transition-all hover:bg-white/90 active:scale-[0.97]"
          >
            <PlusIcon />
            สร้างโมเดลใหม่
          </Link>
        </div>
        <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-white/[0.06]" />
        <div className="absolute right-16 -bottom-8 h-20 w-20 rounded-full bg-white/[0.04]" />
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={<ReadyIcon />}
          iconBg="bg-[#e8f5e9]"
          iconColor="text-[#43a047]"
          label="พร้อมใช้งาน"
          value={`${readyCount} โมเดล`}
        />
        <SummaryCard
          icon={<TrainIcon />}
          iconBg="bg-[#fff8e1]"
          iconColor="text-[#f9a825]"
          label="กำลังเทรน"
          value={`${trainingCount} โมเดล`}
        />
        <SummaryCard
          icon={<TotalIcon />}
          iconBg="bg-[#e8eaf6]"
          iconColor="text-[#3949ab]"
          label="ทั้งหมด"
          value={`${totalCount} โมเดล`}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border-default/40">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`border-b-2 px-4 pb-2.5 font-sarabun text-label font-semibold transition-all ${
                isActive
                  ? "border-b-[#4a148c] text-[#4a148c]"
                  : "border-b-transparent text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {toastError && (
        <div
          className="rounded-xl border border-status-error bg-status-error-bg px-4 py-3 font-sarabun text-label text-status-error"
          role="alert"
        >
          {toastError}
        </div>
      )}

      <AgencyMLModelTable
        page={page}
        onPageChange={setPage}
        statusFilter={activeTab === "all" ? undefined : activeTab}
        onDelete={(model) => {
          setDeleteTarget(model);
          setToastError(null);
        }}
      />

      <DeleteMLModelModal
        open={Boolean(deleteTarget)}
        model={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onError={(msg) => setToastError(msg)}
      />
    </div>
  );
}

function SummaryCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white px-6 py-6 shadow-[0_4px_12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>
      <div>
        <p className="font-sarabun text-[11px] font-medium uppercase tracking-wide text-text-muted">
          {label}
        </p>
        <p className="font-kanit text-[22px] font-bold leading-tight text-text-primary">
          {value}
        </p>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function ReadyIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

function TrainIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18z" />
    </svg>
  );
}

function TotalIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.36.2-.8.2-1.14 0l-7.9-4.44A.994.994 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.36-.2.8-.2 1.14 0l7.9 4.44c.32.17.53.5.53.88v9z" />
    </svg>
  );
}
