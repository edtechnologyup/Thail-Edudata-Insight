"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type TocSection = {
  id: string;
  label: string;
};

export type TocPageLink = {
  href: string;
  label: string;
  active?: boolean;
};

type TableOfContentsProps = {
  sections: TocSection[];
  pageLinks?: TocPageLink[];
  className?: string;
};

export default function TableOfContents({
  sections,
  pageLinks,
  className = "",
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: "-10% 0px -80% 0px",
        threshold: 0,
      }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      className={`flex flex-col space-y-1 ${className}`}
      aria-label="Table of contents"
    >
      {pageLinks && pageLinks.length > 0 && (
        <>
          {pageLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`border-l-[3px] px-4 py-2.5 font-sarabun text-label transition-all ${
                link.active
                  ? "border-primary-dark bg-primary-light/30 font-semibold text-primary-dark"
                  : "border-transparent text-text-muted hover:bg-surface-container hover:text-primary-dark"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {sections.length > 1 && (
            <hr className="mx-4 my-2 border-t border-border-default/50" />
          )}
        </>
      )}
      {sections.length > 1 && sections.map((section) => {
        const isActive = activeId === section.id;
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`border-l-[3px] px-4 py-3 font-sarabun text-label transition-all hover:bg-surface-container ${
              isActive
                ? "border-primary-dark bg-primary-light/50 font-medium text-primary-dark"
                : "border-transparent text-text-secondary hover:text-primary-dark"
            }`}
          >
            {section.label}
          </a>
        );
      })}
    </nav>
  );
}
