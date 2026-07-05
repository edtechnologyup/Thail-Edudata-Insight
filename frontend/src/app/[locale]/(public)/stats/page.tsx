import { getTranslations } from "next-intl/server";
import StatsAnalysisChart from "@/components/dashboard/StatsAnalysisChart";
import StatsChartsSection from "@/components/dashboard/StatsChartsSection";
import StatsPageOverview from "@/components/dashboard/StatsPageOverview";
import TopAgenciesCard from "@/components/dashboard/TopAgenciesCard";
import TopDatasetList from "@/components/dashboard/TopDatasetList";
import TopRatedList from "@/components/dashboard/TopRatedList";

type StatsPageProps = {
  params: { locale: string };
};

export default async function StatsPage(_props: StatsPageProps) {
  const t = await getTranslations("stats");

  return (
    <>
      <section className="border-b border-border-default/60 bg-surface-card px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max">
          <h1 className="font-kanit text-[2rem] font-bold text-primary md:text-[2.5rem]">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl font-sarabun text-body-md text-text-muted">{t("subtitle")}</p>
        </div>
      </section>

      <section className="bg-surface-page px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max space-y-spacing-6">
          <StatsPageOverview />

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <StatsChartsSection />
              <StatsAnalysisChart />
              <TopAgenciesCard />
            </div>
            <div className="flex flex-col gap-6 lg:col-span-1">
              <TopDatasetList />
              <TopRatedList />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
