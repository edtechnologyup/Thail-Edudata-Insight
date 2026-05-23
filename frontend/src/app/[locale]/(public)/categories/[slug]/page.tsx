import { notFound } from "next/navigation";
import { Suspense } from "react";
import CategoryPageContent from "@/components/category/CategoryPageContent";
import { findCategoryPage } from "@/data/mockData";

type CategoryPageProps = {
  params: { locale: string; slug: string };
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const pageData = findCategoryPage(params.slug);

  if (!pageData) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-container-max px-4 py-12 text-center font-sarabun text-body-md text-text-muted">
          Loading...
        </div>
      }
    >
      <CategoryPageContent pageData={pageData} />
    </Suspense>
  );
}
