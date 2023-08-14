import { UseFieldArrayReturn, UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icons } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { Combobox } from "@/components/combobox";
import { z } from "zod";
import { Dispatch, Key, MouseEventHandler, SetStateAction, useEffect, useState } from "react";

const sessionSchema = z.object({
  sessId: z.number().int().optional(),
  name: z.string().max(16).nonempty(),
  programSets: z
    .array(
      z.object({
        sets: z
          .array(
            z.object({
              setId: z.number().int().optional(),
              exerciseName: z.string().max(16).nonempty(),
            })
          )
          .nonempty(),
      })
    )
    .nonempty(),
});

export const programSchema = z.object({
  programId: z.number().int().optional(),
  programName: z.string().max(16).nonempty(),
  splitLength: z.number().min(1).max(14).int(),
  splitIndices: z
    .array(
      z.object({
        splitId: z.number().int().optional(),
        splitIndex: z.number().min(0).max(13).int(),
        sessionIndex: z.number().min(0).max(13).int(),
      })
    )
    .nonempty(),
  programSessions: z.array(sessionSchema).nonempty(),
});

//type Program = inferProcedureInput<AppRouter["programs"]["createProgram"]>["program"]
type Session = z.infer<typeof sessionSchema>;
export type Program = z.infer<typeof programSchema>;

interface ProgramFormProps {
  form: UseFormReturn<Program>;
  programSessionsArray: UseFieldArrayReturn<Program, "programSessions", "id">;
  splitIndicesArray: UseFieldArrayReturn<Program, "splitIndices", "id">;
  page?: number;
  setPage: Dispatch<SetStateAction<number | undefined>>;
  edit?: "BREAKDOWN" | "EDIT";
  setEdit?: Dispatch<SetStateAction<"BREAKDOWN" | "EDIT">>;
  setWarning?: MouseEventHandler<HTMLButtonElement>
  loading: boolean;
}

export function ProgramForm({
  form,
  loading,
  page,
  setPage,
  edit,
  setEdit,
  setWarning,
  programSessionsArray,
  splitIndicesArray,
}: ProgramFormProps) {
  const [removeMode, setRemoveMode] = useState<boolean>(false);
  const watchSessionsLength = form.watch("programSessions")?.length;

  function handleProgramSessionsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    if (value > form.getValues().splitLength) return;
    const { fields, append, remove } = programSessionsArray;
    let prevValue = fields.length;
    if (prevValue < value)
      for (prevValue; prevValue < value; prevValue++)
        append({
          name: "",
          programSets: [{ sets: [{ exerciseName: "" }] }],
        });
    else if (prevValue > value)
      for (prevValue; prevValue > value; prevValue--) {
        remove(prevValue - 1);
        //console.log("array: ", splitIndicesArray.fields)
        splitIndicesArray.remove(
          splitIndicesArray.fields.reduce((a: number[], v, i) => {
            //console.log("reducing: ", a)
            if (v.sessionIndex === prevValue - 1) return [...a, i];
            return a;
          }, [])
        );
      }
    //console.log("handling: ", fields);
  }

  function handleSessionClick(sessInd: number) {
    if (!removeMode) setPage(!page ? sessInd : undefined);
    else if (removeMode) {
      if (programSessionsArray.fields.length === 1) setRemoveMode(false);
      programSessionsArray.remove(sessInd);
      splitIndicesArray.remove(
        splitIndicesArray.fields.reduce((a: number[], v, i) => {
          //console.log("reducing: ", a)
          if (v.sessionIndex === sessInd) return [...a, i];
          return a;
        }, [])
      );

    }
  }

  const handleEdit: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    setEdit!("EDIT")
  }

  return (
    <>
      <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-5 text-center">
        {edit ? null : "Add "} Program
      </h2>
      <Label htmlFor="programName">
        Program Name
        <Input
          id="programName"
          className="mt-2"
          maxLength={24}
          disabled={loading || edit === "BREAKDOWN"}
          {...form.register("programName")}
        />
        {form.formState.errors?.programName && (
          <p className="px-1 pt-1 text-xs text-red-600 absolute">
            {`${form.formState.errors.programName.message}`}
          </p>
        )}
      </Label>
      <div className="grid grid-cols-2 gap-3">
        <Label htmlFor="splitLength">
          Split Length
          <Input
            id="splitLength"
            className="mt-2 w-28"
            type="number"
            defaultValue={7}
            min="1"
            max="14"
            disabled={loading || edit === "BREAKDOWN"}
            {...form.register("splitLength", { valueAsNumber: true })}
          />
          {form.formState.errors?.splitLength && (
            <p className="px-1 pt-1 text-xs text-red-600 absolute">
              {`${form.formState.errors.splitLength.message}`}
            </p>
          )}
        </Label>
        {/* Input to determine how many days in a split the session will be assigned to */}
        <Label className="justify-self-end" htmlFor="programSessionsNumber">
          Sessions
          <Input
            id="programSessionsNumber"
            className={cn(
              !watchSessionsLength &&
              form.formState.errors.programSessions &&
              "border-destructive",
              "mt-2 w-24"
            )}
            type="number"
            value={programSessionsArray.fields.length}
            onChange={handleProgramSessionsChange}
            disabled={loading || edit === "BREAKDOWN"}
          />
        </Label>
      </div>
      <Table className="w-full">
        <TableCaption className={cn("relative mb-3", edit === "BREAKDOWN" ? "text-center" : "text-left")}>
          {removeMode
            ? "Delete Sessions"
            : programSessionsArray.fields.length
              ? "Current Sessions in the Program"
              : "Add Sessions to the Program"}
          {edit === "BREAKDOWN" ? null : (
            <Button
              variant="ghost"
              type="button"
              className="absolute right-0 top-[50%] translate-y-[-50%]"
              onClick={() =>
                programSessionsArray.fields.length && setRemoveMode(!removeMode)
              }
              disabled={!programSessionsArray.fields.length}
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
            <TableHead>Session</TableHead>
            <TableHead className="text-right">
              {removeMode ? "Delete" : "Exercises"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programSessionsArray.fields.map((sess, ind) => {
            const watchSets = form.watch(`programSessions.${ind}.programSets`)
            return (
              <TableRow
                key={sess.id}
                className={cn(removeMode && "hover:bg-destructive/5", "group parent hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background")}
                role="link"
                onClick={() => handleSessionClick(ind)}
                tabIndex={0}
              >
                <TableCell className="font-medium capitalize relative">
                  <Input
                    id={`session${ind}`}
                    placeholder={"Name"}
                    className="w-[10.5rem]"
                    onClick={(e) => e.stopPropagation()}
                    maxLength={16}
                    disabled={loading}
                    {...form.register(`programSessions.${ind}.name`)}
                  />
                  {form.formState.errors?.programSessions?.[ind]?.name && (
                    <Icons.warning className="w-4 h-4 top-1/2 -translate-y-1/2 right-6 absolute inline text-red-600 animate-pulse animate-ping" />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {removeMode ? (
                    <Icons.close className="inline w-4 h-4 transition group-hover:scale-125 group-hover:text-red-600 child" />
                  ) : (
                    <span
                      className={
                        form.formState.errors?.programSessions?.[ind]?.programSets
                          ? "text-red-600"
                          : ""
                      }
                    >
                      {watchSets.flatMap(v => v.sets).length}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/*programSessionsArray.fields.map((field, i) => {
            return (
              <div key={field.id}>
                <h1>Session {` ${i + 1}`}</h1>
                <Label htmlFor={`session${i}`}>Name of Session:</Label>
                <Input
                  id={`session${i}`}
                  disabled={loading}
                  {...form.register(`programSessions.${i}.name`)}
                />
                {form.formState.errors?.programSessions?.[i]?.name && (
                  <p className="px-1 text-xs text-red-600">
                    {`${form.formState.errors.programSessions[i]?.name?.message}`}
                  </p>
                )}
                <Label htmlFor={`session${i}splitIndex`}>Day Number/s</Label>
                <CheckboxIndices
                  form={form}
                  sessInd={i}
                  splitIndicesArray={splitIndicesArray}
                />

                <ProgramSets form={form} sessInd={i} loading={loading} />
              </div>
            );
          })*/}
      {edit === "BREAKDOWN" && setEdit ? (
        <Button
          type="button"
          variant={"destructive"}
          className="w-full"
          onClick={handleEdit}
        >
          Edit
        </Button>
      ) : (

        <>
          <Button type="submit" disabled={loading}>
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

interface SessionFormProps {
  form: UseFormReturn<Program>;
  sessInd: number;
  setPage: Dispatch<SetStateAction<number | undefined>>;
  edit?: "EDIT" | "BREAKDOWN";
  loading: boolean;
  splitIndicesArray: UseFieldArrayReturn<Program, "splitIndices", "id">;
  programSessionsArray: UseFieldArrayReturn<Program, "programSessions", "id">;
}

export function SessionForm({
  form,
  sessInd,
  loading,
  setPage,
  edit,
  splitIndicesArray,
  programSessionsArray,
}: SessionFormProps) {
  const watchSessName = form.watch(`programSessions.${sessInd}.name`);
  const programSetsArray = useFieldArray({
    control: form.control,
    name: `programSessions.${sessInd}.programSets`,
  });
  function handleAddSet() {
    // Should be watch splitLength
    if (programSetsArray.fields.length < form.getValues().splitLength)
      programSetsArray.append({ sets: [{ exerciseName: "" }] });
  }
  return (
    <>
      <h2 className="mt-1">
        <Label htmlFor="sessionName">Session Name</Label>
        <div className="relative">
          <Input
            id="sessionName"
            className="scroll-m-20 text-2xl font-semibold tracking-tight w-64"
            maxLength={16}
            disabled={loading || edit === "BREAKDOWN"}
            value={watchSessName}
            {...form.register(`programSessions.${sessInd}.name`)}
          />
          <Button
            type="button"
            className="w-10 h-10 p-0 absolute right-0 top-0"
            onClick={() => setPage(undefined)}
          >
            <Icons.logout className="w-6 h-6" />
          </Button>
        </div>
      </h2>
      <div>
        <Label className="pb-2">Day Number/s</Label>
        <Card className="py-2 pb-3">
          <CheckboxIndices
            form={form}
            edit={edit}
            sessInd={sessInd}
            splitIndicesArray={splitIndicesArray}
          />
        </Card>
      </div>

      <ProgramSets
        form={form}
        sessInd={sessInd}
        edit={edit}
        loading={loading}
        programSetsArray={programSetsArray}
      />
      {edit === "BREAKDOWN" ? null :
        <Button type="button" onClick={handleAddSet}>
          Add a Set
        </Button>
      }
    </>
  );
}

interface ProgramSetsProps {
  form: UseFormReturn<Program>;
  programSetsArray: UseFieldArrayReturn<
    Program,
    `programSessions.${number}.programSets`,
    "id"
  >;
  edit?: "EDIT" | "BREAKDOWN";
  sessInd: number;
  loading: boolean;
}

export function ProgramSets({
  form,
  sessInd,
  edit,
  loading,
  programSetsArray,
}: ProgramSetsProps) {
  return (
    <>
      {programSetsArray.fields.map((field, setIndex) => {
        return (
          <div key={field.id}>
            <ProgramSetExercises
              form={form}
              sessInd={sessInd}
              setInd={setIndex}
              edit={edit}
              programSetsArray={programSetsArray}
            />
          </div>
        );
      })}
    </>
  );
}

interface ProgramSetExercisesProps {
  form: UseFormReturn<Program>;
  sessInd: number;
  setInd: number;
  programSetsArray: UseFieldArrayReturn<Program, `programSessions.${number}.programSets`, "id">;
  edit?: "EDIT" | "BREAKDOWN";
}

export function ProgramSetExercises({
  form,
  sessInd,
  setInd,
  edit,
  programSetsArray
}: ProgramSetExercisesProps) {
  const programSetExercisesArray = useFieldArray({
    control: form.control,
    name: `programSessions.${sessInd}.programSets.${setInd}.sets`,
  });

  const { fields, update, append, remove } = programSetExercisesArray;

  function handleAddExercise() {
    append({ exerciseName: "" });
  }

  function handleRemoveSet() {
    programSetsArray.remove(setInd)
  }


  return (
    <div className="grid gap-3">
      <h2 className="scroll-m-20 text-xl font-semibold tracking-tight relative">
        Set {` ${setInd + 1}`}
        {edit === "BREAKDOWN" ? null :
          <Button
            type="button"
            variant={"ghost"}
            className="absolute right-0 top-1/2 parent group hover:bg-destructive/5 -translate-y-1/2"
            onClick={handleRemoveSet}
          >
            <Icons.trash className="w-4 h-4 group-hover:text-red-600 group-hover:scale-125 child transition" />
          </Button>
        }
      </h2>
      {fields.map((field, exInd) => {
        const watchExName = form.watch(
          `programSessions.${sessInd}.programSets.${setInd}.sets.${exInd}.exerciseName`
        );
        function handleRemoveEx() {
          remove(exInd)
        }
        return (
          <div key={field.id} className="indent-5">
            <Label htmlFor={`session${sessInd}set${setInd}exName${exInd}`}>
              Exercise {` ${exInd + 1}`}
            </Label>
            <div className="my-1 relative">
              <Combobox
                value={watchExName}
                programSetValue={update}
                programIndex={exInd}
                currentExercises={fields.map((v) => v.exerciseName)}
                edit={edit}
              />
              {edit === "BREAKDOWN" ? null :
                <Button
                  type="button"
                  variant={"ghost"}
                  className="absolute right-0 parent group hover:bg-destructive/5"
                  onClick={handleRemoveEx}
                >
                  <Icons.close className="w-4 h-4 group-hover:text-red-600 group-hover:scale-125 child transition" />
                </Button>
              }
            </div>
            {form.formState.errors?.programSessions?.[sessInd]?.programSets?.[
              setInd
            ]?.sets?.[exInd]?.exerciseName && (
                <p className="px-1 text-xs text-red-600">
                  {`${form.formState.errors.programSessions[sessInd]?.programSets?.[setInd]?.sets?.[exInd]?.exerciseName?.message}`}
                </p>
              )}
          </div>
        );
      })}
      {edit === "BREAKDOWN" ? null :
        <Button
          type="button"
          className="w-[200px] ml-5"
          onClick={handleAddExercise}
        >
          Add Exercise
        </Button>
      }
    </div>
  );
}

interface CheckboxIndicesProps {
  form: UseFormReturn<Program>;
  edit?: "BREAKDOWN" | "EDIT";
  sessInd: number;
  splitIndicesArray: UseFieldArrayReturn<Program, "splitIndices", "id">;
}

type checkStates = "CHECKED" | "DISABLED" | "UNCHECKED"

export function CheckboxIndices({
  form,
  edit,
  sessInd,
  splitIndicesArray,
}: CheckboxIndicesProps) {
  const watchSplitLength: number = form.watch("splitLength");
  const currentSplit = form.getValues().splitIndices || [];

  function handleCheck(e: CheckedState, splitIndex: number) {
    if (e) splitIndicesArray.append({
      sessionIndex: sessInd,
      splitIndex
    });
    else if (!e) {
      const position = splitIndicesArray.fields.findIndex(
        (obj) => obj.splitIndex === splitIndex
      );
      splitIndicesArray.remove(position);
    }
  }

  useEffect(() => {
    console.log(splitIndicesArray.fields);
  }, [splitIndicesArray.fields]);

  if (watchSplitLength < 1 || watchSplitLength > 14 || isNaN(watchSplitLength))
    return <div className="text-destructive">Invalid Split Length</div>;
  return (
    <div className="grid gap-y-4 sm:grid-flow-col justify-items-center grid-cols-7 sm:grid-cols-none grid-flow-row">
      {Array.from({ length: watchSplitLength }, () => null).map((_, ind) => {

        const indexTaken = currentSplit.find(obj => {
          return obj.splitIndex === ind
        })

        const defaultState: checkStates = indexTaken
          ? indexTaken.sessionIndex === sessInd
            ? "CHECKED"
            : "DISABLED"
          : "UNCHECKED"

        return (
          <div key={ind} className="grid auto-cols-min text-center">
            <Label htmlFor={`splitDay${ind}`} className="block text-sm">
              {ind + 1}
            </Label>
            <Checkbox
              id={`splitDay${ind}`}
              checked={defaultState === "CHECKED"}
              className={
                form.formState.errors.splitIndices && "border-destructive"
              }
              disabled={defaultState === "DISABLED" || edit === "BREAKDOWN"}
              onCheckedChange={(e) => handleCheck(e, ind)}
            />
          </div>
        );
      })}
    </div>
  );
}
