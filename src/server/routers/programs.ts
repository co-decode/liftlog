import { z } from "zod";
import { router, procedure } from "../trpc";
import { prisma } from "../prisma";
import { programSchema, programSessionSchema, programSetSchema } from "@/types/program-schema";

export const programsRouter = router({
  findPrograms: procedure
    .input(
      z.number().int()
    )
    .query(async ({ input: userId }) => {
      // Do I need to modify any of the data before sending to client?
      // const result = ...findMany, etc. etc.
      return await prisma.program.findMany({
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
    }),
  createProgram: procedure
    .input(programSchema)
    .mutation(async ({ input }) => {
      const { userId, program } = input
      return await prisma.$transaction(async (prisma) => {
        const getProgramId = await prisma.program.create({
          data: {
            userId,
            programName: program.programName,
            splitLength: program.splitLength,
          },
          select: {
            programId: true
          }
        })

        return await prisma.program.update({
          where: { programId: getProgramId.programId },
          data: {
            programSessions: {
              create: program.programSessions.map((sess) => ({
                name: sess.name,
                splitIndices: {
                  createMany: {
                    data: sess.splitIndices.map(sInd => ({
                      programId: getProgramId.programId,
                      index: sInd,
                    }))
                  }
                },
                programSets: {
                  createMany: {
                    data: sess.programSets
                  }
                }
              }))
            }
          },
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
          }
        })
      })
    }),
  updateProgram: procedure
    .input(z.object({
      programId: z.number().int(),
      programName: z.string().nullable(),
      splitLength: z.number().int().nullable(),
      sessionsToDelete: z.array(z.number()).nullable(), //programSession Ids
      sessionsToAdd: z.array(z.object({
        splitIndices: z.array(z.number().max(50).int()).nonempty(),
        name: z.string().max(16).nonempty(),
        programSets: z.array(programSetSchema).nonempty()
      })
      ).nullable(), // Needs a programId
      indicesToDelete: z.array(z.number().int()).nullable(), // id
      indicesToAdd: z.array(z.object({
        sessionId: z.number().int(),
        index: z.number().int(),
      })).nullable(),
      indicesToUpdate: z.array(z.object({
        indexId: z.number().int(),
        index: z.number().int()
      })).nullable(),
      sessionsToUpdate: z.array(z.object({
        programSessionId: z.number().int(),
        name: z.string().nullable(),
        exercisesToDelete: z.array(z.number().int()).nullable(),
        exercisesToAdd: z.array(z.object({
          setIndex: z.number().max(20).int(),
          exerciseIndex: z.number().max(10).int(),
          exerciseName: z.string().max(24).nonempty()
        })).nullable(), // Needs a programSessionId
        exercisesToUpdate: z.array(z.object({
          id: z.number().int(),
          setIndex: z.number().max(20).int(),
          exerciseIndex: z.number().max(10).int(),
          exerciseName: z.string().max(24).nonempty(),
        })).nullable(),
      }))
    }))
    .mutation(async ({ input }) => {
      const {
        programId,
        programName,
        splitLength,
        indicesToDelete,
        indicesToAdd,
        indicesToUpdate,
        sessionsToDelete,
        sessionsToAdd,
        sessionsToUpdate
      } = input
      const programUpdateData: Partial<{ programName: string, splitLength: number }> = {}
      if (programName !== null) programUpdateData.programName = programName
      if (splitLength !== null) programUpdateData.splitLength = splitLength

      return await prisma.$transaction(async (prisma) => {
        // Update Program Name and/or Split Length if necessary
        if (Object.keys(programUpdateData).length)
          await prisma.program.update({
            where: { programId },
            data: programUpdateData
          })
        // Delete Removed Sessions
        if (sessionsToDelete)
          await prisma.programSession.deleteMany({
            where: { id: { in: sessionsToDelete } },
          })
        // Create New Sessions
        if (sessionsToAdd)
          for (const sess of sessionsToAdd) {
            await prisma.programSession.create({
              data: {
                programId,
                name: sess.name,
                splitIndices: {
                  createMany: {
                    data: sess.splitIndices.map(index => ({
                      index,
                      programId
                    }))
                  }
                },
                programSets: {
                  createMany: {
                    data: sess.programSets.map(set => ({
                      ...set
                    }))
                  }
                }
              }
            })
          }
        // Delete removed splitIndices
        if (indicesToDelete)
          await prisma.splitIndex.deleteMany({
            where: { id: { in: indicesToDelete } }
          })
        // Create new splitIndices
        if (indicesToAdd)
          await prisma.splitIndex.createMany({
            data: indicesToAdd.map(index => ({
              index: index.index,
              programId,
              programSessionId: index.sessionId
            }))
          })
        // Update existing and changed indices
          // Unnecessary?
        if (indicesToUpdate)
          for (const index of indicesToUpdate) {
            await prisma.splitIndex.update({
              where: { id: index.indexId },
              data: { index: index.index }
            })
          }
        // Update existing and changed sessions
        if (sessionsToUpdate)
          for (const sess of sessionsToUpdate) {
            // Update sessionName if necessary
            if (sess.name)
              await prisma.programSession.update({
                where: { id: sess.programSessionId },
                data: { name: sess.name }
              })
            // Delete removed exercises
            if (sess.exercisesToDelete)
              await prisma.programSet.deleteMany({
                where: { id: { in: sess.exercisesToDelete } }
              })
            // Create new exercises
            if (sess.exercisesToAdd)
              await prisma.programSet.createMany({
                data: sess.exercisesToAdd.map(ex => ({ ...ex, programSessionId: sess.programSessionId }))
              })
            // Update existing and changed sets
            if (sess.exercisesToUpdate)
              for (const ex of sess.exercisesToUpdate) {
                const exData: Partial<{ exerciseName: string, exerciseIndex: number, setIndex: number }> = {}
                if (ex.exerciseName) exData.exerciseName = ex.exerciseName
                if (ex.setIndex) exData.setIndex = ex.setIndex
                if (ex.exerciseIndex) exData.exerciseIndex = ex.exerciseIndex
                await prisma.programSet.update({
                  where: { id: ex.id },
                  data: exData,
                })
              }
          }
        return await prisma.program.findUnique({
          where: { programId },
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
          }
        })
      })
    }),
  // deleteAll: procedure
  //   .input(
  //   )
  //   .mutation(async ({ input }) => {
  //   }),
});
