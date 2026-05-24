"use client";

import { useTranslations } from "next-intl";

export default function AdminDatasetsPage() {
  const t = useTranslations("admin");

  return (
    <div className="mx-auto max-w-container-max pb-24">
      <h1 className="font-kanit text-[28px] font-bold leading-tight text-text-primary">
        {t("datasetsTitle")}
      </h1>
    </div>
  );
}
