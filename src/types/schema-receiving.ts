import { z } from "zod";

export const setSchema = z.object({
  id: z.number().int(),
  setNumber: z.number().positive().int().max(10),
  reps: z
    .number({ required_error: "Required!" })
    .positive()
    .int()
    .max(999),
  weight: z.number()
  //weight: z.string().regex(/^\d{1,4}(?:\.\d{1,2})?$/),
})
export type setSchemaT = z.infer<typeof setSchema>

export const exerciseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  sets: z
    .array(setSchema),
})
export type exerciseSchemaT = z.infer<typeof exerciseSchema>

export const sessionSchema = z.object({
  sid: z.number().int(),
  date: z.string(),
  exercises: z.array(exerciseSchema),
});
export type sessionSchemaT = z.infer<typeof sessionSchema>

export const userSchema = z.object({
  email: z.string().email(),
  exerciseSessions: z.array(sessionSchema),
})
export type userSchemaT = z.infer<typeof userSchema>
