"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import EmailLogsTable from "@/components/admin/EmailLogsTable";
import Pagination from "@/components/search/Pagination";
import {
  type AdminEmailLogsFilters,
  useAdminEmailLogs,
} from "@/hooks/useAdminEmailLogs";

const TEMPLATE_OPTIONS = [
  "verify_email",
  "account_approved",
  "account_rejected",
  "account_suspended",
  "account_unsuspended",
  "password_reset",
  "password_changed",
  "account_lockout",
  "new_dataset_notification",
  "admin_new_registration",
] as const;

function getPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export default function AdminEmailLogsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? "";
  const recipientEmail = searchParams.get("recipient_email") ?? "";
  const templateName = searchParams.get("template_name") ?? "";
  const dateFrom = searchParams.get("date_from") ?? "";
  const dateTo = searchParams.get("date_to") ?? "";
  const page = getPositiveInt(searchParams.get("page"), 1);
  const pageSize = Math.min(getPositiveInt(searchParams.get("page_size"), 20), 100);

  const filters: AdminEmailLogsFilters = {
    status:
      status === "delivered" || status === "failed" || status === "bounced"
        ? status
        : undefined,
    recipient_email: recipientEmail || undefined,
    template_name: templateName || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page,
    page_size: pageSize,
  };

  const { data, isLoading, isError } = useAdminEmailLogs(filters);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-container-max space-y-8 pb-24">
      <header>
        <h1 className="font-kanit text-[28px] font-bold leading-tight text-text-primary">
          Email Logs
        </h1>
        <p className="mt-1 font-sarabun text-body-md text-text-muted">
          ตรวจสอบประวัติการส่งอีเมลของระบบ
        </p>
      </header>

      <section className="rounded-radius-xl border border-border-default bg-surface-card p-5 shadow-level-1">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="font-sarabun text-label text-text-secondary">
            Status
            <select
              value={status}
              onChange={(event) => updateFilter("status", event.target.value)}
              className="mt-2 h-10 w-full rounded-radius-sm border border-border-input bg-surface-card px-3 font-sarabun text-body-md text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            >
              <option value="">All</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="bounced">Bounced</option>
            </select>
          </label>

          <label className="font-sarabun text-label text-text-secondary">
            recipient_email
            <input
              type="search"
              value={recipientEmail}
              onChange={(event) =>
                updateFilter("recipient_email", event.target.value)
              }
              placeholder="name@example.com"
              className="mt-2 h-10 w-full rounded-radius-sm border border-border-input bg-surface-card px-3 font-sarabun text-body-md text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            />
          </label>

          <label className="font-sarabun text-label text-text-secondary">
            template_name
            <select
              value={templateName}
              onChange={(event) =>
                updateFilter("template_name", event.target.value)
              }
              className="mt-2 h-10 w-full rounded-radius-sm border border-border-input bg-surface-card px-3 font-sarabun text-body-md text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            >
              <option value="">All</option>
              {TEMPLATE_OPTIONS.map((template) => (
                <option key={template} value={template}>
                  {template}
                </option>
              ))}
            </select>
          </label>

          <label className="font-sarabun text-label text-text-secondary">
            date_from
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => updateFilter("date_from", event.target.value)}
              className="mt-2 h-10 w-full rounded-radius-sm border border-border-input bg-surface-card px-3 font-sarabun text-body-md text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            />
          </label>

          <label className="font-sarabun text-label text-text-secondary">
            date_to
            <input
              type="date"
              value={dateTo}
              onChange={(event) => updateFilter("date_to", event.target.value)}
              className="mt-2 h-10 w-full rounded-radius-sm border border-border-input bg-surface-card px-3 font-sarabun text-body-md text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            />
          </label>
        </div>
      </section>

      {isError && (
        <p className="rounded-radius-md border border-status-error bg-status-error-bg px-4 py-3 font-sarabun text-body-md text-status-error">
          โหลด Email Logs ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
        </p>
      )}

      <EmailLogsTable logs={data?.data ?? []} isLoading={isLoading} />

      <Pagination
        currentPage={data?.page ?? page}
        totalPages={data?.totalPages ?? 1}
      />
    </div>
  );
}
