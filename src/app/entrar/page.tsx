import { LoginForm } from "@/components/auth/login-form";

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <LoginForm from={from} />
    </div>
  );
}
