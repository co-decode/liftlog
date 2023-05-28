"use client";

import { CellContext, ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
const SetSchema = z.object({
  reps: z.number(),
  weight: z.string(),
});

const ExerciseSchema = z.object({
  name: z.string(),
  sets: z.array(SetSchema),
});

const ExerciseSessionSchema = z.object({
  date: z.string(),
  exercises: z.array(ExerciseSchema),
});

export type Schema = z.infer<typeof ExerciseSessionSchema>;

export const columns: ColumnDef<Schema>[] = [
  {
    accessorKey: "alias",
    header: "Alias",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: (props: CellContext<Schema, any>) => {
      const formatDate = new Date(props.getValue());

      return (
        <span>
          {new Intl.DateTimeFormat([], {
            weekday: "short",
            day: "numeric",
            month: "numeric",
            year: "2-digit",
            hour12: false,
            hour: "numeric",
            minute: "2-digit",
          }).format(formatDate)}
        </span>
      );
    },
  },
];
