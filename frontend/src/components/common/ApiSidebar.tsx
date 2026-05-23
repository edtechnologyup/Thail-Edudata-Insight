"use client";

import { useEffect, useState } from "react";
import type { ApiDocEndpoint } from "@/data/mockData";

const MAIN_NAV_IDS = [
  "getting-started",
  "authentication",
  "get-datasets",
  "get-dataset",
  "search",
  "download",
] as const;

const FOOTER_NAV_IDS = ["error-codes", "rate-limits"] as const;

type ApiSidebarProps = {
  endpoints: ApiDocEndpoint[];
  locale: string;
  version: string;
  activeId: string;
  onNavigate: (id: string) => void;
};

function getTitle(endpoint: ApiDocEndpoint, locale: string): string {
  return locale === "th" ? endpoint.titleTh : endpoint.titleEn;
}

function NavIcon({ id }: { id: string }) {
  const className = "h-5 w-5 shrink-0";

  switch (id) {
    case "getting-started":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15h-2v-6h2Zm0-8h-2V7h2Z" />
        </svg>
      );
    case "authentication":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm3 8H9V7a3 3 0 0 1 6 0Z" />
        </svg>
      );
    case "get-datasets":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 4h16v4H4Zm0 6h10v4H4Zm0 6h16v4H4Z" />
        </svg>
      );
    case "get-dataset":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 4h16v4H4Zm0 6h16v4H4Zm0 6h16v4H4Z" />
        </svg>
      );
    case "search":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z" />
        </svg>
      );
    case "download":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19 9h-4V3H9v6H5l7 7 7-7ZM5 18v2h14v-2H5Z" />
        </svg>
      );
    case "error-codes":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2 1 21h22L12 2Zm1 15h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
        </svg>
      );
    case "rate-limits":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M11 2v4.07A7.001 7.001 0 0 0 5.07 13H2v2h3.07A7.001 7.001 0 0 0 11 17.93V22h2v-4.07A7.001 7.001 0 0 0 18.93 13H22v-2h-3.07A7.001 7.001 0 0 0 13 6.07V2h-2Z" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
  }
}

function NavLink({
  endpoint,
  locale,
  isActive,
  onNavigate,
}: {
  endpoint: ApiDocEndpoint;
  locale: string;
  isActive: boolean;
  onNavigate: (id: string) => void;
}) {
  const title = getTitle(endpoint, locale);

  return (
    <a
      href={`#${endpoint.id}`}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(endpoint.id);
      }}
      className={`flex items-center gap-3 rounded-r-radius-full px-4 py-3 font-sarabun text-label transition-all ${
        isActive
          ? "border-l-4 border-primary-dark bg-primary-light font-bold text-primary-dark"
          : "text-text-secondary hover:bg-surface-container"
      }`}
    >
      <NavIcon id={endpoint.id} />
      {title}
    </a>
  );
}

export default function ApiSidebar({
  endpoints,
  locale,
  version,
  activeId,
  onNavigate,
}: ApiSidebarProps) {
  const endpointMap = new Map(endpoints.map((e) => [e.id, e]));
  const mainItems = MAIN_NAV_IDS.map((id) => endpointMap.get(id)).filter(
    Boolean
  ) as ApiDocEndpoint[];
  const footerItems = FOOTER_NAV_IDS.map((id) => endpointMap.get(id)).filter(
    Boolean
  ) as ApiDocEndpoint[];

  return (
    <aside className="hidden h-[calc(100vh-5rem)] w-64 shrink-0 flex-col gap-2 overflow-y-auto border-r border-border-sidebar py-spacing-6 md:sticky md:top-20 md:flex">
      <div className="mb-spacing-6 px-4">
        <h2 className="font-kanit text-heading-3 text-primary-dark">
          {locale === "th" ? "เอกสาร API" : "API Documentation"}
        </h2>
        <p className="font-sarabun text-label text-text-muted opacity-70">
          {version}
        </p>
      </div>
      <nav className="flex flex-col gap-1">
        {mainItems.map((endpoint) => (
          <NavLink
            key={endpoint.id}
            endpoint={endpoint}
            locale={locale}
            isActive={activeId === endpoint.id}
            onNavigate={onNavigate}
          />
        ))}
        <div className="mt-spacing-6 border-t border-border-default/30 pt-4">
          {footerItems.map((endpoint) => (
            <NavLink
              key={endpoint.id}
              endpoint={endpoint}
              locale={locale}
              isActive={activeId === endpoint.id}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>
    </aside>
  );
}

export function ApiMobileNav({
  endpoints,
  locale,
  activeId,
  onNavigate,
  jumpLabel,
}: ApiSidebarProps & { jumpLabel: string }) {
  const [open, setOpen] = useState(false);
  const endpointMap = new Map(endpoints.map((e) => [e.id, e]));
  const allIds = [...MAIN_NAV_IDS, ...FOOTER_NAV_IDS];
  const items = allIds
    .map((id) => endpointMap.get(id))
    .filter(Boolean) as ApiDocEndpoint[];

  useEffect(() => {
    const close = () => setOpen(false);
    if (open) {
      document.addEventListener("click", close);
      return () => document.removeEventListener("click", close);
    }
  }, [open]);

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      {open && (
        <div
          className="absolute bottom-20 right-0 w-56 overflow-hidden rounded-radius-xl border border-border-default bg-surface-card py-4 shadow-level-3"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="mb-2 border-b border-border-default px-4 pb-2 font-kanit text-label font-bold text-primary-dark">
            {jumpLabel}
          </p>
          {items.map((endpoint) => (
            <a
              key={endpoint.id}
              href={`#${endpoint.id}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(endpoint.id);
                setOpen(false);
              }}
              className={`block px-4 py-2 font-sarabun text-body-md hover:bg-surface-container ${
                activeId === endpoint.id
                  ? "font-medium text-primary-dark"
                  : "text-text-secondary"
              }`}
            >
              {getTitle(endpoint, locale)}
            </a>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex h-14 w-14 items-center justify-center rounded-radius-full bg-primary-dark text-surface-card shadow-level-2 transition-transform hover:scale-105 active:scale-95"
        aria-label={jumpLabel}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
        </svg>
      </button>
    </div>
  );
}

export function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: [0, 0.25, 0.5] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
    }
  };

  return { activeId, scrollTo };
}
