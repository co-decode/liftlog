import { z } from "zod";
import { Prisma } from "@prisma/client";
import { router, procedure } from "../trpc";
import { prisma } from "../prisma";
import bcrypt from "bcrypt"

const setValid = Prisma.validator<Prisma.SetSelect>()({
  setNumber:true,
  reps:true,
  weight:true,
})

const exValid = Prisma.validator<Prisma.ExerciseSelect>()({
  name:true,
  sets: {
    select: setValid
  },
})

const exSessValid = Prisma.validator<Prisma.ExerciseSessionSelect>()({
  sid:true,
  date:true,
  exercises: {
    select: exValid
  },
  userId: false
})

const userExerciseSessions = Prisma.validator<Prisma.UserSelect>()({
  name: false,
  id: false,
  email: false,
  emailVerified: false,
  exerciseSessions: {
    select: exSessValid
  }
});

export const usersRouter = router({
  findAll: procedure
    .input(z.string().email())
    .query(async ({ input }) => {
      return await prisma.user.findUnique({
        where: {
          email: input
        },
        select: {
          exerciseSessions: {
            orderBy: { date: 'desc' },
            select: {
              date: true,
              exercises: {
                select: {
                  name: true,
                  sets: {
                    orderBy: { setNumber: 'asc' },
                    select: {
                      reps: true,
                      weight: true,
                    }
                  }
                }
              }
            }
          }
        },
      });
    }),
  insertOne: procedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(input.password, salt)
      return await prisma.user.create({
        data: {
          name: input.username,
          password: hashedPassword,
        },
      });
    }),
  updateOne: procedure
    .input(
      z.object({
        id: z.number(),
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      return await prisma.user.update({
        where: { id },
        data: { ...rest },
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
