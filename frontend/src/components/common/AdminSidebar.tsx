"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import apiClient from "@/services/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUIStore } from "@/stores/useUIStore";

type NavItem = {
  href: string;
  labelKey: string;
  icon: string;
  match: (path: string) => boolean;
};

function NavIcon({ name }: { name: string }) {
  const className = "h-5 w-5 shrink-0";

  switch (name) {
    case "dashboard":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-8h8V3h-8v10Z" />
        </svg>
      );
    case "users":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" />
        </svg>
      );
    case "datasets":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 4h16v4H4V4Zm0 6h10v4H4v-4Zm0 6h16v4H4v-4Z" />
        </svg>
      );
    case "scholarships":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
        </svg>
      );
    case "categories":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="m12 2 2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7Z" />
        </svg>
      );
    case "pages":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20 4H4c-1.1 0-2 0.9-2 2v12c0 1.1 0.9 2 2 2h16c1.1 0 2-0.9 2-2V6c0-1.1-0.9-2-2-2Zm0 14H4V8h16v10Z" />
        </svg>
      );
    case "audit":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18Zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12Z" />
        </svg>
      );
    case "email":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
        </svg>
      );
    case "settings":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58ZM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2Z" />
        </svg>
      );
    default:
      return null;
  }
}

function MenuIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 0.9-2 2v14c0 1.1 0.9 2 2 2h8v-2H4V5z" />
    </svg>
  );
}

function SidebarNav({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations("admin.nav");

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex min-h-[44px] items-center gap-3 rounded-xl px-4 py-2.5 font-sarabun text-label text-white transition-all ${
              active
                ? "font-medium"
                : "hover:bg-white/[0.10]"
            }`}
            style={active ? {
              background: "linear-gradient(135deg, rgba(129,212,250,0.35) 0%, rgba(255,255,255,0.18) 100%)",
              boxShadow: "0 4px 16px 0 rgba(0,69,188,0.25), inset 0 1px 0 0 rgba(255,255,255,0.3)",
              border: "1px solid rgba(255,255,255,0.25)",
              backdropFilter: "blur(8px)",
            } : undefined}
          >
            <NavIcon name={item.icon} />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const locale = useLocale();
  const router = useRouter();
  const base = `/${locale}`;
  const tNav = useTranslations("admin.nav");
  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // still clear local session
    } finally {
      useAuthStore.getState().logout();
      onNavigate?.();
      router.push(`${base}/login`);
    }
  };

  return (
    <div className="border-t border-white/15 px-3 py-4">
      <button
        type="button"
        onClick={handleLogout}
        className="flex min-h-[44px] w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-4 py-2.5 font-sarabun text-label font-normal text-yellow-300 transition-colors hover:bg-red-700"
      >
        <LogoutIcon />
        {tNav("logout")}
      </button>
    </div>
  );
}

export default function AdminSidebar() {
  const t = useTranslations("admin.nav");
  const locale = useLocale();
  const pathname = usePathname();
  const base = `/${locale}`;
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();

  const items: NavItem[] = [
    {
      href: `${base}/admin`,
      labelKey: "dashboard",
      icon: "dashboard",
      match: (p) => p === `${base}/admin`,
    },
    {
      href: `${base}/admin/users`,
      labelKey: "users",
      icon: "users",
      match: (p) => p.startsWith(`${base}/admin/users`),
    },
    {
      href: `${base}/admin/datasets`,
      labelKey: "datasets",
      icon: "datasets",
      match: (p) => p.startsWith(`${base}/admin/datasets`),
    },
    {
      href: `${base}/admin/scholarships`,
      labelKey: "scholarships",
      icon: "scholarships",
      match: (p) => p.startsWith(`${base}/admin/scholarships`),
    },
    {
      href: `${base}/admin/categories`,
      labelKey: "categories",
      icon: "categories",
      match: (p) => p.startsWith(`${base}/admin/categories`),
    },
    {
      href: `${base}/admin/pages`,
      labelKey: "pages",
      icon: "pages",
      match: (p) => p.startsWith(`${base}/admin/pages`),
    },
    {
      href: `${base}/admin/site-settings`,
      labelKey: "siteSettings",
      icon: "settings",
      match: (p) => p.startsWith(`${base}/admin/site-settings`),
    },
    {
      href: `${base}/admin/audit-logs`,
      labelKey: "auditLogs",
      icon: "audit",
      match: (p) => p.startsWith(`${base}/admin/audit-logs`),
    },
    {
      href: `${base}/admin/email-logs`,
      labelKey: "emailLogs",
      icon: "email",
      match: (p) => p.startsWith(`${base}/admin/email-logs`),
    },
  ];

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  const closeDrawer = () => setSidebarOpen(false);

  const sidebarHeader = (
    <div className="px-4 py-6">
      <h2 className="font-kanit text-xl font-bold text-white">
        Thai EduData
      </h2>
      <p className="font-sarabun text-body-sm text-white/60">{t("portal")}</p>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={toggleSidebar}
        className="fixed bottom-6 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-lg text-white shadow-lg lg:hidden"
        style={{ background: "#0045bc" }}
        aria-label={t("menu")}
      >
        <MenuIcon />
      </button>

      <aside
        className="sticky top-20 hidden h-[calc(100vh-5rem)] w-[240px] shrink-0 flex-col lg:flex"
        style={{
          background: "#0045bc",
          boxShadow: "4px 0 32px 0 rgba(60,100,255,0.3)",
        }}
      >
        {sidebarHeader}
        <SidebarNav items={items} pathname={pathname} />
        <SidebarFooter />
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-label={t("closeMenu")}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col shadow-2xl" style={{ background: "#0045bc" }}>
            <div className="flex items-center justify-between border-b border-white/15 px-4 py-4">
              <span className="font-kanit text-label font-semibold text-white">
                {t("menu")}
              </span>
              <button
                type="button"
                onClick={closeDrawer}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white/70 hover:bg-white/[0.10] hover:text-white"
                aria-label={t("closeMenu")}
              >
                <CloseIcon />
              </button>
            </div>
            {sidebarHeader}
            <SidebarNav items={items} pathname={pathname} onNavigate={closeDrawer} />
            <SidebarFooter onNavigate={closeDrawer} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
