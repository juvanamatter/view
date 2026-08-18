import { z } from "zod";

export const joinSchema = z.object({
  slug: z.string().min(1),
  participantName: z.string().min(1, "Informe seu nome."),
  password: z.string().optional().or(z.literal("")),
});

export type JoinInput = z.infer<typeof joinSchema>;
