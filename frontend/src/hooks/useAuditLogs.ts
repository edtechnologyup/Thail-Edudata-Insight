"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAdminAuditLogsForExport,
  getAdminAuditLogsMock,
  type AuditLog,
  type AuditLogsFilters,
  type AuditLogsResult,
} from "@/data/mockData";

async function fetchAuditLogs(
  filters?: AuditLogsFilters
): Promise<AuditLogsResult> {
  // TODO: GET /api/v1/admin/audit-logs
  await Promise.resolve();
  return getAdminAuditLogsMock(filters);
}

export function useAuditLogs(filters?: AuditLogsFilters) {
  return useQuery({
    queryKey: ["admin", "audit-logs", filters],
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 1000 * 60 * 2,
    placeholderData: () => getAdminAuditLogsMock(filters),
  });
}

export function exportAuditLogsCsv(
  filters?: Omit<AuditLogsFilters, "page">
): void {
  // TODO: GET /api/v1/admin/audit-logs/export
  const logs = getAdminAuditLogsForExport(filters);
  const header = "timestamp,email,action,detail,ip";
  const rows = logs.map((log: AuditLog) => {
    const detail = `"${log.detail.replace(/"/g, '""')}"`;
    return `${log.timestamp},${log.email},${log.action},${detail},${log.ip}`;
  });
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "audit-log.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
