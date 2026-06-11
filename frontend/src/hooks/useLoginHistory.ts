"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type LoginHistoryResult = "success" | "fail";

export type LoginHistoryItem = {
  id: string;
  timestamp: string;
  ip_address: string;
  user_agent: string | null;
  result: LoginHistoryResult;
};

type ApiLoginHistoryItem = {
  id: string;
  action: "LOGIN_SUCCESS" | "LOGIN_FAIL" | string;
  ip_address: string;
  user_agent: string | null;
  created_at: string;
};

type LoginHistoryResponse = {
  success: boolean;
  data: ApiLoginHistoryItem[];
};

function mapLoginHistoryItem(item: ApiLoginHistoryItem): LoginHistoryItem {
  return {
    id: item.id,
    timestamp: item.created_at,
    ip_address: item.ip_address,
    user_agent: item.user_agent,
    result: item.action === "LOGIN_SUCCESS" ? "success" : "fail",
  };
}

async function fetchLoginHistory(): Promise<LoginHistoryItem[]> {
  const res = await apiClient.get<LoginHistoryResponse>("/auth/login-history");
  return (res.data.data ?? []).map(mapLoginHistoryItem);
}

export function useLoginHistory() {
  return useQuery({
    queryKey: ["auth", "login-history"],
    queryFn: fetchLoginHistory,
    retry: 1,
    staleTime: 30 * 1000,
  });
}
