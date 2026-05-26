import { Suspense } from "react";
import CategorySlugPageClient from "@/components/category/CategorySlugPageClient";

type CategoryPageProps = {
  params: { locale: string; slug: string };
};

export default function CategoryPage({ params }: CategoryPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-container-max px-4 py-12 text-center font-sarabun text-body-md text-text-muted">
          Loading...
        </div>
      }
    >
      <CategorySlugPageClient slug={params.slug} />
    </Suspense>
  );
}
