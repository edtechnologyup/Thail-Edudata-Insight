export default function DatasetDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <section className="border-b border-border-default/60 bg-surface-card px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max space-y-4">
          <div className="h-4 w-48 rounded-radius-sm bg-surface-container" />
          <div className="h-10 w-3/4 max-w-xl rounded-radius-md bg-surface-container" />
          <div className="flex gap-2">
            <div className="h-8 w-24 rounded-radius-full bg-surface-container" />
            <div className="h-8 w-28 rounded-radius-full bg-surface-container" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="h-5 rounded-radius-sm bg-surface-container" />
            <div className="h-5 rounded-radius-sm bg-surface-container" />
            <div className="h-5 rounded-radius-sm bg-surface-container" />
          </div>
          <div className="h-2 max-w-sm rounded-radius-full bg-surface-container" />
        </div>
      </section>
      <section className="bg-surface-page px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max">
          <div className="rounded-radius-lg border border-border-default/80 bg-surface-card p-spacing-6">
            <div className="mb-4 h-6 w-32 rounded-radius-sm bg-surface-container" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded-radius-sm bg-surface-container" />
              <div className="h-4 w-5/6 rounded-radius-sm bg-surface-container" />
            </div>
          </div>
        </div>
      </section>
      <section className="px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max">
          <div className="mb-4 flex gap-4 border-b border-border-default">
            <div className="h-8 w-28 rounded-radius-sm bg-surface-container" />
            <div className="h-8 w-24 rounded-radius-sm bg-surface-container" />
          </div>
          <div className="h-64 rounded-radius-lg bg-surface-container" />
        </div>
      </section>
    </div>
  );
}
