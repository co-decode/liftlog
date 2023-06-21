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
