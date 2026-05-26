import DatasetDetailPageClient from "@/components/dataset/DatasetDetailPageClient";

type DatasetDetailPageProps = {
  params: { locale: string; id: string };
};

export default function DatasetDetailPage({ params }: DatasetDetailPageProps) {
  return <DatasetDetailPageClient id={params.id} locale={params.locale} />;
}
