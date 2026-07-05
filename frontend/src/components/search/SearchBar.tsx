"use client";

import { usePathname, useRouter, useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import apiClient from "@/services/api";

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (syncUrl) {
      setKeyword(urlQuery);
    }
  }, [syncUrl, urlQuery]);

  const performSearch = useCallback(
    (raw: string) => {
      const q = raw.trim();
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
    },
    [syncUrl, searchParams, pathname, router, locale]
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuggestionsOpen(false);
    performSearch(keyword);
  }

  function handleSelectSuggestion(value: string) {
    setKeyword(value);
    setSuggestionsOpen(false);
    performSearch(value);
  }

  useEffect(() => {
    const q = keyword.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const response = await apiClient.get("/search/autocomplete", {
          params: { q },
        });
        const data = (
          response.data as { data?: { suggestions?: string[] } }
        ).data;
        const list = (data?.suggestions ?? []).slice(0, 10);
        setSuggestions(list);
        setSuggestionsOpen(list.length > 0);
      } catch {
        setSuggestions([]);
        setSuggestionsOpen(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setSuggestionsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const inputClass =
    size === "large"
      ? "h-12 text-body-lg"
      : "h-10 text-body-md";

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="flex items-center gap-2 rounded-radius-full bg-white p-2 shadow-level-2">
        <div ref={wrapperRef} className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSuggestionsOpen(false);
              }
            }}
            onFocus={() => {
              if (suggestions.length > 0) {
                setSuggestionsOpen(true);
              }
            }}
            placeholder={t("placeholder")}
            className={`w-full border-0 bg-transparent pl-10 pr-3 font-sarabun text-text-primary outline-none ${inputClass}`}
            aria-label={t("keyword")}
            aria-expanded={suggestionsOpen}
            aria-autocomplete="list"
            role="combobox"
          />
          {suggestionsOpen && suggestions.length > 0 ? (
            <ul
              role="listbox"
              className="absolute z-20 mt-3 max-h-60 w-full overflow-auto rounded-2xl border border-border-default bg-white py-1 shadow-level-2"
            >
              {suggestions.map((suggestion) => (
                <li key={suggestion} role="option">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(suggestion);
                    }}
                    className="block w-full px-4 py-2 text-left font-sarabun text-body-md text-text-primary transition-colors hover:bg-primary-light"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <button
          type="submit"
          className="min-h-[44px] shrink-0 rounded-radius-full bg-gradient-to-b from-primary-hover to-primary-dark px-6 font-sarabun text-label font-bold text-white shadow-level-1 transition-all hover:brightness-110 md:min-h-[40px]"
        >
          {t("submit", { defaultValue: "ค้นหา" })}
        </button>
      </div>
    </form>
  );
}
