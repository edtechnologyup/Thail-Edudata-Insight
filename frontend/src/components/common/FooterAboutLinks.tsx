"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type PageItem = {
  slug: string;
  title_th: string;
  title_en: string;
};

type FooterAboutLinksProps = {
  locale: string;
  title: string;
};

export default function FooterAboutLinks({ locale, title }: FooterAboutLinksProps) {
  const base = `/${locale}`;

  const { data: pages = [] } = useQuery<PageItem[]>({
    queryKey: ["public", "pages"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/public/pages`
      );
      return res.data.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div>
      <h4 className="mb-4 font-kanit text-caption font-bold uppercase tracking-widest text-white">
        {title}
      </h4>
      <ul className="space-y-3">
        {pages.map((page) => (
          <li key={page.slug}>
            <Link
              href={`${base}/pages/${page.slug}`}
              className="font-sarabun text-label transition-colors hover:text-primary"
            >
              {locale === "th" ? page.title_th : page.title_en}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
