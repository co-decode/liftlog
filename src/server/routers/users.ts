import { z } from "zod";
import { router, procedure } from "../trpc";
import { prisma } from "../prisma";
import bcrypt from "bcrypt"
import { sessionSchemaT } from "@/types/schema-receiving";

export const usersRouter = router({
  checkCreds: procedure
    .input(z.string().email())
    .query(async ({ input }) => {
      return await prisma.user.findUnique({
        where: {
          email: input,
        },
        select: {
          password: true,
          name: true,
          id: true,
        }
      })
    }),
  findAll: procedure
    .input(z.string().email())
    .query(async ({ input }) => {
      const allSessions = await prisma.user.findUnique({
        where: {
          email: input
        },
        select: {
          exerciseSessions: {
            orderBy: { date: 'desc' },
            select: {
              date: true,
              sid: true,
              exercises: {
                select: {
                  id: true,
                  name: true,
                  sets: {
                    orderBy: { setNumber: 'asc' },
                    select: {
                      id: true,
                      setNumber: true, //Either split type defs, or remove sorting, because setNumber is not necessary to return otherwise
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
      return {exerciseSessions:allSessions?.exerciseSessions.map(sess => ({
        ...sess,
        date: sess.date,
        exercises: sess.exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(set => ({
            ...set,
            weight: Number(set.weight)
          }))
        }))
      }))}
    }),
  insertOne: procedure
    .input(
      z.object({
        email: z.string().email(),
        username: z.string().optional(),
        password: z.string().min(5),
      }),
    )
    .mutation(async ({ input }) => {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(input.password, salt)
      return await prisma.user.create({
        data: {
          email: input.email,
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

export const caller = usersRouter.createCaller({})
