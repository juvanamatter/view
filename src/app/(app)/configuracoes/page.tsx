import { getAppSettings } from "@/lib/queries/app-settings";
import { AppSettingsForm } from "@/components/settings/app-settings-form";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const settings = await getAppSettings();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Defina os padrões aplicados a toda sala nova.
        </p>
      </div>
      <AppSettingsForm settings={settings} />
    </div>
  );
}
