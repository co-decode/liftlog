import { z } from "zod";
import { router, procedure } from "../trpc";
import { prisma } from "../prisma";
import { userSchema, updateSchema } from "@/types/schema-sending";

export const sessionsRouter = router({
  findAll: procedure.query(async () => {
    return await prisma.user.findMany({
      //select: allUser,
    });
  }),
  updateOne: procedure // Creates a Session for user
    .input(userSchema)
    .mutation(async ({ input }) => {
      const { email, exerciseSessions: eSess } = input;

      return await prisma.user.update({
        where: { email },
        data: {
          exerciseSessions: {
            create: [
              {
                /* Will manual conversion to Date cause issues? */
                date: new Date(eSess.date),
                exercises: {
                  create: eSess.exercises.map((ex) => {
                    return {
                      name: ex.name,
                      sets: {
                        createMany: { data: ex.sets },
                      },
                    };
                  }),
                },
              },
            ],
          },
        },
      });
    }),
  updateSession: procedure
    .input(
      z.object({
        sid: z.number(),
        date: z.coerce.date().nullable(),
        exercisesToDelete: z.array(z.number()).nullable(), // Exercise IDs
        exercisesToAdd: z
          .array(
            z.object({
              exerciseName: z.string(),
              sessionId: z.number(),
              sets: z.array(
                z.object({
                  reps: z.number().int(),
                  weight: z.number(),
                  setNumber: z.number().int(),
                })
              ),
            })
          )
          .nullable(),
        exercisesToUpdate: z
          .array(
            z.object({
              setsToRemove: z.array(z.number().int()).nullable(),
              setsToAdd: z
                .array(
                  z.object({
                    reps: z.number().int(),
                    weight: z.number(),
                    setNumber: z.number().int(),
                    exerciseId: z.number().int(),
                  })
                )
                .nullable(),
              setsToUpdate: z
                .array(
                  z.object({
                    id: z.number().int(),
                    data: z.object({
                      reps: z.number().int().nullable(),
                      weight: z.number().nullable(),
                    }),
                  })
                )
                .nullable(),
            })
          )
          .nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const {
        date,
        sid,
        exercisesToAdd,
        exercisesToDelete,
        exercisesToUpdate,
      } = input;
      return await prisma.$transaction(async (prisma) => {
        // Update date if changed
        if (date) {
          await prisma.exerciseSession.update({
            where: { sid },
            data: { date },
          });
        }
        // Delete removed exercises
        if (exercisesToDelete)
          await prisma.exercise.deleteMany({
            where: { id: { in: exercisesToDelete } },
          });
        // Create new exercises
        if (exercisesToAdd)
          for (const exercise of exercisesToAdd) {
            await prisma.exercise.create({
              data: {
                name: exercise.exerciseName,
                sessionId: exercise.sessionId,
                sets: {
                  createMany: { data: exercise.sets },
                },
              },
            });
          }
        // Update existing and changed exercises - Nothing to update outside of sets.
        if (exercisesToUpdate)
          for (const exercise of exercisesToUpdate) {
            // // Delete removed sets
            if (exercise.setsToRemove?.length) {
              await prisma.set.deleteMany({
                where: { id: { in: exercise.setsToRemove } },
              });
            }
            // // Create new sets
            if (exercise.setsToAdd?.length) {
              // setsToAdd = { setNumber, reps, weight, exerciseId }[]
              await prisma.set.createMany({
                data: exercise.setsToAdd,
              });
            }
            // // Update existing and changed sets
            if (exercise.setsToUpdate?.length) {
              for (const set of exercise.setsToUpdate) {
                const setData: Partial<{ reps: number; weight: number }> = {};
                if (set.data.reps) setData.reps = set.data.reps;
                if (set.data.weight) setData.weight = set.data.weight;
                await prisma.set.update({
                  where: { id: set.id },
                  data: setData,
                });
              }
            }
          }

        const result = await prisma.exerciseSession.findUnique({
          where: { sid },
          select: {
            sid: true,
            date: true,
            exercises: {
              select: {
                id: true,
                name: true,
                sets: {
                  select: {
                    id: true,
                    setNumber: true,
                    reps: true,
                    weight: true,
                  },
                },
              },
            },
          },
        });

        return result
          ? {
            ...result,
            exercises: result.exercises.map(ex => ({
              ...ex,
              sets: ex.sets.map(set => ({
                ...set,
                weight: Number(set.weight)
              }))
            }))
          }
          : null
      });
    }),
  deleteAll: procedure
    .input(
      z.object({
        ids: z.number().array(),
      })
    )
    .mutation(async ({ input }) => {
      const { ids } = input;

      return await prisma.user.deleteMany({
        where: {
          id: { in: ids },
        },
      });
    }),
});
/*
({
        where: {
          sid: eSess.sid
        },
        data: {
          date: eSess.date,
          exercises: {
            deleteMany: {
              sessionId: eSess.sid,
              NOT: eSess.exercises.map(({ id }) => ({ id })),
            },
            upsert: eSess.exercises.map(ex => ({
              where: { id: ex.id },
              create: {
                ...ex,
                sets: {
                  create: ex.sets
                }
              },
              update: {
                ...ex,
                sets: {
                  deleteMany: {
                    id: ex.id,
                    NOT: ex.sets.map(({ id }) => ({ id })),
                  },
                  upsert: ex.sets.map(set => ({
                    where: { id: set.id },
                    create: set,
                    update: set,
                  }))
                }
              }
            }))
          }
        }
      })
  * */
