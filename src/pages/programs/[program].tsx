import { useAuth } from "@/components/auth-and-context";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { BreakdownStates } from "../sessions/[session]";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/utils/trpc";
import { inferProcedureInput, inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "@/server/routers/_app";
import Layout from "@/components/authenticated-layout"
import { programsConfig } from "@/config/programs-config";
import { ProgramForm, SessionForm, programSchema } from "@/components/programs/add-and-edit";
import { DeletionAlert, NavigationAlert } from "@/components/sessions/add-and-edit";
import { z } from "zod";

const { footerItems } = programsConfig;

//const sessionSchema = z.object({
//  sessId: z.number().int().nullable(),
//  name: z.string().max(16).nonempty(),
//  programSets: z
//    .array(
//      z.object({
//        sets: z
//          .array(
//            z.object({
//              setId: z.number().int(),
//              exerciseName: z.string().max(16).nonempty(),
//            })
//          )
//          .nonempty(),
//      })
//    )
//    .nonempty(),
//});
//
//const programSchema = z.object({
//  programId: z.number().int(),
//  programName: z.string().max(16).nonempty(),
//  splitLength: z.number().min(1).max(14).int(),
//  splitIndices: z
//    .array(
//      z.object({
//        splitId: z.number().int(),
//        splitIndex: z.number().min(0).max(13).int(),
//        sessionIndex: z.number().min(0).max(13).int(),
//      })
//    )
//    .nonempty(),
//  programSessions: z.array(sessionSchema).nonempty(),
//});

type Program = z.infer<typeof programSchema>

export default function ProgramBreakdown() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { programs, setPrograms } = useAuth();
  const [page, setPage] = useState<number | undefined>();
  const [warning, setWarning] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [edit, setEdit] = useState<BreakdownStates>("BREAKDOWN");

  const program = useMemo(() => {
    setLoading(true)
    console.log('query: ', router.query.program)
    if (programs) {
      const prog = programs.find(
        (prog) => 'name-' + prog.programName == router.query.program
      );
      if (!prog) return;
      const splitIndices = prog.programSessions.flatMap((sess, sessInd) =>
        sess.splitIndices.map(obj => ({
          splitId: obj.id,
          splitIndex: obj.index,
          sessionIndex: sessInd
        }))) as Program["splitIndices"]

      const convertedProg: Program = {
        ...prog,
        splitIndices,
        programSessions: prog.programSessions.map(sess => {
          const programSets: { sets: { setId: number, exerciseName: string }[] }[] = []
          sess.programSets.forEach(set => {
            if (!programSets[set.setIndex])
              programSets[set.setIndex] = { sets: [] }
            programSets[set.setIndex].sets[set.exerciseIndex] = {
              setId: set.id,
              exerciseName: set.exerciseName
            }
          })
          return ({
            sessId: sess.id,
            name: sess.name,
            programSets,
          })
        }) as Program["programSessions"]
      }

      console.log("conversion: ", convertedProg)
      setLoading(false)
      return convertedProg;

    }
  }, [programs, router.query.program]);

  const form = useForm<Program>({
    resolver: zodResolver(programSchema),
    values: program,
  });

  const programSessionsArray = useFieldArray({
    control: form.control,
    name: `programSessions`,
  });

  const splitIndicesArray = useFieldArray({
    control: form.control,
    name: `splitIndices`,
  });

  useEffect(() => {
    console.log(form.formState.errors)
  }, [form.formState.errors]
  )

  const updateProgram = trpc.programs.updateProgram.useMutation({
    onSuccess() {
      console.log("Success!");
    },
    //onError()
  });

  const deleteProgram = trpc.programs.deleteProgram.useMutation({
    onSuccess() {
      console.log("Successfully deleted!");
    }
  })

  const onDelete = async() => {
    if (!program?.programId || !programs || !setPrograms) return;
    setLoading(true)
    try {
      await deleteProgram.mutateAsync(program?.programId)
      setPrograms(programs.filter(p => p.programId !== program.programId))
      router.push("/programs")
      setLoading(false)
    } catch (error) {
      console.error(error, "deleteProgram call failed")
      setLoading(false)
    }
  }

  const onSubmit: SubmitHandler<Program> = async (
    values
  ) => {
    setLoading(true);
    type Input = inferProcedureInput<AppRouter["programs"]["updateProgram"]>;
    if (!session || !session.user || !session.user.email || !program) return;
    // Changes in Name or splitLength 
    const programName =
      program.programName === values.programName ? null : values.programName
    const splitLength =
      program.splitLength === values.splitLength ? null : values.splitLength
    // Sessions to Delete
    const editedSessions = new Set(values.programSessions.map(sess => sess.sessId))
    const toDelete = []
    const toCheck = []
    for (const sess of program.programSessions)
      if (!editedSessions.has(sess.sessId)) toDelete.push(sess.sessId as number)
      else if (sess.sessId !== undefined) {
        toCheck.push(sess.sessId)
      }
    const sessionsToDelete = toDelete.length
      ? toDelete
      : null
    // Sessions to Add
    interface Set {
      setIndex: number
      exerciseIndex: number
      exerciseName: string
    }
    const toAdd = values.programSessions.reduce((
      a: { name: string, programSets: [Set, ...Set[]], splitIndices: [number, ...number[]] }[],
      sess,
      sessInd
    ) => {
      if (sess.sessId !== undefined) return a
      const splitIndices =
        values.splitIndices.reduce((a: number[], v) => {
          if (v.sessionIndex === sessInd) return [...a, v.splitIndex]
          else return a
        }, []) as [number, ...number[]]
      const programSets =
        sess.programSets.flatMap((set, setIndex) =>
          set.sets.map((ex, exerciseIndex) => ({
            setIndex,
            exerciseIndex,
            exerciseName: ex.exerciseName
          }))) as [Set, ...Set[]]
      return [...a, {
        name: sess.name,
        programSets,
        splitIndices
      }]
    }, [])
    const sessionsToAdd = toAdd.length
      ? toAdd
      : null

    // Indices to Delete 
    const editedIndices = new Set(values.splitIndices.map(obj => obj.splitId))
    const indToDelete: number[] = []
    for (const index of program.splitIndices as { splitId: number }[])
      if (!editedIndices.has(index.splitId)) indToDelete.push(index.splitId)
    const indicesToDelete = indToDelete.length
      ? indToDelete
      : null
    // Indices to Add
    // ! Could be a reduce
    const indToAdd = values.splitIndices
      .filter(obj => {
        return obj.splitId === undefined && values.programSessions[obj.sessionIndex].sessId
      })
      .map((obj) => ({
        index: obj.splitIndex,
        sessionId: values.programSessions[obj.sessionIndex].sessId as number
      }))
    const indicesToAdd = indToAdd.length
      ? indToAdd
      : null

    // Indices that have changed
    const indToUpdate = values.splitIndices
      .filter(obj => obj.splitId &&
        obj.splitIndex !==
        program.splitIndices.find(index => index.splitId === obj.splitId)?.splitIndex)
      ?.map(obj => ({
        indexId: obj.splitId,
        index: obj.splitIndex
      })) as { indexId: number, index: number }[]
    const indicesToUpdate = indToUpdate.length
      ? indToUpdate
      : null
    // Sessions to Check for changes
    const sessionsToUpdate = toCheck.map((sessId) => {
      const original = program.programSessions.find(s => s.sessId === sessId)
      const sessionIndex = values.programSessions.findIndex(s => s.sessId === sessId)
      const edited = values.programSessions[sessionIndex]
      // Update sessionName if changed
      const name = original?.name !== edited!.name
        ? edited!.name
        : null
      // Exercises to Delete
      const editedExercises = new Set(
        edited?.programSets.flatMap(obj => obj.sets.map(s => s.setId))
      )
      const exToDelete = []
      const exToCheck = []
      for (const setId of original!.programSets.flatMap(obj => obj.sets).map(s => s.setId) as number[])
        if (!editedExercises.has(setId)) exToDelete.push(setId)
        else exToCheck.push(setId)
      const exercisesToDelete = exToDelete.length
        ? exToDelete
        : null
      // Exercises to Add
      const exToAdd = edited.programSets.flatMap((set, setIndex) =>
        set.sets.reduce((
          a: { setIndex: number, exerciseIndex: number, exerciseName: string }[],
          v,
          exIndex
        ) => {
          console.log('eTA: ', v)
          if (v.setId !== undefined) return a
          return [...a, {
            setIndex,
            exerciseIndex: exIndex,
            exerciseName: v.exerciseName
          }]
        }, []))
      const exercisesToAdd = exToAdd.length
        ? exToAdd
        : null
      // Exercises to Check
      const exToUpdate = edited?.programSets.flatMap((set, setIndex) => {
        return set.sets.reduce((
          a: { id: number, exerciseName: string, exerciseIndex: number, setIndex: number }[],
          ex,
          exInd
        ) => {
          if (
            ex.setId === undefined
            ||
            ex.exerciseName === original?.programSets[setIndex].sets[exInd].exerciseName
          ) return a
          return [...a, {
            id: ex.setId,
            exerciseName: ex.exerciseName,
            exerciseIndex: exInd,
            setIndex: setIndex,
          }]
        }, [])
      })
      const exercisesToUpdate = exToUpdate.length
        ? exToUpdate
        : null

      return {
        programSessionId: sessId,
        name,
        exercisesToDelete,
        exercisesToAdd,
        exercisesToUpdate,
      }
    })

    const input: Input = {
      programId: program.programId as number,
      programName,
      splitLength,
      sessionsToDelete,
      sessionsToAdd,
      indicesToDelete,
      indicesToAdd,
      indicesToUpdate,
      sessionsToUpdate
    }
    console.log('input: ', input)
    try {
      type Output = inferProcedureOutput<AppRouter["programs"]["updateProgram"]>
      const result = await updateProgram.mutateAsync(input) as Output
      console.log('result: ', result)
      if (result === null) return // handle error?
      const index = programs!.findIndex(p => p.programId === program.programId) as number
      const replacement = [...programs!]
      replacement[index] = result
      setPrograms!(replacement)
    } catch (cause) {
      console.error({ cause }, "Failed to insert program")
    }

    router.push("/programs")
    setLoading(false)
  }

  return (
    <Layout
      footerItems={footerItems}
      setWarning={edit === "EDIT" ? setWarning : undefined}
    >
      <div className="w-full grid justify-items-center">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-7 w-[min(300px,100%)] grid-cols-[min(300px,100%)]"
        >
          {page === undefined ? (
            <ProgramForm
              form={form}
              page={page} // ?
              setPage={setPage}
              edit={edit}
              setEdit={setEdit}
              setWarning={() => setWarning("DELETION")}
              loading={loading}
              splitIndicesArray={splitIndicesArray}
              programSessionsArray={programSessionsArray}
            />
          ) : (
            <SessionForm
              form={form}
              sessInd={page}
              setPage={setPage}
              edit={edit}
              loading={loading}
              splitIndicesArray={splitIndicesArray}
              programSessionsArray={programSessionsArray}
            />
          )}
        </form>
      </div>
      {warning === "DELETION" ? (
        <DeletionAlert 
          setWarning={setWarning} 
          onDelete={onDelete}
          sessionOrProgram="Program"
        />
      )
      : warning ? (
        <NavigationAlert warning={warning} setWarning={setWarning} />
      ) : null}
    </Layout>
  )
}
