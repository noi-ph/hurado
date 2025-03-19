import { z } from "zod";

const zUserBase = z.object({
  email: z.string().email(),
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric or underscore")
    .min(4),
  password: z.string().min(8),
  confirmPassword: z.string(),
  role: z.enum(["admin", "user"]),
});

export const zUserLogin = z.object({
  username: z.string().nonempty(),
  password: z.string().nonempty(),
});

export const zUserRegister = zUserBase
  .pick({
    email: true,
    username: true,
    password: true,
    confirmPassword: true,
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export const zAdminCreate = zUserBase.pick({
  email: true,
  username: true,
  password: true,
  role: true,
});

export const zAdminUpdate = zUserBase.pick({
  email: true,
  username: true,
  role: true,
});

export const zUserForgotPassword = zUserBase.pick({
  username: true,
});

export const zUserResetPassword = zUserBase
  .pick({
    password: true,
    confirmPassword: true,
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export const zUserResetPasswordServer = z.object({
  token: z.string().min(8),
  password: z.string().min(8),
});

export type UserDTO = z.infer<typeof zUserRegister>;
