import { z } from "zod"

export const userSchema = z.object({
  nombre: z.string().min(2, { message: "Name must be at least 2 characters." }),
  apellido: z.string().min(2, { message: "last name must be at least 2 characters." }),
  correo: z.email({ message: "Invalid email address." }),
  edad: z.number().int().gte(0, { message: "You must be at least 0." }),
});

export const validateName = z.object({
  nombre: z.string(), //.min(2, { message: "Name must be at least 2 characters." }),
});

// Infer a TypeScript type from the schema for type safety
export type UserData = z.infer<typeof userSchema>;