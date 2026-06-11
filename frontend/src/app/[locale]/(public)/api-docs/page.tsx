"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import ApiSidebar, {
  ApiMobileNav,
  type ApiDocNavItem,
  useActiveSection,
} from "@/components/common/ApiSidebar";
import EndpointCard from "@/components/common/EndpointCard";
import QuickStart from "@/components/common/QuickStart";
import {
  API_ENDPOINT_GROUPS,
  QUICK_START_STEPS,
  getLocalizedText,
} from "@/data/apiDocsContent";
import { useApiDocs } from "@/hooks/useApiDocs";

function ApiDocsSkeleton() {
  return (
    <div className="mx-auto flex max-w-container-max gap-spacing-6 px-4 py-spacing-8 md:px-spacing-10">
      <div className="hidden w-72 shrink-0 md:block">
        <div className="h-80 animate-pulse rounded-radius-xl bg-surface-container" />
      </div>
      <div className="flex-1 space-y-spacing-6">
        <div className="h-9 w-72 animate-pulse rounded-radius-sm bg-surface-container" />
        <div className="h-24 max-w-3xl animate-pulse rounded-radius-md bg-surface-container" />
        <div className="h-72 animate-pulse rounded-radius-xl bg-surface-container" />
        <div className="h-48 animate-pulse rounded-radius-xl bg-surface-container" />
      </div>
    </div>
  );
}

export default function ApiDocsPage() {
  const t = useTranslations("apiDocs");
  const locale = useLocale();
  const { data, isLoading, isError, isFetching } = useApiDocs();

  const navItems = useMemo<ApiDocNavItem[]>(
    () => [
      {
        id: "quick-start",
        title: {
          th: t("quickStartTitle"),
          en: t("quickStartTitle"),
        },
        description: {
          th: t("quickStartNavDescription"),
          en: t("quickStartNavDescription"),
        },
      },
      ...API_ENDPOINT_GROUPS.map((group) => ({
        id: group.id,
        title: group.title,
        description: group.description,
      })),
    ],
    [t]
  );

  const sectionIds = useMemo(() => navItems.map((item) => item.id), [navItems]);
  const { activeId, scrollTo } = useActiveSection(sectionIds);

  if (isLoading && !data) {
    return <ApiDocsSkeleton />;
  }

  const docs = data;
  const pageTitle =
    locale === "th"
      ? "Thai EduData Insight API Documentation"
      : "Thai EduData Insight API Documentation";
  const pageDescription = docs
    ? locale === "th"
      ? docs.descriptionTh
      : docs.descriptionEn
    : t("portalDescription");
  const version = docs?.version ?? "v1";

  return (
    <>
      <div className="border-b border-border-default bg-surface-card">
        <div className="mx-auto max-w-container-max px-4 py-spacing-8 md:px-spacing-10">
          <nav className="mb-spacing-4 flex items-center gap-2 font-sarabun text-label text-text-muted">
            <Link href={`/${locale}`} className="transition-colors hover:text-primary-dark">
              {t("breadcrumbHome")}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-primary-dark">
              {t("breadcrumbCurrent")}
            </span>
          </nav>

          <div className="grid gap-spacing-8 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <p className="mb-3 inline-flex rounded-radius-full bg-primary-light px-4 py-1 font-sarabun text-caption font-semibold uppercase tracking-[0.18em] text-primary-dark">
                {t("portalEyebrow")}
              </p>
              <h1 className="font-kanit text-heading-1 text-text-primary">
                {pageTitle}
              </h1>
              <p className="mt-spacing-3 max-w-3xl font-sarabun text-body-lg text-text-secondary">
                {pageDescription}
              </p>
            </div>

            <div className="rounded-radius-xl border border-primary/20 bg-primary-light p-5">
              <p className="font-sarabun text-caption font-semibold uppercase tracking-[0.18em] text-primary-dark">
                {t("baseUrl")}
              </p>
              <code className="mt-2 block break-all rounded-radius-md bg-surface-card px-3 py-2 font-mono text-code text-text-primary">
                {docs?.baseUrl ?? "http://127.0.0.1:8000/api/v1"}
              </code>
              <p className="mt-3 font-sarabun text-caption text-text-secondary">
                {t("versionLabel")}: {version}
              </p>
            </div>
          </div>

          {isError && (
            <p className="mt-spacing-4 rounded-radius-md border border-status-warning bg-status-warning-bg px-4 py-3 font-sarabun text-body-md text-status-warning">
              {t("fallback")}
            </p>
          )}
          {isFetching && !isLoading && (
            <p className="mt-spacing-4 font-sarabun text-caption text-text-muted">
              {t("loading")}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-container-max gap-spacing-6 px-4 md:px-spacing-10">
        <ApiSidebar
          items={navItems}
          locale={locale}
          version={version}
          activeId={activeId}
          onNavigate={scrollTo}
          title={t("sidebarTitle")}
        />

        <main className="min-w-0 flex-1 py-spacing-8">
          <div className="space-y-spacing-12">
            <QuickStart
              steps={QUICK_START_STEPS}
              locale={locale}
              title={t("quickStartTitle")}
              description={t("quickStartDescription")}
            />

            {API_ENDPOINT_GROUPS.map((group) => (
              <section
                key={group.id}
                id={group.id}
                className="scroll-mt-28 space-y-spacing-6"
              >
                <div className="rounded-radius-xl border border-border-default bg-surface-card p-5 shadow-level-1 md:p-6">
                  <p className="mb-2 font-sarabun text-caption font-semibold uppercase tracking-[0.18em] text-primary-dark">
                    {t("endpointGroupLabel")}
                  </p>
                  <h2 className="font-kanit text-heading-2 text-text-primary">
                    {getLocalizedText(group.title, locale)}
                  </h2>
                  <p className="mt-2 max-w-2xl font-sarabun text-body-md text-text-secondary">
                    {getLocalizedText(group.description, locale)}
                  </p>
                </div>

                <div className="space-y-4">
                  {group.endpoints.map((endpoint) => (
                    <EndpointCard
                      key={endpoint.id}
                      endpoint={endpoint}
                      locale={locale}
                      requestLabel={t("requestExample")}
                      responseLabel={t("response")}
                      expandLabel={t("expandEndpoint")}
                      collapseLabel={t("collapseEndpoint")}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>

      <ApiMobileNav
        items={navItems}
        locale={locale}
        version={version}
        activeId={activeId}
        onNavigate={scrollTo}
        title={t("sidebarTitle")}
        jumpLabel={t("jumpTo")}
      />
    </>
  );
}
