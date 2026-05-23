import { Suspense } from "react";
import SearchPageContent from "@/components/search/SearchPageContent";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-container-max px-4 py-12 text-center font-sarabun text-body-md text-text-muted">
          Loading...
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
