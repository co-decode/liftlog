import Layout from "@/components/authenticated-layout"
import { addConfig } from "@/config/add-config";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { Form } from "@/components/ui/form";
import { trpc } from "@/utils/trpc";
import { inferProcedureInput, inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "@/server/routers/_app";
import { sessionSchema } from "@/types/schema-sending";
import { ExerciseForm, NavigationAlert, SessionForm } from "@/components/sessions/add-and-edit";
import { Programs, Sessions, useAuth } from "@/components/auth-and-context";

type Program = Programs[number]

const { footerItems } = addConfig

export default function AddPage() {
  const { data: session, status } = useSession();
  const { 
    exerciseSessions,
    setExerciseSessions,
    workoutSummary,
    weightUnit,
    programs
  } = useAuth()
  const [page, setPage] = useState<string | undefined>();
  const [warning, setWarning] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectProgram, setSelectProgram] = useState<Program | undefined>()

  const router = useRouter();

  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    values: workoutSummary || undefined
    //shouldUnregister: true,
  });

  useEffect(() => {
    if (workoutSummary && programs) 
      setSelectProgram(
        programs?.find(p => p.programId === workoutSummary.programId)
      )
  }, [workoutSummary, programs])

  const createSession = trpc.sessions.createSession.useMutation({
    onSuccess() {
      console.log("Success!");
    },
    //onError()
  });

  const onSubmit: SubmitHandler<z.infer<typeof sessionSchema>> = async (
    values
  ) => {
    setLoading(true);
    type Input = inferProcedureInput<AppRouter["sessions"]["createSession"]>;
    if (!session || !session.user || !session.user.id) return;
    const optionals: Partial<{programId: number, programSessionId: number}> = {}
    if (values.programSessionId && values.programId) {
      optionals.programId = values.programId
      optionals.programSessionId = values.programSessionId
    }
    const input: Input = {
      userId: session!.user.id,
      exerciseSessions: { 
        date: values.date,
        ...optionals,
        exercises: values.exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(set => ({
            ...set,
            weight: Number((set.weight * (weightUnit === "KG" ? 1 : 0.4536)).toFixed(2)),
          }))
        }))
      }
    };
    try {
      type Output = inferProcedureOutput<AppRouter["sessions"]["createSession"]>
      const result = await createSession.mutateAsync(input) as Output
      if (result === null) return; // handle error?
      result.date = new Date(result.date)
      const replacement = [...exerciseSessions!, result]
      // Insertion sort modified session by date
      for (let index = replacement.length - 1; index > 0; index--)
        if (replacement[index].date > replacement[index-1].date) {
          let swap = replacement[index-1]
          replacement[index-1] = replacement[index]
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
    <Layout footerItems={footerItems} setWarning={setWarning}>
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
                  selectProgram={selectProgram}
                  setSelectProgram={setSelectProgram}
                />
              ) : (
                <ExerciseForm
                  form={form}
                  page={page}
                  setPage={setPage}
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
