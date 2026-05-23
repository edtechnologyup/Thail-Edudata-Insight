type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const METHOD_STYLES: Record<
  HttpMethod,
  { bg: string; text: string }
> = {
  GET: { bg: "bg-status-published-bg", text: "text-status-published" },
  POST: { bg: "bg-status-draft-bg", text: "text-status-draft" },
  PUT: { bg: "bg-status-warning-bg", text: "text-status-warning" },
  DELETE: { bg: "bg-status-error-bg", text: "text-status-error" },
};

type MethodBadgeProps = {
  method: HttpMethod;
};

export default function MethodBadge({ method }: MethodBadgeProps) {
  const styles = METHOD_STYLES[method];

  return (
    <span
      className={`inline-flex items-center rounded-radius-md px-3 py-1 font-sarabun text-caption font-bold ${styles.bg} ${styles.text}`}
    >
      {method}
    </span>
  );
}
