"use client";

import { CellContext, ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
const ExerciseSchema = z.object({
  setIndex: z.number(),
  exerciseIndex: z.number(),
  exerciseName: z.string()
});

const SessionSchema = z.object({
  name: z.string(),
  programSets: z.array(ExerciseSchema),
});

const ProgramSchema = z.object({
  splitLength: z.number(),
  programName: z.string(),
  programSessions: z.array(SessionSchema),
});

export type Schema = z.infer<typeof ProgramSchema>;

export const columns: ColumnDef<Schema>[] = [
  {
    accessorKey: "programName",
    header: "Name",
  },
  {
    accessorKey: "splitLength",
    header: "Split",
  },
  {
    accessorKey: "programSessions",
    header: "Sessions",
    cell: (props: CellContext<Schema, any>) => {
      const sessionsNumber = props.getValue().length
      return (<span>{sessionsNumber}</span>)
    }
  },
];
