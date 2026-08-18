import { z } from "zod";

export const appSettingsSchema = z.object({
  defaultMaxParticipants: z.coerce.number().int().min(2).max(100),
  defaultMuteOnEntry: z.boolean(),
  defaultCameraOnEntry: z.boolean(),
  defaultAllowScreenShare: z.boolean(),
  defaultWaitingRoom: z.boolean(),
});

export type AppSettingsInput = z.infer<typeof appSettingsSchema>;

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida.");

export const brandSettingsSchema = z.object({
  brandName: z.string().min(1, "Informe um nome."),
  logoUrl: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v ? v : null)),
  primaryColor: hexColor,
  salasColor: hexColor,
  usuariosColor: hexColor,
  configuracoesColor: hexColor,
});

export type BrandSettingsInput = z.infer<typeof brandSettingsSchema>;
