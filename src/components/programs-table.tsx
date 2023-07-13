import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { z } from "zod";
import { useRouter } from "next/router";

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

export type Schema = z.infer<typeof ProgramSchema>


interface DataTableProps {
  columns: ColumnDef<Schema>[]
  data: Schema[]
  className: string
}

export function DataTable({
  columns,
  data,
  className
}: DataTableProps) {
  const router = useRouter()
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: { // filterFns currently unused for this component
      dateRange: () => true,
      includesExercise: () => true,
    },
  })

  function handleClick(row: Row<Schema>) {
    console.log(row.original)
    router.push(`/programs/name-${row.original.programName}`)
  }

  return (
    <div className={"grid justify-center " + className}>
      <Table className="max-w-lg w-[min(32rem,95vw)] min-w-[300px] border rounded-m">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="text-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:cursor-pointer relative"
                onClick={() => handleClick(row)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

