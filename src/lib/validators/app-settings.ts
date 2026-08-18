import { z } from "zod";

export const appSettingsSchema = z.object({
  brandName: z.string().min(1, "Informe um nome."),
  defaultMaxParticipants: z.coerce.number().int().min(2).max(100),
  defaultMuteOnEntry: z.boolean(),
  defaultCameraOnEntry: z.boolean(),
  defaultAllowScreenShare: z.boolean(),
  defaultWaitingRoom: z.boolean(),
});

export type AppSettingsInput = z.infer<typeof appSettingsSchema>;
