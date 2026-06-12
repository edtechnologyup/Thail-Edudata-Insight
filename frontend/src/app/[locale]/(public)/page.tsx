import AnnouncementBanner from "@/components/common/AnnouncementBanner";
import HeroSearch from "@/components/common/HeroSearch";
import HomeCtaSection from "@/components/home/HomeCtaSection";
import HomeDatasetSectionClient from "@/components/home/HomeDatasetSectionClient";
import HomeScholarshipSectionClient from "@/components/home/HomeScholarshipSectionClient";

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
      <HomeScholarshipSectionClient locale={locale} />
      <HomeCtaSection locale={locale} />
    </>
  );
}
