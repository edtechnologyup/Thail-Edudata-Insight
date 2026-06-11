import { getTranslations } from "next-intl/server";

type ScholarshipPageProps = {
  params: { locale: string };
};

export default async function ScholarshipPage(_props: ScholarshipPageProps) {
  const t = await getTranslations("scholarship");

  const placeholderKeys = ["gsl", "eef", "government", "university"] as const;

  return (
    <>
      <section className="border-b border-border-default/60 bg-surface-card px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max">
          <h1 className="font-kanit text-heading-2 text-text-primary md:text-heading-1">
            {t("title")}
          </h1>
          <p className="mt-1 font-sarabun text-label text-text-muted">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="bg-surface-page px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max space-y-spacing-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {placeholderKeys.map((key) => (
              <div
                key={key}
                className="rounded-radius-lg border border-border-default/80 bg-surface-card p-6 shadow-level-1"
              >
                <h2 className="font-kanit text-heading-3 font-semibold text-text-primary">
                  {t(`categories.${key}`)}
                </h2>
                <p className="mt-2 font-sarabun text-body-sm text-text-muted">
                  {t("comingSoon")}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center font-sarabun text-caption text-text-muted">
            {t("underConstruction")}
          </p>
        </div>
      </section>
    </>
  );
}
