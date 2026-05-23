"use client";

import { usePathname, useRouter, useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useState } from "react";

type SearchBarProps = {
  defaultValue?: string;
  size?: "default" | "large";
  className?: string;
  /** When true, updates ?q= on current path instead of navigating to /search */
  syncUrl?: boolean;
};

export default function SearchBar({
  defaultValue = "",
  size = "default",
  className = "",
  syncUrl = false,
}: SearchBarProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as string) || "th";
  const urlQuery = searchParams.get("q") ?? "";
  const [keyword, setKeyword] = useState(defaultValue || urlQuery);

  useEffect(() => {
    if (syncUrl) {
      setKeyword(urlQuery);
    }
  }, [syncUrl, urlQuery]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = keyword.trim();
    if (q.length < 2) return;

    if (syncUrl) {
      const next = new URLSearchParams(searchParams.toString());
      next.set("q", q);
      next.delete("page");
      const query = next.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
      return;
    }

    router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
  }

  const inputClass =
    size === "large"
      ? "h-12 text-body-lg"
      : "h-10 text-body-md";

  return (
    <form onSubmit={handleSubmit} className={`flex w-full gap-2 ${className}`}>
      <input
        type="search"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder={t("placeholder")}
        className={`flex-1 rounded-radius-sm border border-border-input bg-surface-card px-3 font-sarabun text-text-primary outline-none focus:border-border-focus focus:ring-2 focus:ring-primary-dark/20 ${inputClass}`}
        aria-label={t("keyword")}
      />
      <button
        type="submit"
        className="shrink-0 rounded-radius-sm bg-primary px-4 font-sarabun text-label font-medium text-white transition-colors hover:bg-primary-hover min-h-[44px] md:min-h-[40px]"
      >
        {t("submit", { defaultValue: "ค้นหา" })}
      </button>
    </form>
  );
}
