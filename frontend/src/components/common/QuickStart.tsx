import type { ApiQuickStartStep } from "@/data/apiDocsContent";
import { getLocalizedText } from "@/data/apiDocsContent";
import CodeBlock from "@/components/common/CodeBlock";

type QuickStartProps = {
  steps: ApiQuickStartStep[];
  locale: string;
  title: string;
  description: string;
};

export default function QuickStart({
  steps,
  locale,
  title,
  description,
}: QuickStartProps) {
  return (
    <section id="quick-start" className="scroll-mt-28">
      <div className="rounded-radius-xl border border-primary/20 bg-surface-card p-5 shadow-level-1 md:p-6">
        <div className="mb-6 border-b border-border-default pb-5">
          <p className="mb-2 font-sarabun text-caption font-semibold uppercase tracking-[0.2em] text-primary-dark">
            Thai EduData Insight
          </p>
          <h2 className="font-kanit text-heading-2 text-text-primary">
            {title}
          </h2>
          <p className="mt-2 max-w-3xl font-sarabun text-body-md text-text-secondary">
            {description}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {steps.map((step, index) => {
            const stepTitle = getLocalizedText(step.title, locale);
            const stepDescription = getLocalizedText(step.description, locale);

            return (
              <div
                key={step.id}
                className="flex flex-col rounded-radius-lg border border-border-default bg-surface-page p-4"
              >
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-radius-full bg-primary font-kanit text-label font-bold text-surface-card">
                  {index + 1}
                </span>
                <h3 className="font-kanit text-heading-3-mobile text-text-primary">
                  {stepTitle}
                </h3>
                <p className="mt-2 flex-1 font-sarabun text-body-sm text-text-secondary">
                  {stepDescription}
                </p>
                {step.code && (
                  <div className="mt-4">
                    <CodeBlock code={step.code} label="EXAMPLE" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
