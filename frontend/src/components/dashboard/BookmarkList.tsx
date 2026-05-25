"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { AgencyBookmarkMock } from "@/data/mockData";
import { useBookmarks, useDeleteBookmark } from "@/hooks/useBookmarks";

function formatViewCount(count: number, locale: string): string {
  if (count >= 1000) {
    const k = count / 1000;
    const formatted =
      k >= 10
        ? Math.round(k).toString()
        : k.toFixed(1).replace(/\.0$/, "");
    return `${formatted}k`;
  }
  return count.toLocaleString(locale === "th" ? "th-TH" : "en-US");
}

function BookmarkCard({
  bookmark,
  locale,
  base,
  onDelete,
  isDeleting,
}: {
  bookmark: AgencyBookmarkMock;
  locale: string;
  base: string;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const t = useTranslations("agency.saved");
  const title = locale === "th" ? bookmark.title : bookmark.titleEn;
  const category = locale === "th" ? bookmark.category : bookmark.categoryEn;
  const agency = locale === "th" ? bookmark.agency : bookmark.agencyEn;
  const views = formatViewCount(bookmark.viewCount, locale);

  return (
    <article className="flex flex-col rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 transition-all hover:-translate-y-0.5 hover:shadow-level-2">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="rounded-radius-full bg-primary-light px-2 py-0.5 font-sarabun text-[10px] font-bold uppercase tracking-wider text-primary-dark">
          {category}
        </span>
        <span
          className={`rounded px-2 py-0.5 font-sarabun text-[10px] font-bold uppercase ${
            bookmark.status === "published"
              ? "bg-primary/10 text-primary-dark"
              : "bg-status-draft-bg text-status-draft"
          }`}
        >
          {bookmark.status === "published"
            ? t("statusPublished")
            : t("statusDraft")}
        </span>
      </div>

      <Link
        href={`${base}/datasets/${bookmark.datasetId}`}
        className="mb-1 font-kanit text-body-md font-semibold leading-snug text-text-primary hover:text-primary-dark hover:underline"
      >
        {title}
      </Link>

      <p className="mb-4 flex items-center gap-1 font-sarabun text-caption text-text-muted">
        <AgencyIcon />
        {agency}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-border-default/20 pt-4">
        <div className="flex items-center gap-2 text-text-muted">
          <ViewIcon />
          <span className="font-sarabun text-caption">{t("views", { count: views })}</span>
        </div>
        <button
          type="button"
          onClick={() => onDelete(bookmark.datasetId)}
          disabled={isDeleting}
          className="flex items-center gap-1 rounded-radius-sm px-2 py-1 font-sarabun text-caption font-semibold text-status-error transition-colors hover:bg-status-error-bg disabled:opacity-50"
        >
          <DeleteIcon />
          {t("bookmark.delete")}
        </button>
      </div>
    </article>
  );
}

function ListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-48 animate-pulse rounded-radius-lg bg-surface-container"
        />
      ))}
    </div>
  );
}

export default function BookmarkList() {
  const t = useTranslations("agency.saved.bookmark");
  const locale = useLocale();
  const base = `/${locale}`;
  const { data, isLoading, isError } = useBookmarks();
  const deleteMutation = useDeleteBookmark();

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // Parent can show toast via optional callback if needed
    }
  };

  if (isError) {
    return (
      <p className="font-sarabun text-label text-status-error">{t("loadError")}</p>
    );
  }

  if (isLoading) {
    return <ListSkeleton />;
  }

  const bookmarks = data ?? [];

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-radius-lg border border-border-default/80 bg-surface-card px-6 py-16 text-center shadow-level-1">
        <p className="font-sarabun text-body-lg text-text-secondary">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          locale={locale}
          base={base}
          onDelete={handleDelete}
          isDeleting={deleteMutation.isPending}
        />
      ))}
    </div>
  );
}

function AgencyIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z" />
    </svg>
  );
}

function ViewIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}
