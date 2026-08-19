import { z } from "zod";

export const joinSchema = z.object({
  slug: z.string().min(1),
  password: z.string().optional().or(z.literal("")),
});

export type JoinInput = z.infer<typeof joinSchema>;
