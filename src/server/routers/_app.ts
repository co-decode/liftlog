import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { router, procedure } from '../trpc';
import { prisma } from '../prisma';

const allUser = Prisma.validator<Prisma.UserSelect>()({
    name: true,
    id: true,
    email: false,
    emailVerified: false,
});

export const appRouter = router ({
    findAll: procedure
    .query(async () => {
            return await prisma.user.findMany({
                select: allUser,
            });
    }),
    insertOne: procedure
    .input(
        z.object({
            username: z.string(),
            password: z.string(),
        }),
    )
    .mutation(async ({input}) => {
        return await prisma.user.create({
            data: { 
                name: input.username,
            },
        });
    }),
    updateOne: procedure
    .input (
        z.object({
            id: z.number(),
            username: z.string(),
            password: z.string(),
        }),
    )
    .mutation(async ({input}) => {
        const { id, ...rest } = input;
        return await prisma.user.update({
            where: { id },
            data: { ...rest },
        });
    }),
    deleteAll: procedure
    .input (
        z.object({
            ids: z.number().array(),
        }),
    )
    .mutation(async ({input}) => {
        const { ids } = input;

        return await prisma.user.deleteMany({
            where: {
                id: { in: ids },
            },
        });
    }),
})

// export type definition of API
export type AppRouter = typeof appRouter;
