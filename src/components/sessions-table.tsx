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

export type Schema = z.infer<typeof ExerciseSessionSchema>


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
  })

  function handleClick(row: Row<Schema>) {
    console.log(row.original)
  }

  return (
    <div className={"rounded-md border " + className}>
      <Table>
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
                    <Popover>
                      <PopoverTrigger className="absolute h-full w-full top-0 left-0">
                        <span className="absolute left-0 invisible">Open</span>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => router.push(`/sessions/${row.original.date}`)}
                      >
                        {row.original.exercises.map((ex: z.infer<typeof ExerciseSchema>)  =>
                          <div key={ex.name} className="capitalize">
                            {ex.name}:&nbsp;{String(ex.sets.reduce((a,v) => {
                              const setTonnage = v.reps * Number(v.weight)
                              return a + setTonnage
                              }, 0))}&nbsp;kg
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
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

