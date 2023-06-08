import { z } from "zod";

export const setSchema = z.object({
  setNumber: z.number().positive().int().max(10),
  reps: z
    .number({ required_error: "Required!" })
    .positive()
    .int()
    .max(999),
  weight: z.number().multipleOf(0.01).max(9999),
})
export type setSchemaT = z.infer<typeof setSchema>

export const exerciseSchema = z.object({
  name: z.string(),
  sets: z
    .array(setSchema)
})
export type exerciseSchemaT = z.infer<typeof exerciseSchema>

export const sessionSchema = z.object({
  date: z.coerce.date(),
  exercises: z.array(exerciseSchema),
});
export type sessionSchemaT = z.infer<typeof sessionSchema>

/* Used to create One session for the user */
export const userSchema = z.object({
  email: z.string().email(),
  exerciseSessions: sessionSchema,
})
export type userSchemaT = z.infer<typeof userSchema>

/* Used to update a session for the user */
export const updateSetSchema = z.object({
  id: z.number().int().optional(),
  setNumber: z.number().positive().int().max(10),
  reps: z
    .number({ required_error: "Required!" })
    .positive()
    .int()
    .max(999),
  weight: z.number().multipleOf(0.01).max(9999),
})
export type updateSetSchemaT = z.infer<typeof setSchema>

export const updateExerciseSchema = z.object({
  name: z.string(),
  id: z.number().int().optional(),
  sets: z
    .array(updateSetSchema)
})
export type updateExerciseSchemaT = z.infer<typeof exerciseSchema>

export const updateSessionSchema = z.object({
  date: z.coerce.date(),
  sid: z.number().int().optional(),
  exercises: z.array(updateExerciseSchema),
});
export type updateSessionSchemaT = z.infer<typeof sessionSchema>

export const updateSchema = z.object({
  email: z.string().email(),
  exerciseSessions: updateSessionSchema,
})
export type updateSchemaT = z.infer<typeof userSchema>
