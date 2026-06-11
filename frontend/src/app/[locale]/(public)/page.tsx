import AnnouncementBanner from "@/components/common/AnnouncementBanner";
import HeroSearch from "@/components/common/HeroSearch";
import HomeCtaSection from "@/components/home/HomeCtaSection";
import HomeDatasetSectionClient from "@/components/home/HomeDatasetSectionClient";

type HomePageProps = {
  params: { locale: string };
};

export default function HomePage({ params }: HomePageProps) {
  const { locale } = params;

  return (
    <>
      <AnnouncementBanner />
      <HeroSearch />
      <HomeDatasetSectionClient locale={locale} variant="popular" />
      <HomeDatasetSectionClient locale={locale} variant="latest" />
      <HomeCtaSection locale={locale} />
    </>
  );
}
