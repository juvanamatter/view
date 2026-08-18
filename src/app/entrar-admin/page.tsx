import { AdminLoginForm } from "@/components/auth/admin-login-form";

export default async function EntrarAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <AdminLoginForm from={from} />
    </div>
  );
}
