import Layout from "@/components/authenticated-layout"
import { addConfig } from "@/config/add-config";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  SubmitHandler,
  useForm,
} from "react-hook-form";

import { Form } from "@/components/ui/form";
import { trpc } from "@/utils/trpc";
import { inferProcedureInput } from "@trpc/server";
import { AppRouter } from "@/server/routers/_app";
import { sessionSchema } from "@/types/schema-sending";
import { ExerciseForm, NavigationAlert, SessionForm } from "@/components/add-and-edit";

const { navItems, footerItems } = addConfig

export default function AddPage() {
  const { data: session, status } = useSession();
  const [page, setPage] = useState<string | undefined>();
  const [warning, setWarning] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    //shouldUnregister: true,
  });

  const createSession = trpc.sessions.updateOne.useMutation({
    onSuccess() {
      console.log("Success!");
    },
    //onError()
  });

  const onSubmit: SubmitHandler<z.infer<typeof sessionSchema>> = async (
    values
  ) => {
    setLoading(true);
    type Input = inferProcedureInput<AppRouter["sessions"]["updateOne"]>;
    if (!session || !session.user || !session.user.email) return;
    const input: Input = {
      email: "cody@cody.com",
      exerciseSessions: values,
    };
    try {
      await createSession.mutateAsync(input);
    } catch (cause) {
      console.error({ cause }, "Failed to insert");
    }
    router.push("/sessions");
    setLoading(false);
  };

  return (
    <Layout navItems={navItems} footerItems={footerItems} setWarning={setWarning}>
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
