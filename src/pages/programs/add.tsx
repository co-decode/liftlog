import { useSession } from "next-auth/react";
import React, { useState } from "react";
import Layout from "@/components/authenticated-layout";
import { useAuth } from "@/components/auth-and-context";
import { programsAddConfig } from "@/config/programs-add-config";
import { trpc } from "@/utils/trpc";
import { inferProcedureInput } from "@trpc/server";
import { AppRouter } from "@/server/routers/_app";
import {
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { NavigationAlert } from "@/components/sessions/add-and-edit";
import { Program, ProgramForm, SessionForm, programSchema } from "@/components/programs/add-and-edit";

const { navItems, footerItems } = programsAddConfig;

export default function Programs() {
  const { data: authSess } = useSession();
  const router = useRouter();
  const { programs, setPrograms } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number | undefined>();
  const [warning, setWarning] = useState<string>("")

  const createProgram = trpc.programs.createProgram.useMutation({
    onSuccess() {
      console.log("Success!");
    },
    onError() {
      console.error("Custom Error Message: Handle this visually for the user!");
    },
  });

  const form = useForm<Program>({
    resolver: zodResolver(programSchema),
    //shouldUnregister: true,
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
    //console.log("after: ", programSessionsArray.fields);
    //console.log("afterIndices: ", splitIndicesArray.fields);
  }, [programSessionsArray.fields, splitIndicesArray.fields]);

  const {
    watch,
    formState: { errors },
  } = form;
  React.useEffect(() => {
    console.log("errors: ", errors.programSessions);
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch, errors]);

  const onSubmit: SubmitHandler<Program> = async (values) => {
    setLoading(true);
    type Input = inferProcedureInput<AppRouter["programs"]["createProgram"]>;
    if (!authSess) return;
    type ProgramSessions = Input["program"]["programSessions"];
    const program: Input["program"] = {
      programName: values.programName,
      splitLength: values.splitLength,
      programSessions: values.programSessions.map((sess, sessInd) => {
        const programSets = sess.programSets.flatMap((superset, setInd) =>
          superset.sets.map((ex, exInd) => ({
            exerciseName: ex.exerciseName,
            exerciseIndex: exInd,
            setIndex: setInd,
          }))
        );
        const splitIndices = values.splitIndices.reduce((a: number[], v) => {
          if (v.sessionIndex === sessInd) return [...a, v.splitIndex];
          return a;
        }, []);
        return {
          name: sess.name,
          splitIndices,
          programSets,
        };
      }) as ProgramSessions,
    };

    const input: Input = {
      userId: authSess.user.id,
      program,
    };
    try {
      const result = await createProgram.mutateAsync(input);
      if (result === null) return; // handle error?
      setPrograms!([...programs!, result])

    } catch (cause) {
      console.error(
        { cause },
        "Failed to insert, you should handle this visually for the user!"
      );
    }
    router.push("/programs")
    setLoading(false);
  };

  return (
    <Layout footerItems={footerItems} setWarning={setWarning}>
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
              loading={loading}
              splitIndicesArray={splitIndicesArray}
              programSessionsArray={programSessionsArray}
            />
          ) : (
            <SessionForm
              form={form}
              sessInd={page}
              setPage={setPage}
              loading={loading}
              splitIndicesArray={splitIndicesArray}
              programSessionsArray={programSessionsArray}
            />
          )}
        </form>
      </div>
      {warning ? (
        <NavigationAlert warning={warning} setWarning={setWarning} />
      ) : null}
    </Layout>
  );
}

