"use client";

import { useEffect } from "react";
import Navbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // TODO: เปิด Auth Guard เมื่อ Backend พร้อม
  // ตอนนี้ bypass ไว้ก่อนเพื่อทดสอบ UI
  // useEffect(() => {
  //   if (!token) {
  //     router.replace(`/${locale}/login`);
  //     return;
  //   }
  //
  //   if (user && user.role !== "admin") {
  //     router.replace(`/${locale}`);
  //   }
  // }, [token, user, router, locale]);

  // if (!token) {
  //   return null;
  // }

  // if (user && user.role !== "admin") {
  //   return null;
  // }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar variant="admin" />
      <div className="flex flex-1">
        <Sidebar variant="admin" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
