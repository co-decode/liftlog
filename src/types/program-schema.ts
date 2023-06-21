import { z } from "zod";

export const programSetSchema = z.object({
  setIndex: z.number().max(20).int(),
  exerciseIndex: z.number().max(10).int(),
  exerciseName: z.string().max(24).nonempty(),
})

export const programSessionSchema = z.object({
  splitIndices: z.array(z.number().max(50).int()).nonempty(),
  name: z.string().max(16).nonempty(),
  programSets: z.array(programSetSchema).nonempty()
})

export const programSchema = z.object({
  userId: z.number().int(),
  program: z.object({
    programName: z.string().max(16).nonempty(),
    splitLength: z.number().min(1).max(50).int(),
    programSessions: z.array(programSessionSchema).nonempty()
  })
})

