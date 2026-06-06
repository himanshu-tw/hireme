import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['COMPANY', 'DEVELOPER'])
})

export type RegisterSchema = z.infer<typeof registerSchema>

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export type SignInSchema = z.infer<typeof signInSchema>