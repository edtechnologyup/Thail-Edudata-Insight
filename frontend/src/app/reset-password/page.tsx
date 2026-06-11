import { redirect } from "next/navigation";

export default function ResetPasswordRedirectPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const query = searchParams.token
    ? `?token=${encodeURIComponent(searchParams.token)}`
    : "";

  redirect(`/th/reset-password${query}`);
}
