"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import ScholarshipForm from "@/components/scholarship/ScholarshipForm";
import { useMyScholarship } from "@/hooks/useManageScholarships";

type EditScholarshipPageProps = {
  params: { locale: string; id: string };
};

export default function EditScholarshipPage({ params }: EditScholarshipPageProps) {
  const locale = useLocale();
  const tManage = useTranslations("scholarship.manage");
  const { data, isLoading, isError } = useMyScholarship(params.id);

  if (isLoading) {
    return (
      <p className="font-sarabun text-body-md text-text-muted">
        {tManage("editLoading")}
      </p>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4 text-center">
        <p className="font-sarabun text-body-md text-status-error">
          {tManage("editNotFound")}
        </p>
        <Link
          href={`/${locale}/manage/scholarships`}
          className="inline-flex font-sarabun text-label font-semibold text-primary hover:text-primary-hover"
        >
          {tManage("editBack")}
        </Link>
      </div>
    );
  }

  return (
    <ScholarshipForm
      mode="edit"
      scholarshipId={params.id}
      initialData={data}
    />
  );
}
