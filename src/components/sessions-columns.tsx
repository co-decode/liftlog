"use client";

import { CellContext, ColumnDef, FilterFn } from "@tanstack/react-table";
import { z } from "zod";
declare module '@tanstack/table-core' {
  interface FilterFns {
    dateRange: FilterFn<unknown>
    includesExercise: FilterFn<unknown>
  }
}

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
const SetSchema = z.object({
  reps: z.number(),
  weight: z.number(),
});

const ExerciseSchema = z.object({
  name: z.string(),
  sets: z.array(SetSchema),
});

const ExerciseSessionSchema = z.object({
  //date: z.string(),
  date: z.coerce.date(),
  exercises: z.array(ExerciseSchema),
});

export type Schema = z.infer<typeof ExerciseSessionSchema>;

export const columns: ColumnDef<Schema>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: (props: CellContext<Schema, any>) => {
      //const formatDate = new Date(props.getValue());

      return (
        <span>
          {new Intl.DateTimeFormat([], {
            weekday: "short",
            day: "numeric",
            month: "numeric",
            year: "2-digit",
            hour12: true,
            hour: "numeric",
            minute: "2-digit",
          }).format(props.getValue())}
          {/*props.getValue().toLocaleString()*/}
        </span>
      );
    },
    filterFn: "dateRange",
    sortingFn: "datetime",
  },
  {
    accessorKey: "exercises",
    header: "Exercises",
    cell: (props: CellContext<Schema, any>) => {
      return (
        <span>
          {props.getValue().length}
        </span>
      )
    },
    filterFn: "includesExercise"
  },
];
