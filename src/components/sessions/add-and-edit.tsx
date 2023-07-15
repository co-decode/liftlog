import React, { Dispatch, MouseEventHandler, SetStateAction, useEffect, useState } from "react";
import { DatePicker } from "@/components/date-picker";
import { Icons } from "@/components/icons";
import * as z from "zod";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button, buttonVariants } from "@/components/ui/button";
import {
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
import { sessionSchema } from "@/types/schema-sending";
import Link from "next/link";
import { Programs, useAuth } from "../auth-and-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type Program = Programs[number]

interface SessionFormProps {
  page: string | undefined;
  setPage: Dispatch<SetStateAction<string | undefined>>;
  form: UseFormReturn<z.infer<typeof sessionSchema>>;
  loading: boolean;
  edit?: "BREAKDOWN" | "EDIT";
  setEdit?: Dispatch<SetStateAction<"BREAKDOWN" | "EDIT">>;
  selectProgram?: Program
  setSelectProgram: Dispatch<SetStateAction<Program | undefined>>
  setWarning?: MouseEventHandler<HTMLButtonElement>
}

export function SessionForm({
  page,
  setPage,
  form,
  loading,
  edit,
  setEdit,
  selectProgram,
  setSelectProgram,
  setWarning,
}: SessionFormProps) {
  const { programs } = useAuth()
  const [removeMode, setRemoveMode] = useState<boolean>(false);
  const [selectExercise, setSelectExercise] = useState<string | undefined>();
  const {
    control,
    formState: { errors },
    resetField,
    getValues,
  } = form;

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control,
      name: "exercises",
    }
  );

  function handleAddExercise() {
    if (!selectExercise) return;
    append({
      name: selectExercise,
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
        {edit ? null : "Add "} Session
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
              edit={edit}
            />
            <FormMessage />
          </FormItem>
        )}
      />
      {programs ?
        <div className="flex max-w-[300px] justify-between">
          <FormField
            control={form.control}
            name="programId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Program</FormLabel>
                <Select
                  onValueChange={(e) => {
                    if (Number(e) > 0)
                      field.onChange(Number(e));
                    const program = programs?.find(p => p.programId === Number(e))
                    setSelectProgram!(program)
                    resetField("programSessionId")
                  }}
                  defaultValue={String(getValues("programId")) || ""}
                  disabled={edit === "BREAKDOWN"}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      None
                    </SelectItem>
                    {programs?.map((p) => (
                      <SelectItem key={p.programId} value={String(p.programId)}>
                        {p.programName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="programSessionId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Program Session</FormLabel>
                <Select
                  onValueChange={(e) => {
                    if (Number(e) > 0)
                      field.onChange(Number(e))
                  }}
                  disabled={!selectProgram || edit === "BREAKDOWN"}
                  defaultValue={String(getValues("programSessionId")) || ""} 
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      None
                    </SelectItem>
                    {selectProgram?.programSessions.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        : null}
      <Table className="w-[300px] mx-1">
        <TableCaption
          className={cn("relative mb-3", edit === "BREAKDOWN" ? "text-center" : "text-left")}
        >
          {removeMode
            ? "Delete Exercises"
            : fields.length
              ? "Current Exercises in the Session"
              : "Add Exercises to the Session"}
          {edit === "BREAKDOWN" ? null : (
            <Button
              variant="ghost"
              type="button"
              className="absolute right-0 top-[50%] translate-y-[-50%]"
              onClick={() => fields.length && setRemoveMode(!removeMode)}
              disabled={!fields.length}
            >
              {removeMode ? (
                <Icons.edit className="w-4 h-4" />
              ) : (
                <Icons.trash className="w-4 h-4" />
              )}
            </Button>
          )}
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
              key={ex.name}
              onClick={() => handleExerciseClick(ex.name, ind)}
              className={cn(removeMode && "hover:bg-destructive/5", "group parent hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background")}
              role="link"
              tabIndex={0}
            >
              <TableCell className="font-medium capitalize relative">
                {ex.name}
                {errors?.exercises?.[ind]?.sets && (
                  <Icons.warning className="w-4 h-4 ml-3 mb-[2px] relative inline text-red-600 animate-pulse animate-ping" />
                )}
              </TableCell>
              <TableCell className="text-right">
                {removeMode ? (
                  <Icons.close className="inline w-4 h-4 transition group-hover:scale-125 group-hover:text-red-600 child" />
                ) : (
                  //sets[ex.name]
                  ex.sets.length
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {edit === "BREAKDOWN" && setEdit ? (
        <>
          <Button
            type="button"
            variant={"destructive"}
            className="w-full"
            onClick={() => setEdit("EDIT")}
          >
            Edit
          </Button>
        </>
      ) : (
        <>
          <div className="flex justify-between">
            <Combobox
              value={selectExercise}
              setValue={setSelectExercise}
              currentExercises={fields.map((v) => v.name)}
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
            {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
          {
          edit === "EDIT" ?
          <Button 
            type="button" 
            disabled={loading} 
            variant="destructive" 
            className="w-full"
            onClick={setWarning}
          >
            {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
          : null
          }
        </>
      )}
    </>
  );
}

interface ExerciseFormProps {
  form: UseFormReturn<z.infer<typeof sessionSchema>>;
  page: string;
  setPage: Dispatch<SetStateAction<string | undefined>>;
  edit?: "BREAKDOWN" | "EDIT";
}

export function ExerciseForm({ form, page, setPage, edit }: ExerciseFormProps) {
  const {
    control,
    getValues,
    register,
    formState: { errors },
  } = form;
  const { weightUnit } = useAuth()
  const nestIndex = getValues().exercises.findIndex((ex) => ex.name === page);
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
      for (prevValue; prevValue > value; prevValue--) remove(prevValue - 1);
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
          type={edit === "BREAKDOWN" ? "text" : "number"}
          min="1"
          max="10"
          defaultValue={fields.length || 1}
          className={cn(edit && "text-center", "w-16")}
          onChange={handleSetChange}
          disabled={edit === "BREAKDOWN"}
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
            <TableHead className="text-right">Weight{` (${weightUnit})`}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field, ind) => {
            return (
              <TableRow
                key={field.id}
                className={cn(edit === "BREAKDOWN" && "pointer-events-none")}
              >
                <TableCell className="font-medium">{ind + 1}</TableCell>
                <TableCell className="text-right">
                  <Input
                    type={edit === "BREAKDOWN" ? "text" : "number"}
                    max="999"
                    min="1"
                    className={cn(
                      errors?.exercises?.[nestIndex]?.sets?.[ind]?.reps &&
                      "text-red-600 border-red-600/50",
                      edit && "text-center"
                    )}
                    onFocus={(e) => e.target.select()}
                    {...register(`exercises.${nestIndex}.sets.${ind}.reps`, {
                      valueAsNumber: true,
                    })}
                    disabled={edit === "BREAKDOWN"}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type={edit === "BREAKDOWN" ? "text" : "number"}
                    max="9999"
                    min="0"
                    className={cn(
                      errors?.exercises?.[nestIndex]?.sets?.[ind]?.weight &&
                      "text-red-600 border-red-600/50",
                      edit && "text-center"
                    )}
                    onFocus={(e) => e.target.select()}
                    {...register(`exercises.${nestIndex}.sets.${ind}.weight`, {
                      valueAsNumber: true,
                    })}
                    disabled={edit === "BREAKDOWN"}
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

interface NavigationAlertProps {
  warning: string;
  setWarning: React.Dispatch<React.SetStateAction<string>>;
}

export function NavigationAlert({ warning, setWarning }: NavigationAlertProps) {
  useLockBody();
  return (
    <div className="z-50 bg-background/50 w-full h-full fixed !m-0 top-0">
      <Card className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 min-w-max">
        <CardHeader>
          <CardTitle className="text-center mb-2">Leave the Page?</CardTitle>
          <CardDescription>
            Are you sure you want to navigate away?
            <br /> Your {warning.slice(1)} entry data will be lost.
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

interface DeletionAlertProps {
  onDelete: MouseEventHandler<HTMLButtonElement>
  setWarning: React.Dispatch<React.SetStateAction<string>>;
}

export function DeletionAlert({ onDelete, setWarning }: DeletionAlertProps) {
  useLockBody();
  return (
    <div className="z-50 bg-background/50 w-full h-full fixed !m-0 top-0">
      <Card className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 min-w-max">
        <CardHeader>
          <CardTitle className="text-center mb-2">Are you sure?</CardTitle>
          <CardDescription>
            Are you sure you want to delete this session?
            <br /> 
            This action is permanent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className={cn(buttonVariants({ variant: "destructive" }), "w-full")}
            onClick={onDelete}
          >
            <p>
              Delete
            </p>
          </Button>
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
