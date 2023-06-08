import { useAuth } from "@/components/auth-and-context";
import Layout from "@/components/authenticated-layout";
import { useRouter } from "next/router";
import { sessionsConfig } from "@/config/sessions-config";
import { useEffect, useMemo, useState } from "react";
import {
  exerciseSchema,
  sessionSchema,
  setSchema,
} from "@/types/schema-sending";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { trpc } from "@/utils/trpc";
import { inferProcedureInput } from "@trpc/server";
import { AppRouter } from "@/server/routers/_app";
import { Form } from "@/components/ui/form";
import {
  ExerciseForm,
  NavigationAlert,
  SessionForm,
} from "@/components/add-and-edit";
import { sessionSchemaT } from "@/types/schema-receiving";

const { navItems, footerItems } = sessionsConfig;

const weightUnit = "kg";

type BreakdownStates = "BREAKDOWN" | "EDIT";

export default function SessionBreakdown() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { exerciseSessions, setter } = useAuth();
  const [page, setPage] = useState<string | undefined>();
  const [warning, setWarning] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [edit, setEdit] = useState<BreakdownStates>("BREAKDOWN");

  const exSess = useMemo(() => {
    if (exerciseSessions) {
      const sess = exerciseSessions.find(
        (sess) => sess.date == router.query.session
      );
      if (!sess) return;
      return sess;
    }
  }, [exerciseSessions, router.query.session]);

  // This may be better left as an immediately invoked function run within useForm
  // But how do I force it to wait until exSess is found?
  const changeSess = useMemo(() => {
    if (!exSess) return;
    const changeSess: z.infer<typeof sessionSchema> = {
      date: new Date(exSess.date),
      exercises: exSess.exercises.map((ex) => {
        return {
          name: ex.name,
          sets: ex.sets.map((set) => {
            return { ...set, weight: Number(set.weight) };
          }),
        };
      }),
    };
    return changeSess;
  }, [exSess]);

  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    values: changeSess,
  });

  const createSession = trpc.sessions.updateSession.useMutation({
    onSuccess() {
      console.log("Success!");
    },
    //onError()
  });
  const onSubmit: SubmitHandler<z.infer<typeof sessionSchema>> = async (
    values
  ) => {
    setLoading(true);
    type Input = inferProcedureInput<AppRouter["sessions"]["updateSession"]>;
    if (!session || !session.user || !session.user.email || !exSess) return;

    const date = new Date(exSess.date) === values.date ? null : values.date;

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
            .sets.map((s) => ({ ...s })),
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

        // !! Check whether index is right here:
        const setsToRemove =
          difference > 0
            ? originalSets.slice(-difference).map((s) => s.id)
            : null;

        console.log(setsToRemove)

        // !! Check whether index is right here:
        const setsToAdd =
          difference >= 0
            ? null
            : editedSets.slice(difference).map((s) => ({
              ...s,
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
            data.weight = editedSets[i].weight;
          if (Object.keys(data))
            toUpdate.push({ id: originalSets[i].id, data });
        }
        const setsToUpdate = toUpdate.length ? toUpdate : null;

        return {
          setsToRemove,
          setsToAdd,
          setsToUpdate,
        };
      })
      .filter((item) => item.setsToRemove || item.setsToAdd || item.setsToUpdate);

    const exercisesToUpdate = exercisesToUpdateArray.length
      ? exercisesToUpdateArray
      : null;

    const input: Input = {
      sid: exSess.sid,
      date,
      exercisesToDelete,
      exercisesToAdd,
      exercisesToUpdate
    };
    try {
      const result = await createSession.mutateAsync(input);
      if (result === null) return // handle error?

      // Insertion sort modified session by date
      let index = exerciseSessions!.findIndex(s => s.sid === exSess.sid)
      const replacement = [...exerciseSessions!]
      replacement[index] = result
      for (index; index > 0; index--)
        if (new Date(replacement[index].date) > new Date(replacement[index-1].date)) {
          let swap = replacement[index-1]
          replacement[index-1] = replacement[index]
          replacement[index] = swap
        } else break;
      for (index; index < replacement.length - 1; index++)
        if (new Date(replacement[index].date) < new Date(replacement[index+1].date)) {
          let swap = replacement[index+1]
          replacement[index+1] = replacement[index]
          replacement[index] = swap
        } else break;

      setter!(replacement)

    } catch (cause) {
        console.error({ cause }, "Failed to insert");
      }
      router.push("/sessions");
      setLoading(false);
    };

    return (
      <Layout
        navItems={navItems}
        footerItems={footerItems}
        setWarning={edit === "EDIT" ? setWarning : undefined}
      >
        {status !== "authenticated" ? null : (
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
        )}
        {warning ? (
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
