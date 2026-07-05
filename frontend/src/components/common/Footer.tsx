import Link from "next/link";
import { getTranslations } from "next-intl/server";
import FooterAboutLinks from "@/components/common/FooterAboutLinks";

type FooterProps = {
  locale: string;
};

export default async function Footer({ locale }: FooterProps) {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();
  const base = `/${locale}`;

  const exploreLinks = [
    { href: `${base}/search`, label: t("catalog") },
    { href: `${base}/stats`, label: t("dashboard") },
    { href: `${base}/api-docs`, label: t("apiDocs") },
  ];

  return (
    <footer className="border-t border-white/10 bg-surface-navy pt-12 text-white/80 md:pt-16">
      <div className="mx-auto grid max-w-container-max grid-cols-1 gap-8 px-4 pb-12 md:grid-cols-3 md:gap-10 md:px-10 md:pb-16">
        <div>
          <h3 className="mb-4 font-kanit text-heading-2-mobile font-bold text-white md:text-heading-2">
            Thai EduData Insight
          </h3>
          <p className="mb-6 font-sarabun text-label leading-relaxed">
            {t("tagline")}
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-kanit text-caption font-bold uppercase tracking-widest text-white">
            {t("exploreTitle")}
          </h4>
          <ul className="space-y-3">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="font-sarabun text-label transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <FooterAboutLinks locale={locale} title={t("aboutTitle")} />
      </div>

      <div className="mx-auto flex max-w-container-max flex-col items-center justify-between gap-4 border-t border-white/10 px-4 py-6 font-sarabun text-caption md:flex-row md:px-10 md:py-8">
        <p>{t("copyright", { year })}</p>
        <p className="flex items-center gap-2 text-center">
          <svg
            className="h-3.5 w-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
          {t("poweredBy")}
        </p>
      </div>
    </footer>
  );
}
