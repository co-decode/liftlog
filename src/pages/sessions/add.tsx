import Layout from "@/components/authenticated-layout"
import { addConfig } from "@/config/add-config";
import { DatePicker } from "@/components/date-picker";
import { Icons } from "@/components/icons";
import { MainNav } from "@/components/main-nav";
import { SiteFooter } from "@/components/site-footer";
import { UserAccountNav } from "@/components/user-account-nav";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { useEffect } from "react";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Control,
  FieldErrors,
  SubmitHandler,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
  UseFormReturn,
  useFieldArray,
  useForm,
} from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/combobox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLockBody } from "@/hooks/use-lock-body";
import { trpc } from "@/utils/trpc";
import { inferProcedureInput } from "@trpc/server";
import { AppRouter } from "@/server/routers/_app";

const { navItems, footerItems } = addConfig

const exerciseSchema = z.object({
  exerciseName: z.string(),
  sets: z
    .array(
      z.object({
        setNumber: z.number().positive().int().max(10),
        reps: z
          .number({ required_error: "Required!" })
          .positive()
          .int()
          .max(999),
        weight: z.number().multipleOf(0.01).max(9999),
      })
    )
    .nonempty(),
})

const formSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  exercises: z.array(exerciseSchema).nonempty(),
});

export default function AddPage() {
  const { data: session, status } = useSession();
  const [page, setPage] = useState<string | undefined>();
  const [warning, setWarning] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    //shouldUnregister: true,
  });

  const createSession = trpc.sessions.updateOne.useMutation({
    onSuccess() {
      console.log("Success!");
    },
    //onError()
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (
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

interface SessionFormProps {
  page: string | undefined
  setPage: Dispatch<SetStateAction<string | undefined>>
  form: UseFormReturn<z.infer<typeof formSchema>>
  loading: boolean
}

function SessionForm({
  page,
  setPage,
  form,
  loading
}: SessionFormProps) {
  const [removeMode, setRemoveMode] = useState<boolean>(false);
  const [selectExercise, setSelectExercise] = useState<string | undefined>();
  const { control, formState: {errors}} = form

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control,
      name: "exercises",
    }
  );

  function handleAddExercise() {
    if (!selectExercise) return;
    append({
      exerciseName: selectExercise,
      sets: [{ setNumber: 1, reps: 0, weight: 0 }],
    });
    setSelectExercise(undefined);
  }

  function handleExerciseClick(ex: string, ind: number) {
    if (!removeMode) setPage(!page ? ex : undefined);
    else if (removeMode) {
      if (fields.length === 1) setRemoveMode(false);
      remove(ind);
    }
  }

  return (
    <>
      <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-5 text-center">
        Add Session
      </h2>
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date</FormLabel>
            <DatePicker
              date={field.value}
              setDate={field.onChange}
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <Table className="w-[300px] mx-1">
        <TableCaption className="relative mb-3 text-left">
          {removeMode
            ? "Delete Exercises"
            : fields.length
              ? "Current Exercises in the Session"
              : "Add Exercises to the Session"}
          <Button
            variant="ghost"
            type="button"
            className="absolute right-0 top-[50%] translate-y-[-50%]"
            onClick={() =>
              fields.length && setRemoveMode(!removeMode)
            }
            disabled={!fields.length}
          >
            {removeMode ? (
              <Icons.edit className="w-4 h-4" />
            ) : (
              <Icons.trash className="w-4 h-4" />
            )}
          </Button>
        </TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Exercise</TableHead>
            <TableHead className="text-right">
              {removeMode ? "Delete" : "Sets"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((ex, ind) => (
            <TableRow
              key={ex.exerciseName}
              onClick={() => handleExerciseClick(ex.exerciseName, ind)}
              className="group parent hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
              role="link"
              tabIndex={0}
            >
              <TableCell className="font-medium capitalize relative">
                {ex.exerciseName}
                {errors?.exercises?.[ind]?.sets && (
                  <Icons.warning className="w-4 h-4 ml-3 mb-[2px] relative inline text-red-600 animate-pulse animate-ping" />
                )}
              </TableCell>
              <TableCell className="text-right">
                {removeMode ? (
                  <Icons.close className="inline w-4 h-4 transition group-hover:scale-125 group-hover:text-red-600 child" />
                ) : (
                  //sets[ex.exerciseName]
                  ex.sets.length
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between">
        <Combobox
          value={selectExercise}
          setValue={setSelectExercise}
          currentExercises={fields.map(v => v.exerciseName)}
        />
        <Button
          type="button"
          disabled={loading}
          onClick={handleAddExercise}
        >
          <Icons.add />
        </Button>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading && (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        )}
        Submit
      </Button>
    </>
  )
}


interface NavigationAlertProps {
  warning: string;
  setWarning: React.Dispatch<React.SetStateAction<string>>;
}

function NavigationAlert({ warning, setWarning }: NavigationAlertProps) {
  useLockBody();
  return (
    <div className="z-50 bg-background/50 w-full h-full fixed !m-0 top-0">
      <Card className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 min-w-max">
        <CardHeader>
          <CardTitle className="text-center mb-2">Leave the Page?</CardTitle>
          <CardDescription>
            Are you sure you want to navigate away?
            <br /> Your session entry data will be lost.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href={warning}
            className={cn(buttonVariants({ variant: "destructive" }), "w-full")}
          >
            <p>
              Go to&nbsp;
              <span className="capitalize">{warning.slice(1)}</span>
            </p>
          </Link>
        </CardContent>
        <CardFooter>
          <Button
            variant="default"
            className="w-full"
            onClick={() => setWarning("")}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

interface ExerciseFormProps {
  form: UseFormReturn<z.infer<typeof formSchema>>
  page: string;
  setPage: Dispatch<SetStateAction<string | undefined>>;
}

function ExerciseForm({
  form,
  page,
  setPage,
}: ExerciseFormProps) {
  const { control, getValues, register, formState: {errors}} = form
  const nestIndex = getValues().exercises.findIndex(ex=>ex.exerciseName === page)
  const { fields, remove, append } = useFieldArray({
    control,
    name: `exercises.${nestIndex}.sets`,
  });

  function handleSetChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!page) return;
    const value = Number(e.target.value);
    if (value < 1 || value > 10) return;
    let prevValue = fields.length;
    if (prevValue < value)
      for (prevValue; prevValue < value; prevValue++)
        append({ setNumber: prevValue + 1, reps: 0, weight: 0 });
    else if (prevValue > value)
      for (prevValue; prevValue > value; prevValue--)
        remove(prevValue - 1)
  }

  return (
    <>
      <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-5 capitalize relative">
        {page}
        <Button
          type="button"
          className="w-10 h-10 p-0 absolute right-0"
          onClick={() => setPage(undefined)}
        >
          <Icons.logout className="w-6 h-6" />
        </Button>
      </h2>
      <div className="flex gap-4 items-center">
        <Label htmlFor="sets">Sets:&nbsp;</Label>
        <Input
          id="sets"
          type="number"
          min="1"
          max="10"
          defaultValue={fields.length || 1}
          className="w-16"
          onChange={handleSetChange}
        />
      </div>
      <Table className="w-[300px]">
        <TableCaption>
          Current Sets for <span className="capitalize">{page}</span>
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="">Set</TableHead>
            <TableHead className="text-right">Reps</TableHead>
            <TableHead className="text-right">Weight</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field, ind) => {
            return (
              <TableRow key={field.id} className="hover:cursor-pointer">
                <TableCell className="font-medium">{ind + 1}</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    max="999"
                    min="1"
                    className={
                      errors?.exercises?.[nestIndex]?.sets?.[ind]?.reps &&
                      "text-red-600 border-red-600/50"
                    }
                    onFocus={(e) => e.target.select()}
                    {...register(`exercises.${nestIndex}.sets.${ind}.reps`, {
                      valueAsNumber: true,
                    })}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    max="9999"
                    min="0"
                    className={
                      errors?.exercises?.[nestIndex]?.sets?.[ind]?.weight &&
                      "text-red-600 border-red-600/50"
                    }
                    onFocus={(e) => e.target.select()}
                    {...register(`exercises.${nestIndex}.sets.${ind}.weight`, {
                      valueAsNumber: true,
                    })}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
