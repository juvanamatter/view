import { LoginForm } from "@/components/auth/login-form";
import { getAppSettings } from "@/lib/queries/app-settings";

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const [{ from }, settings] = await Promise.all([searchParams, getAppSettings()]);

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <LoginForm from={from} logoUrl={settings.logoUrl ?? "/matter-logo.png"} brandName={settings.brandName} />
    </div>
  );
}
