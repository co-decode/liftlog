import { Programs, useAuth } from "@/components/auth-and-context";
import Layout from "@/components/authenticated-layout";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import {
  sessionSchema,
} from "@/types/schema-sending";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { trpc } from "@/utils/trpc";
import { inferProcedureInput, inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "@/server/routers/_app";
import { Form } from "@/components/ui/form";
import {
    DeletionAlert,
  ExerciseForm,
  NavigationAlert,
  SessionForm,
} from "@/components/sessions/add-and-edit";
import { sessionsEditConfig } from "@/config/sessions-edit-config";

const { footerItems } = sessionsEditConfig;

type Program = Programs[number]
export type BreakdownStates = "BREAKDOWN" | "EDIT";

export default function SessionBreakdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const { exerciseSessions, setExerciseSessions, weightUnit, programs } = useAuth();
  const [page, setPage] = useState<string | undefined>();
  const [warning, setWarning] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [edit, setEdit] = useState<BreakdownStates>("BREAKDOWN");
  const [selectProgram, setSelectProgram] = useState<Program | undefined>()

  const exSess = useMemo(() => {
    if (exerciseSessions) {
      const sess = exerciseSessions.find(
        (sess) => sess.date.toISOString() == router.query.session
      );
      if (!sess) return;
      const optionals: Partial<{ programId: number, programSessionId: number }> = {}
      if (sess.programId && sess.programSessionId) {
        setSelectProgram(programs?.find(p => p.programId === sess.programId))
        optionals.programId = sess.programId
        optionals.programSessionId = sess.programSessionId
      }
      if (weightUnit === "KG")
        return {
          date: sess.date,
          sid: sess.sid,
          exercises: sess.exercises,
          ...optionals
        };
      else if (weightUnit === "LB")
        return {
          date: sess.date,
          sid: sess.sid,
          ...optionals,
          exercises: sess.exercises.map(ex => ({
            ...ex,
            sets: ex.sets.map(set => ({
              ...set,
              weight: Number((set.weight * 2.205).toFixed(2))
            }))
          }))
        }
    }
  }, [exerciseSessions, router.query.session, weightUnit, setSelectProgram, programs]);

  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    values: exSess,
  });

  const updateSession = trpc.sessions.updateSession.useMutation({
    onSuccess() {
      console.log("Success!");
    },
    //onError()
  });

  const deleteSession = trpc.sessions.deleteSession.useMutation({
    onSuccess() {
      console.log("Successfully deleted!");
    }
  })

  const onDelete = async() => {
    if (!exSess?.sid || !exerciseSessions || !setExerciseSessions) return;
    setLoading(true)
    try {
      await deleteSession.mutateAsync(exSess.sid)
      setExerciseSessions(exerciseSessions.filter(s => s.sid !== exSess.sid))
      router.push("/sessions")
      setLoading(false)
    } catch (error) {
      console.error(error, "deleteSession call failed")
      setLoading(false)
    }
  }

  const onSubmit: SubmitHandler<z.infer<typeof sessionSchema>> = async (
    values
  ) => {
    setLoading(true);
    type Input = inferProcedureInput<AppRouter["sessions"]["updateSession"]>;
    if (!session || !session.user || !session.user.email || !exSess) return;

    const date = new Date(exSess.date) === values.date ? null : values.date;

    const programId = 
    exSess.programId === values.programId || values.programId === undefined
      ? null 
      : values.programId

    const programSessionId = 
    exSess.programSessionId === values.programSessionId || values.programSessionId === undefined
      ? null 
      : values.programSessionId

    // ToDelete - Assume if name remains, same id
    const editedExercises = new Set(values.exercises.map((ex) => ex.name));
    const toDelete: number[] = [];
    const toUpdate = [];
    for (const ex of exSess.exercises)
      if (!editedExercises.has(ex.name)) toDelete.push(ex.id);
      else if (editedExercises.has(ex.name)) {
        toUpdate.push(ex.name);
        editedExercises.delete(ex.name);
      }
    const exercisesToDelete = toDelete.length
      ? toDelete
      : null

    // ToAdd
    const toAdd = Array.from(editedExercises);
    const exercisesToAdd = toAdd.length
      ? toAdd.map((name) => {
        //const exId = exSess.exercises.find((ex) => ex.name === name)!.id;
        return {
          exerciseName: name,
          sessionId: exSess.sid,
          sets: values.exercises
            .find((ex) => ex.name === name)!
            .sets.map((s) => ({
              ...s,
              weight: (weightUnit === "KG" ? s.weight : Number((s.weight * 0.4536).toFixed(2)))
            })),
        };
      })
      : null;

    // ToUpdate
    const exercisesToUpdateArray = toUpdate
      .map((name) => {
        const original = exSess.exercises.find((ex) => ex.name === name);
        const originalSets = original!.sets;
        const edited = values.exercises.find((ex) => ex.name === name);
        const editedSets = edited!.sets;

        // Positive: sets to remove, Negative: sets to add
        const difference = originalSets.length - editedSets.length;

        const setsToDelete =
          difference > 0
            ? originalSets.slice(-difference).map((s) => s.id)
            : null;

        console.log(setsToDelete)

        const setsToAdd =
          difference >= 0
            ? null
            : editedSets.slice(difference).map((s) => ({
              ...s,
              weight: (weightUnit === "KG" ? s.weight : Number((s.weight * 0.4536).toFixed(2))),
              exerciseId: original!.id,
            }));

        const setsToCheck =
          difference > 0 ? editedSets.length : originalSets.length;

        // Assuming index maps well to setNumber, IF there are changes, setNumber does not need to change
        const toUpdate = [];
        for (let i = 0; i < setsToCheck; i++) {
          const data: { reps: number | null; weight: number | null } = { reps: null, weight: null };
          if (originalSets[i].reps !== editedSets[i].reps)
            data.reps = editedSets[i].reps;
          if (Number(originalSets[i].weight) !== editedSets[i].weight)
            data.weight = (weightUnit === "KG" ? editedSets[i].weight : Number((editedSets[i].weight * 0.4536).toFixed(2)));
          if (Object.keys(data))
            toUpdate.push({ id: originalSets[i].id, data });
        }
        const setsToUpdate = toUpdate.length ? toUpdate : null;

        return {
          setsToDelete,
          setsToAdd,
          setsToUpdate,
        };
      })
      .filter((item) => item.setsToDelete || item.setsToAdd || item.setsToUpdate);

    const exercisesToUpdate = exercisesToUpdateArray.length
      ? exercisesToUpdateArray
      : null;

    const input: Input = {
      sid: exSess.sid,
      date,
      programId,
      programSessionId,
      exercisesToDelete,
      exercisesToAdd,
      exercisesToUpdate
    };
    try {
      type Output = inferProcedureOutput<AppRouter["sessions"]["updateSession"]>
      const result = await updateSession.mutateAsync(input) as Output
      if (result === null) return // handle error?
      result.date = new Date(result.date)
      // Insertion sort modified session by date
      let index = exerciseSessions!.findIndex(s => s.sid === exSess.sid)
      const replacement = [...exerciseSessions!]
      replacement[index] = result
      for (index; index > 0; index--)
        if (new Date(replacement[index].date) > new Date(replacement[index - 1].date)) {
          let swap = replacement[index - 1]
          replacement[index - 1] = replacement[index]
          replacement[index] = swap
        } else break;
      for (index; index < replacement.length - 1; index++)
        if (new Date(replacement[index].date) < new Date(replacement[index + 1].date)) {
          let swap = replacement[index + 1]
          replacement[index + 1] = replacement[index]
          replacement[index] = swap
        } else break;

      setExerciseSessions!(replacement)

    } catch (cause) {
      console.error({ cause }, "Failed to insert");
    }
    router.push("/sessions");
    setLoading(false);
  };

  return (
    <Layout
      footerItems={footerItems}
      setWarning={edit === "EDIT" ? setWarning : undefined}
    >
      <div className="flex w-full flex-1 flex-col items-center overflow-hidden">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 mb-20"
          >
            {!page ? (
              <SessionForm
                page={page}
                setPage={setPage}
                form={form}
                loading={loading}
                edit={edit}
                setEdit={setEdit}
                selectProgram={selectProgram}
                setSelectProgram={setSelectProgram}
                setWarning={() => setWarning("DELETION")}
              />
            ) : (
              <ExerciseForm
                form={form}
                page={page}
                setPage={setPage}
                edit={edit}
              />
            )}
          </form>
        </Form>
      </div>
      {warning === "DELETION" ? (
        <DeletionAlert setWarning={setWarning} onDelete={onDelete} sessionOrProgram="Session"/>
      )
      : warning ? (
        <NavigationAlert warning={warning} setWarning={setWarning} />
      ) : null}
    </Layout>
  );
}

/*
      <div>Query:&nbsp;{router.query.session}
        <br />
        Pathname:&nbsp;{router.pathname}
        {JSON.stringify(exSess)}

      </div>
      <Breakdown exSess={exSess} />
<>
<h1>Breakdown</h1>
<h2>Exercises:</h2>
{exSess?.exercises.map((ex: exerciseSchema) => 
    <div key={ex.name}>
    {ex.name}
    {ex.sets.map((set: setSchema) =>
        <div key={ex.name + set.setNumber}>
        Reps:&nbsp;{set.reps}
        <br/>
        Weight:&nbsp;{set.weight}&nbsp;{weightUnit}
        </div>
        )}
    </div>
    )}
</>
*/
