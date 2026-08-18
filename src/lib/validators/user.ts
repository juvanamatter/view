import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Informe o nome."),
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  password: z
    .string()
    .min(6, "A senha precisa ter pelo menos 6 caracteres.")
    .optional()
    .or(z.literal("")),
  role: z.enum(["ADMIN", "USER"]),
  jobTitle: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  photoUrl: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v ? v : null)),
  photoPositionX: z.coerce.number().min(0).max(100),
  photoPositionY: z.coerce.number().min(0).max(100),
  photoZoom: z.coerce.number().min(1).max(3),
});

export type UserInput = z.infer<typeof userSchema>;

export const loginSchema = z.object({
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
  remember: z.boolean(),
});
