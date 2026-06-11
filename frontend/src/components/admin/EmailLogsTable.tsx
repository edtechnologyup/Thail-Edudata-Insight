"use client";

import type { AdminEmailLog, EmailLogStatus } from "@/hooks/useAdminEmailLogs";

type EmailLogsTableProps = {
  logs: AdminEmailLog[];
  isLoading: boolean;
};

const STATUS_STYLES: Record<EmailLogStatus, string> = {
  delivered: "bg-status-published-bg text-status-published",
  failed: "bg-status-error-bg text-status-error",
  bounced: "bg-status-warning-bg text-status-warning",
  sent: "bg-status-draft-bg text-status-draft",
  pending: "bg-surface-container text-text-muted",
  complained: "bg-red-950 text-white",
};

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: EmailLogStatus }) {
  return (
    <span
      className={`inline-flex rounded-radius-full px-3 py-1 font-sarabun text-caption font-semibold ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export default function EmailLogsTable({
  logs,
  isLoading,
}: EmailLogsTableProps) {
  return (
    <div className="overflow-hidden rounded-radius-xl border border-border-default bg-surface-card shadow-level-1">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full border-collapse text-left">
          <thead className="bg-surface-container font-sarabun text-label text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-semibold">template_name</th>
              <th className="px-4 py-3 font-semibold">recipient_email</th>
              <th className="px-4 py-3 font-semibold">subject</th>
              <th className="px-4 py-3 font-semibold">status</th>
              <th className="px-4 py-3 font-semibold">retry_count</th>
              <th className="px-4 py-3 font-semibold">sent_at</th>
              <th className="px-4 py-3 font-semibold">created_at</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/50 font-sarabun text-body-sm text-text-primary">
            {isLoading ? (
              <tr>
                <td className="px-4 py-8 text-center text-text-muted" colSpan={7}>
                  กำลังโหลด Email Logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-text-muted" colSpan={7}>
                  ไม่พบ Email Logs
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="transition-colors hover:bg-surface-page"
                >
                  <td className="px-4 py-3 font-mono text-code">
                    {log.template_name}
                  </td>
                  <td className="px-4 py-3">{log.recipient_email}</td>
                  <td className="max-w-[280px] truncate px-4 py-3">
                    {log.subject}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-4 py-3">{log.retry_count}</td>
                  <td className="px-4 py-3">{formatDateTime(log.sent_at)}</td>
                  <td className="px-4 py-3">{formatDateTime(log.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
