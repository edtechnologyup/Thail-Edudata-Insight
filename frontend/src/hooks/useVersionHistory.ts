"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type {
  DatasetVersionChangelogType,
  DatasetVersionItem,
} from "@/data/mockData";

type ApiDatasetVersion = {
  version_number: number;
  created_at: string;
  created_by: string;
  changelog: string | null;
};

type VersionsListResponse = {
  success: boolean;
  data: ApiDatasetVersion[];
};

function inferChangelogType(changelog: string): DatasetVersionChangelogType {
  const lower = changelog.toLowerCase();
  if (lower.includes("initial")) {
    return "initial";
  }
  if (lower.includes("restored")) {
    return "edit";
  }
  return "edit";
}

function mapToVersionItem(
  v: ApiDatasetVersion,
  maxVersion: number
): DatasetVersionItem {
  const changelogLines = v.changelog ? [v.changelog] : ["Initial upload"];
  const changelogType = inferChangelogType(changelogLines[0]);

  return {
    version: String(v.version_number),
    createdAt: v.created_at,
    createdByTh:
      changelogType === "initial" ? "ระบบ (Initial Upload)" : "หน่วยงาน",
    createdByEn:
      changelogType === "initial" ? "System (Initial Upload)" : "Agency",
    changelogType,
    changelogTh: changelogLines,
    changelogEn: changelogLines,
    isCurrent: v.version_number === maxVersion,
  };
}

async function fetchVersionHistory(
  datasetId: string
): Promise<DatasetVersionItem[]> {
  const res = await apiClient.get<VersionsListResponse>(
    `/datasets/${datasetId}/versions`
  );
  const versions = res.data.data ?? [];
  if (versions.length === 0) {
    return [];
  }

  const maxVersion = Math.max(...versions.map((v) => v.version_number));

  return versions.map((v) => mapToVersionItem(v, maxVersion));
}

export function useVersionHistory(datasetId: string) {
  return useQuery({
    queryKey: ["agency", "datasets", datasetId, "versions"],
    queryFn: () => fetchVersionHistory(datasetId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: Boolean(datasetId),
  });
}
