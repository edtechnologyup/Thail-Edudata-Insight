"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

export function RoleThemeProvider() {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const role =
      user?.role === "agency" || user?.role === "admin"
        ? user.role
        : "visitor";
    document.documentElement.setAttribute("data-role", role);
  }, [user?.role]);

  return null;
}
