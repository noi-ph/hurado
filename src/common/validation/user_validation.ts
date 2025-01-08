import { z } from "zod";

export const zUserBase = z.object({
  email: z.string().email(),
  username: z.string()
    .regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric or underscore")
    .min(6),
  password: z.string().min(8),
  role: z.enum(["admin", "user"]),
});

export const zUserRegister = zUserBase.pick({
  email: true,
  username: true,
  password: true,
});

export const zAdminCreate = zUserBase;
export const zAdminUpdate = zUserBase.pick({
  email: true,
  username: true,
  role: true,
});

export type UserDTO = z.infer<typeof zUserRegister>;
