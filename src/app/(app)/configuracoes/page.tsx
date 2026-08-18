import { getAppSettings } from "@/lib/queries/app-settings";
import { AppSettingsForm } from "@/components/settings/app-settings-form";
import { BrandSettingsForm } from "@/components/settings/brand-settings-form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const settings = await getAppSettings();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Padrões de sala e a identidade visual do produto.
        </p>
      </div>

      <Tabs defaultValue="salas">
        <TabsList className="justify-start gap-1 bg-transparent p-0">
          <TabsTrigger value="salas" className="data-active:bg-white/10">
            Salas
          </TabsTrigger>
          <TabsTrigger value="marca" className="data-active:bg-white/10">
            Marca e visual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="salas" className="mt-4">
          <AppSettingsForm settings={settings} />
        </TabsContent>

        <TabsContent value="marca" className="mt-4">
          <BrandSettingsForm settings={settings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
