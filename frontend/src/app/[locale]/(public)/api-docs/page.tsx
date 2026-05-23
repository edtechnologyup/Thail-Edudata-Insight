"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import ApiSidebar, {
  ApiMobileNav,
  useActiveSection,
} from "@/components/common/ApiSidebar";
import CodeBlock from "@/components/common/CodeBlock";
import MethodBadge from "@/components/common/MethodBadge";
import type { ApiDocEndpoint, ApiDocParam } from "@/data/mockData";
import { useApiDocs } from "@/hooks/useApiDocs";

function ParamsTable({
  params,
  locale,
  requiredLabel,
  optionalLabel,
  paramNameLabel,
  paramTypeLabel,
  paramRequiredLabel,
  paramDescLabel,
}: {
  params: ApiDocParam[];
  locale: string;
  requiredLabel: string;
  optionalLabel: string;
  paramNameLabel: string;
  paramTypeLabel: string;
  paramRequiredLabel: string;
  paramDescLabel: string;
}) {
  return (
    <div className="mb-spacing-6 overflow-x-auto rounded-radius-lg border border-border-default/50">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-surface-container font-sarabun text-label text-text-secondary">
            <th className="p-4 font-semibold">{paramNameLabel}</th>
            <th className="p-4 font-semibold">{paramTypeLabel}</th>
            <th className="p-4 font-semibold">{paramRequiredLabel}</th>
            <th className="p-4 font-semibold">{paramDescLabel}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-default/30 bg-surface-card">
          {params.map((param) => (
            <tr
              key={param.name}
              className="transition-colors hover:bg-surface-page"
            >
              <td className="p-4 font-mono text-code font-medium text-primary-dark">
                {param.name}
              </td>
              <td className="p-4 font-sarabun text-body-md">{param.type}</td>
              <td className="p-4 font-sarabun text-body-md">
                {param.required ? (
                  <span className="font-medium text-status-error">
                    {requiredLabel}
                  </span>
                ) : (
                  <span className="italic text-text-muted">{optionalLabel}</span>
                )}
              </td>
              <td className="p-4 font-sarabun text-body-md">
                {locale === "th" ? param.descTh : param.descEn}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BaseUrlBlock({
  baseUrl,
  copyLabel,
  copiedLabel,
}: {
  baseUrl: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  return (
    <CopyableInlineCode code={baseUrl} copyLabel={copyLabel} copiedLabel={copiedLabel} />
  );
}

function CopyableInlineCode({
  code,
  copyLabel,
  copiedLabel,
}: {
  code: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 overflow-hidden rounded-radius-md bg-text-primary p-4">
      <code className="break-all font-mono text-code text-surface-card">{code}</code>
      <button
        type="button"
        onClick={handleCopy}
        className="flex shrink-0 items-center gap-1 font-sarabun text-caption text-text-muted transition-colors hover:text-surface-card"
      >
        <span>{copied ? copiedLabel : copyLabel}</span>
      </button>
    </div>
  );
}

function EndpointSection({
  endpoint,
  locale,
  requiredLabel,
  optionalLabel,
  paramNameLabel,
  paramTypeLabel,
  paramRequiredLabel,
  paramDescLabel,
  baseUrlLabel,
  copyLabel,
  copiedLabel,
  globalBaseUrl,
}: {
  endpoint: ApiDocEndpoint;
  locale: string;
  requiredLabel: string;
  optionalLabel: string;
  paramNameLabel: string;
  paramTypeLabel: string;
  paramRequiredLabel: string;
  paramDescLabel: string;
  baseUrlLabel: string;
  copyLabel: string;
  copiedLabel: string;
  globalBaseUrl: string;
}) {
  const title = locale === "th" ? endpoint.titleTh : endpoint.titleEn;
  const desc =
    locale === "th" ? endpoint.descTh : endpoint.descEn;
  const content =
    locale === "th" ? endpoint.contentTh : endpoint.contentEn;

  if (!endpoint.method) {
    return (
      <section id={endpoint.id} className="scroll-mt-24">
        <h2 className="mb-4 font-kanit text-heading-3 text-text-primary">
          {title}
        </h2>
        {desc && (
          <p className="mb-spacing-6 font-sarabun text-body-lg text-text-secondary">
            {desc}
          </p>
        )}
        {content && (
          <p className="font-sarabun text-body-md text-text-secondary">
            {content}
          </p>
        )}
        {endpoint.id === "getting-started" && (
          <div className="mt-spacing-6 rounded-radius-lg border border-border-default/50 bg-surface-container p-spacing-6">
            <h3 className="mb-2 font-sarabun text-label font-bold uppercase tracking-wider text-text-secondary">
              {baseUrlLabel}
            </h3>
            <BaseUrlBlock
              baseUrl={globalBaseUrl}
              copyLabel={copyLabel}
              copiedLabel={copiedLabel}
            />
          </div>
        )}
        {endpoint.code && (
          <div className="mt-spacing-6">
            <CodeBlock code={endpoint.code} label="Header" showHeader={false} />
          </div>
        )}
      </section>
    );
  }

  return (
    <section id={endpoint.id} className="scroll-mt-24">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <MethodBadge method={endpoint.method} />
        <h2 className="font-kanit text-heading-3 text-text-primary">{title}</h2>
        {endpoint.path && (
          <code className="font-mono text-code text-text-muted opacity-80">
            {endpoint.path}
          </code>
        )}
      </div>
      {desc && (
        <p className="mb-spacing-6 font-sarabun text-body-md text-text-secondary">
          {desc}
        </p>
      )}
      {endpoint.params && endpoint.params.length > 0 && (
        <ParamsTable
          params={endpoint.params}
          locale={locale}
          requiredLabel={requiredLabel}
          optionalLabel={optionalLabel}
          paramNameLabel={paramNameLabel}
          paramTypeLabel={paramTypeLabel}
          paramRequiredLabel={paramRequiredLabel}
          paramDescLabel={paramDescLabel}
        />
      )}
      {endpoint.response && <CodeBlock code={endpoint.response} />}
    </section>
  );
}

function ApiDocsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-spacing-8 py-spacing-6">
      <div className="h-8 w-48 animate-pulse rounded-radius-sm bg-surface-container" />
      <div className="h-20 w-full max-w-2xl animate-pulse rounded-radius-sm bg-surface-container" />
      <div className="h-32 w-full animate-pulse rounded-radius-md bg-surface-container" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <div className="h-6 w-64 animate-pulse rounded-radius-sm bg-surface-container" />
          <div className="h-40 w-full animate-pulse rounded-radius-md bg-surface-container" />
        </div>
      ))}
    </div>
  );
}

export default function ApiDocsPage() {
  const t = useTranslations("apiDocs");
  const locale = useLocale();
  const { data, isLoading, isError, isFetching } = useApiDocs();

  const docs = data;
  const sectionIds = useMemo(
    () => docs?.endpoints.map((e) => e.id) ?? [],
    [docs?.endpoints]
  );
  const { activeId, scrollTo } = useActiveSection(sectionIds);

  const showFallbackBanner = isError && !isLoading;
  const showSkeleton = isLoading && !docs;

  if (showSkeleton) {
    return (
      <div className="mx-auto flex max-w-container-max gap-spacing-6 px-4 py-spacing-6 md:px-spacing-10">
        <div className="hidden w-64 shrink-0 md:block">
          <div className="h-64 animate-pulse rounded-radius-md bg-surface-container" />
        </div>
        <ApiDocsSkeleton />
      </div>
    );
  }

  if (!docs) {
    return null;
  }

  const pageTitle = locale === "th" ? docs.titleTh : docs.titleEn;
  const pageDesc =
    locale === "th" ? docs.descriptionTh : docs.descriptionEn;

  return (
    <>
      <div className="mx-auto flex max-w-container-max gap-spacing-6 px-4 md:px-spacing-10">
        <ApiSidebar
          endpoints={docs.endpoints}
          locale={locale}
          version={docs.version}
          activeId={activeId}
          onNavigate={scrollTo}
        />

        <article className="min-w-0 flex-1 py-spacing-6">
          <nav className="mb-spacing-3 flex items-center gap-2 font-sarabun text-label text-text-muted">
            <Link href={`/${locale}`} className="hover:text-primary-dark">
              {t("breadcrumbHome")}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-primary-dark">
              {t("breadcrumbCurrent")}
            </span>
          </nav>

          {showFallbackBanner && (
            <p className="mb-spacing-4 rounded-radius-md border border-status-warning bg-status-warning-bg px-4 py-3 font-sarabun text-body-md text-status-warning">
              {t("fallback")}
            </p>
          )}

          {isFetching && !isLoading && (
            <p className="mb-spacing-4 font-sarabun text-caption text-text-muted">
              {t("loading")}
            </p>
          )}

          <header className="mb-spacing-12">
            <h1 className="mb-spacing-3 font-kanit text-heading-1 text-text-primary">
              {pageTitle}
            </h1>
            <p className="max-w-2xl font-sarabun text-body-lg text-text-secondary">
              {pageDesc}
            </p>
          </header>

          <div className="space-y-spacing-12">
            {docs.endpoints.map((endpoint, index) => (
              <div key={endpoint.id}>
                <EndpointSection
                  endpoint={endpoint}
                  locale={locale}
                  requiredLabel={t("required")}
                  optionalLabel={t("optional")}
                  paramNameLabel={t("paramName")}
                  paramTypeLabel={t("paramType")}
                  paramRequiredLabel={t("paramRequired")}
                  paramDescLabel={t("paramDescription")}
                  baseUrlLabel={t("baseUrl")}
                  copyLabel={t("copy")}
                  copiedLabel={t("copied")}
                  globalBaseUrl={docs.baseUrl}
                />
                {index < docs.endpoints.length - 1 && (
                  <hr className="mt-spacing-12 border-border-default/30" />
                )}
              </div>
            ))}
          </div>
        </article>
      </div>

      <ApiMobileNav
        endpoints={docs.endpoints}
        locale={locale}
        version={docs.version}
        activeId={activeId}
        onNavigate={scrollTo}
        jumpLabel={t("jumpTo")}
      />
    </>
  );
}
