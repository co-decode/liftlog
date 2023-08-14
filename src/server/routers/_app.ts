import { procedure, router } from '../trpc';
import { usersRouter } from './users';
import { sessionsRouter } from './sessions';
import { programsRouter } from './programs';
import { z } from 'zod';
import { prisma } from '../prisma';
import { select } from 'd3';

const layoutRouter = router({
  initialise: procedure
    .input(
      z.number().int()
    )
    .query(async ({ input: userId }) => {
      return await prisma.$transaction(async (prisma) => {
        const sessions = await prisma.user.findUnique({
          where: {
            id: userId
          },
          select: {
            exerciseSessions: {
              orderBy: { date: 'desc' },
              select: {
                date: true,
                programId: true,
                programSessionId: true,
                sid: true,
                exercises: {
                  select: {
                    id: true,
                    name: true,
                    sets: {
                      orderBy: { setNumber: 'asc' },
                      select: {
                        id: true,
                        //Either split type defs, or remove sorting, because setNumber is not necessary to return otherwise
                        setNumber: true,
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
        const passwordSet = await prisma.user.findUnique({
          where: {
            id: userId
          },
          select: {
            password: true
          }
        }) ? true : false

        const allSessions = sessions?.exerciseSessions.map(sess => ({
          ...sess,
          date: sess.date,
          exercises: sess.exercises.map(ex => ({
            ...ex,
            sets: ex.sets.map(set => ({
              ...set,
              weight: Number(set.weight)
            }))
          }))
        }))

        const allPrograms = await prisma.program.findMany({
          where: { userId },
          select: {
            programId: true,
            programName: true,
            splitLength: true,
            programSessions: {
              select: {
                id: true,
                splitIndices: true,
                name: true,
                programSets: {
                  select: {
                    id: true,
                    setIndex: true,
                    exerciseIndex: true,
                    exerciseName: true,
                  }
                }
              }
            }
          },
        });
        const currentP = await prisma.currentProgram.findUnique({
          where: { userId },
          select: {
            programId: true,
            startDate: true,
          }
        })
        const programName = allPrograms
          .find(p => p.programId === currentP?.programId)?.programName
        const currentProgram = { ...currentP, programName }
        return { allSessions, passwordSet, allPrograms, currentProgram }
      })
    })
})

export const appRouter = router({
  users: usersRouter,
  sessions: sessionsRouter,
  programs: programsRouter,
  layout: layoutRouter,
})


// export type definition of API
export type AppRouter = typeof appRouter;
