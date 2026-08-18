import { z } from "zod";

export const roomSchema = z.object({
  name: z.string().min(1, "Informe um nome para a sala."),
  slug: z
    .string()
    .min(3, "O link precisa ter pelo menos 3 caracteres.")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen."),
  hostName: z.string().min(1, "Informe o nome do anfitrião."),
  password: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v ? v : null)),
  maxParticipants: z.coerce.number().int().min(2, "Mínimo de 2 participantes.").max(100, "Máximo de 100 participantes."),
  muteOnEntry: z.boolean(),
  cameraOnEntry: z.boolean(),
  allowScreenShare: z.boolean(),
  waitingRoom: z.boolean(),
  isActive: z.boolean(),
  isTeamRoom: z.boolean(),
});

export type RoomInput = z.infer<typeof roomSchema>;
