"use client";

import { useState } from "react";
import type { ApiEndpointDoc, ApiHttpMethod } from "@/data/apiDocsContent";
import { getLocalizedText } from "@/data/apiDocsContent";
import CodeBlock from "@/components/common/CodeBlock";
import PermissionBadge from "@/components/common/PermissionBadge";

const METHOD_STYLES: Record<ApiHttpMethod, string> = {
  GET: "bg-status-published-bg text-status-published",
  POST: "bg-status-draft-bg text-status-draft",
  PUT: "bg-status-warning-bg text-status-warning",
  PATCH: "bg-status-warning-bg text-status-warning",
  DELETE: "bg-status-error-bg text-status-error",
};

type EndpointCardProps = {
  endpoint: ApiEndpointDoc;
  locale: string;
  requestLabel: string;
  responseLabel: string;
  expandLabel: string;
  collapseLabel: string;
};

export default function EndpointCard({
  endpoint,
  locale,
  requestLabel,
  responseLabel,
  expandLabel,
  collapseLabel,
}: EndpointCardProps) {
  const [open, setOpen] = useState(false);
  const title = getLocalizedText(endpoint.title, locale);
  const description = getLocalizedText(endpoint.description, locale);

  return (
    <article
      id={endpoint.id}
      className="scroll-mt-28 overflow-hidden rounded-radius-xl border border-border-default bg-surface-card shadow-level-1"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full flex-col gap-4 px-5 py-5 text-left transition-colors hover:bg-surface-page md:px-6"
        aria-expanded={open}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex min-w-16 justify-center rounded-radius-md px-3 py-1 font-mono text-code font-bold ${METHOD_STYLES[endpoint.method]}`}
              >
                {endpoint.method}
              </span>
              <code className="break-all rounded-radius-md bg-surface-container px-3 py-1 font-mono text-code text-text-secondary">
                {endpoint.path}
              </code>
            </div>
            <div>
              <h3 className="font-kanit text-heading-3-mobile text-text-primary md:text-heading-3">
                {title}
              </h3>
              <p className="mt-1 font-sarabun text-body-md text-text-secondary">
                {description}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {endpoint.permissions.map((permission) => (
              <PermissionBadge key={permission} permission={permission} />
            ))}
          </div>
        </div>

        <span className="inline-flex items-center gap-2 self-start font-sarabun text-label font-semibold text-primary-dark">
          {open ? collapseLabel : expandLabel}
          <ChevronIcon open={open} />
        </span>
      </button>

      {open && (
        <div className="grid gap-5 border-t border-border-default bg-surface-page p-5 md:grid-cols-2 md:p-6">
          <div>
            <h4 className="mb-3 font-kanit text-label font-semibold text-text-primary">
              {requestLabel}
            </h4>
            <CodeBlock code={endpoint.requestExample} label="REQUEST" />
          </div>
          <div>
            <h4 className="mb-3 font-kanit text-label font-semibold text-text-primary">
              {responseLabel}
            </h4>
            <CodeBlock code={endpoint.responseExample} label="JSON" />
          </div>
        </div>
      )}
    </article>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M7 10l5 5 5-5H7z" />
    </svg>
  );
}
