"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import AnnouncementForm from "@/components/admin/AnnouncementForm";
import AnnouncementTable from "@/components/admin/AnnouncementTable";
import DeleteAnnouncementModal from "@/components/admin/DeleteAnnouncementModal";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import type { Announcement } from "@/types/content";
import { useAdminAnnouncements } from "@/hooks/useAdminAnnouncements";
import {
  useAdminSiteSettings,
  useUpdateSiteSetting,
  useUploadRibbonImage,
  useDeleteRibbonImage,
  useUploadSettingImage,
  useDeleteSettingImage,
} from "@/hooks/useAdminSiteSettings";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const HERO_IMAGE_CARDS = [
  { key: "home_hero_image", label: "หน้าหลัก", labelEn: "Homepage", desc: "/th — ส่วน hero สีฟ้า", gradient: "from-blue-400 to-sky-400" },
  { key: "home_guide_image", label: "คู่มือการใช้งาน", labelEn: "User guide", desc: "/th — กรอบคู่มือ (ภาพลางๆ)", gradient: "from-slate-400 to-slate-300" },
  { key: "scholarship_hero_image", label: "ทุนการศึกษา", labelEn: "Scholarships", desc: "/th/scholarship", gradient: "from-emerald-600 to-emerald-500" },
  { key: "apidocs_hero_image", label: "API Docs", labelEn: "API Docs", desc: "/th/api-docs", gradient: "from-emerald-600 to-teal-600" },
] as const;

export default function SiteSettingsPage() {
  const t = useTranslations("admin.announcements");
  const locale = useLocale();

  const { data: settings } = useAdminSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const uploadRibbon = useUploadRibbonImage();
  const deleteRibbon = useDeleteRibbonImage();
  const uploadImage = useUploadSettingImage();
  const deleteImage = useDeleteSettingImage();

  const ribbonFileRef = useRef<HTMLInputElement>(null);
  const [ribbonPreview, setRibbonPreview] = useState<string | null>(null);

  const ribbon = settings?.find((s) => s.key === "ribbon_image_url");
  const grayscale = settings?.find((s) => s.key === "grayscale");
  const popup = settings?.find((s) => s.key === "popup_image");

  const ribbonImageUrl = ribbon?.value
    ? `${API}/public/settings/ribbon-image/file`
    : null;

  const handleToggle = (key: string, currentEnabled: boolean) => {
    updateSetting.mutate({ key, enabled: !currentEnabled });
  };

  const handleRibbonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRibbonPreview(URL.createObjectURL(file));
    uploadRibbon.mutate(file, {
      onSettled: () => { if (ribbonFileRef.current) ribbonFileRef.current.value = ""; },
    });
  };

  // ── Announcements ──
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const { data, isLoading } = useAdminAnnouncements({ page });
  const allAnnouncements = data?.data ?? [];

  const showToast = (msg: string) => { setToastMessage(msg); setToastError(null); window.setTimeout(() => setToastMessage(null), 3000); };
  const showError = (msg: string) => { setToastError(msg); setToastMessage(null); window.setTimeout(() => setToastError(null), 3000); };

  const openCreateForm = () => { setFormMode("create"); setEditingAnnouncement(null); setFormOpen(true); };
  const openEditForm = (a: Announcement) => { setFormMode("edit"); setEditingAnnouncement(a); setFormOpen(true); };

  return (
    <div className="mx-auto max-w-container-max space-y-6 pb-24">
      {/* Header */}
      <header>
        <h1 className="font-kanit text-[28px] font-bold leading-tight text-text-primary">
          {locale === "th" ? "ตั้งค่าเว็บไซต์" : "Site settings"}
        </h1>
        <p className="mt-1 font-sarabun text-body-md text-text-muted">
          {locale === "th" ? "จัดการภาพ hero แต่ละหน้า ประกาศ และโหมดพิเศษ" : "Manage hero images, announcements, and special modes"}
        </p>
      </header>

      {/* Section 1: Hero images */}
      <section className="rounded-2xl border border-white/80 bg-white p-5 shadow-md">
        <h2 className="mb-4 flex items-center gap-2 font-kanit text-body-lg font-bold text-text-primary">
          <PhotoIcon />
          {locale === "th" ? "ภาพ hero แต่ละหน้า" : "Hero images"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HERO_IMAGE_CARDS.map((card) => (
            <HeroImageCard
              key={card.key}
              settingKey={card.key}
              label={locale === "th" ? card.label : card.labelEn}
              desc={card.desc}
              gradient={card.gradient}
              setting={settings?.find((s) => s.key === card.key)}
              onUpload={(file) => uploadImage.mutate({ key: card.key, file })}
              onDelete={() => deleteImage.mutate(card.key)}
              onToggle={(enabled) => handleToggle(card.key, enabled)}
              isUploading={uploadImage.isPending}
              isToggling={updateSetting.isPending}
            />
          ))}
        </div>
      </section>

      {/* Section 2: Special modes */}
      <section className="rounded-2xl border border-white/80 bg-white p-5 shadow-md">
        <h2 className="mb-4 flex items-center gap-2 font-kanit text-body-lg font-bold text-text-primary">
          <MoonIcon />
          {locale === "th" ? "โหมดพิเศษ" : "Special modes"}
        </h2>
        <div className="space-y-3">
          {/* Grayscale */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-5 py-4">
            <div>
              <p className="font-sarabun text-body-md font-semibold text-text-primary">
                {locale === "th" ? "โหมดขาว-ดำ (ไว้อาลัย)" : "Grayscale mode"}
              </p>
              <p className="font-sarabun text-label text-text-muted">
                {locale === "th" ? "แสดงเว็บทั้งหมดในโทนขาว-เทา-ดำ" : "Display entire site in grayscale"}
              </p>
            </div>
            <ToggleSwitch
              checked={grayscale?.enabled ?? false}
              onChange={() => handleToggle("grayscale", grayscale?.enabled ?? false)}
              disabled={updateSetting.isPending}
              label="Grayscale"
            />
          </div>

          {/* Ribbon */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-5 py-4">
            <div className="flex items-center gap-3">
              {(ribbonPreview || ribbonImageUrl) && (
                <img src={ribbonPreview || ribbonImageUrl!} alt="Ribbon" className="h-10 w-10 rounded-lg border border-gray-200 object-contain" />
              )}
              <div>
                <p className="font-sarabun text-body-md font-semibold text-text-primary">
                  {locale === "th" ? "ริบบิ้นมุมขวาบน" : "Corner ribbon"}
                </p>
                <p className="font-sarabun text-label text-text-muted">
                  {locale === "th" ? "อัปภาพริบบิ้นที่มุมขวาบนเว็บ" : "Upload ribbon image at top-right corner"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input ref={ribbonFileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleRibbonUpload} className="hidden" />
              <button type="button" onClick={() => ribbonFileRef.current?.click()} disabled={uploadRibbon.isPending} className="rounded-full p-2 text-blue-400 hover:bg-blue-50 hover:text-primary-dark">
                <UploadIcon />
              </button>
              {(ribbonPreview || ribbonImageUrl) && (
                <button type="button" onClick={() => { deleteRibbon.mutate(); setRibbonPreview(null); }} disabled={deleteRibbon.isPending} className="rounded-full p-2 text-red-400 hover:bg-red-50 hover:text-status-error">
                  <DeleteIcon />
                </button>
              )}
              <ToggleSwitch
                checked={ribbon?.enabled ?? false}
                onChange={() => handleToggle("ribbon_image_url", ribbon?.enabled ?? false)}
                disabled={updateSetting.isPending}
                label="Ribbon"
              />
            </div>
          </div>

          {/* Popup image */}
          <PopupImageRow
            setting={popup}
            onUpload={(file) => uploadImage.mutate({ key: "popup_image", file })}
            onDelete={() => deleteImage.mutate("popup_image")}
            onToggle={(enabled) => handleToggle("popup_image", enabled)}
            isUploading={uploadImage.isPending}
            isToggling={updateSetting.isPending}
            locale={locale}
          />
        </div>
      </section>

      {/* Section 3: Announcements */}
      <section className="rounded-2xl border border-white/80 bg-white p-5 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-kanit text-body-lg font-bold text-text-primary">
            <MegaphoneIcon />
            {locale === "th" ? "จัดการประกาศ banner" : "Announcements"}
          </h2>
          <button type="button" onClick={openCreateForm} className="inline-flex items-center gap-2 rounded-full bg-primary-dark px-5 py-2 font-sarabun text-label font-medium text-white shadow-md hover:bg-primary-hover hover:shadow-lg">
            <PlusIcon />
            {t("add")}
          </button>
        </div>

        <AnnouncementTable
          announcements={allAnnouncements}
          total={data?.total ?? 0}
          page={data?.page ?? 1}
          pageSize={data?.pageSize ?? 10}
          totalPages={data?.totalPages ?? 1}
          isLoading={isLoading}
          onPageChange={setPage}
          onEdit={openEditForm}
          onDelete={setDeleteTarget}
          onError={showError}
        />
      </section>

      <AnnouncementForm open={formOpen} mode={formMode} announcement={editingAnnouncement} onClose={() => setFormOpen(false)} onSuccess={() => showToast(formMode === "create" ? t("createSuccess") : t("updateSuccess"))} onError={showError} />
      <DeleteAnnouncementModal open={Boolean(deleteTarget)} announcement={deleteTarget} onClose={() => setDeleteTarget(null)} onSuccess={() => showToast(t("deleteSuccess"))} onError={showError} />

      {toastMessage && <div className="fixed bottom-6 right-6 z-[110] rounded-2xl bg-primary-dark px-4 py-3 font-sarabun text-label text-white shadow-lg">{toastMessage}</div>}
      {toastError && <div className="fixed bottom-6 right-6 z-[110] rounded-2xl bg-status-error px-4 py-3 font-sarabun text-label text-white shadow-lg">{toastError}</div>}
    </div>
  );
}

// ── Hero Image Card ──
function HeroImageCard({
  settingKey, label, desc, gradient, setting, onUpload, onDelete, onToggle, isUploading, isToggling,
}: {
  settingKey: string; label: string; desc: string; gradient: string;
  setting?: { key: string; value: string; enabled: boolean };
  onUpload: (file: File) => void; onDelete: () => void; onToggle: (enabled: boolean) => void;
  isUploading: boolean; isToggling: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const imageUrl = setting?.value
    ? `${API}/public/settings/${settingKey}/file`
    : null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onUpload(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const src = preview || imageUrl;

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
      <div className={`mb-3 flex h-20 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} overflow-hidden`}>
        {src ? (
          <img src={src} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="font-sarabun text-label text-white/80">{label}</span>
        )}
      </div>
      <p className="font-sarabun text-body-sm font-semibold text-text-primary">{label}</p>
      <p className="mb-3 font-sarabun text-caption text-text-muted">{desc}</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFile} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={isUploading} className="rounded-full p-1.5 text-blue-400 hover:bg-blue-50 hover:text-primary-dark">
            <UploadIcon />
          </button>
          {src && (
            <button type="button" onClick={() => { onDelete(); setPreview(null); }} className="rounded-full p-1.5 text-red-400 hover:bg-red-50 hover:text-status-error">
              <DeleteIcon />
            </button>
          )}
        </div>
        <ToggleSwitch
          checked={setting?.enabled ?? false}
          onChange={() => onToggle(setting?.enabled ?? false)}
          disabled={isToggling}
          label={label}
        />
      </div>
    </div>
  );
}

// ── Popup Image Row ──
function PopupImageRow({
  setting, onUpload, onDelete, onToggle, isUploading, isToggling, locale,
}: {
  setting?: { key: string; value: string; enabled: boolean };
  onUpload: (file: File) => void; onDelete: () => void; onToggle: (enabled: boolean) => void;
  isUploading: boolean; isToggling: boolean; locale: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const imageUrl = setting?.value
    ? `${API}/public/settings/popup_image/file`
    : null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onUpload(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const src = preview || imageUrl;

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-5 py-4">
      <div className="flex items-center gap-3">
        {src && <img src={src} alt="Popup" className="h-10 w-10 rounded-lg border border-gray-200 object-contain" />}
        <div>
          <p className="font-sarabun text-body-md font-semibold text-text-primary">
            {locale === "th" ? "Popup ภาพ (เทศกาล/ไว้อาลัย)" : "Popup image (memorial)"}
          </p>
          <p className="font-sarabun text-label text-text-muted">
            {locale === "th" ? "แสดง popup กลางจอ มีปุ่ม X ปิด" : "Show popup in center with close button"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFile} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={isUploading} className="rounded-full p-2 text-blue-400 hover:bg-blue-50 hover:text-primary-dark">
          <UploadIcon />
        </button>
        {src && (
          <button type="button" onClick={() => { onDelete(); setPreview(null); }} className="rounded-full p-2 text-red-400 hover:bg-red-50 hover:text-status-error">
            <DeleteIcon />
          </button>
        )}
        <ToggleSwitch
          checked={setting?.enabled ?? false}
          onChange={() => onToggle(setting?.enabled ?? false)}
          disabled={isToggling}
          label="Popup"
        />
      </div>
    </div>
  );
}

// ── Icons ──
function PhotoIcon() {
  return (
    <svg className="h-5 w-5 text-primary-dark" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="h-5 w-5 text-text-secondary" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9.37 5.51A7.35 7.35 0 0 0 9.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27A7.014 7.014 0 0 1 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg className="h-5 w-5 text-primary-dark" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1l5 3V6L5 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}
