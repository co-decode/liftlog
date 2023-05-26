import { date, z } from "zod";
import { Prisma } from "@prisma/client";
import { router, procedure } from "../trpc";
import { prisma } from "../prisma";

const SetSchema = z.object({
  setNumber: z.number(),
  reps: z.number(),
  weight: z.number(),
});

const ExerciseSchema = z.object({
  exerciseName: z.string(),
  sets: z.array(SetSchema),
});

const ExerciseSessionSchema = z.object({
  date: z.coerce.date(),
  exercises: z.array(ExerciseSchema),
});

export const UserSchema = z.object({
  email: z.string().email(),
  exerciseSessions: ExerciseSessionSchema,
})

export const sessionsRouter = router({
  findAll: procedure
    .query(async () => {
      return await prisma.user.findMany({
        //select: allUser,
      });
    }),
  updateOne: procedure
    .input(UserSchema)
    .mutation(async ({ input }) => {
      const { email, exerciseSessions: eSess } = input;

      return await prisma.user.update({
        where: { email },
        data: {
          exerciseSessions: {
            create: [
              {
                date: eSess.date,
                exercises: {
                  create: eSess.exercises.map(ex => {
                    return ({
                      name: ex.exerciseName,
                      sets: {
                        createMany: { data: ex.sets },
                      }
                    })
                  })
                }
              }
            ]
          }
        },
      });
    }),
  deleteAll: procedure
    .input(
      z.object({
        ids: z.number().array(),
      }),
    )
    .mutation(async ({ input }) => {
      const { ids } = input;

      return await prisma.user.deleteMany({
        where: {
          id: { in: ids },
        },
      });
    }),
})
