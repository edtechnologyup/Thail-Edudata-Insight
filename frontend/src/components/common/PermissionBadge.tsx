import type { ApiPermission } from "@/data/apiDocsContent";

const PERMISSION_STYLES: Record<ApiPermission, string> = {
  Public: "border-primary/30 bg-primary-light text-primary-dark",
  Agency: "border-primary/30 bg-primary-light text-primary-dark",
  Admin: "border-primary/30 bg-primary-light text-primary-dark",
};

type PermissionBadgeProps = {
  permission: ApiPermission;
};

export default function PermissionBadge({ permission }: PermissionBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-radius-full border px-3 py-1 font-sarabun text-caption font-semibold ${PERMISSION_STYLES[permission]}`}
    >
      {permission}
    </span>
  );
}
