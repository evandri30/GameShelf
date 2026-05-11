import { z } from "zod"
import { LoginSchema, RegisterSchema } from "@/schemas/auth.schema"


export type loginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;