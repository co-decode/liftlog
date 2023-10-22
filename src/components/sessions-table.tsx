import {
  ColumnDef,
  ColumnFiltersState,
  getFilteredRowModel,
  paginationState,
  getPaginationRowModel,

  Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
  FilterFn,
  SortingState,
  getSortedRowModel,
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
import { useAuth } from "./auth-and-context";
import { useEffect, useState } from "react";
import DateRangePicker from "./date-range-picker";
import { Icons } from "./icons";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

const SetSchema = z.object({
  reps: z.number(),
  weight: z.number(),
});

const ExerciseSchema = z.object({
  name: z.string(),
  sets: z.array(SetSchema),
});

const ExerciseSessionSchema = z.object({
  date: z.coerce.date(),
  exercises: z.array(ExerciseSchema),
});

export type Schema = z.infer<typeof ExerciseSessionSchema>


interface DataTableProps {
  columns: ColumnDef<Schema>[]
  data: Schema[]
  className: string
}

const dateRange: FilterFn<any> = (
  row,
  columnId: string,
  filterValue: [number, number]
) => {
  let [min, max] = filterValue
  if (!max || !min) return true

  const rowValue = row.getValue<Date>(columnId).getTime()
  return rowValue >= min && rowValue <= max
}

const includesExercise: FilterFn<any> = (
  row,
  columnId: string,
  filterValue: string
) => {
  const rowValue = row.getValue<Schema["exercises"]>(columnId)

  return rowValue.some(ex => ex.name === filterValue)
}

export function DataTable({
  columns,
  data,
  className
}: DataTableProps) {
  const router = useRouter()
  const { weightUnit } = useAuth()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = useState<SortingState>([{
    id: "date",
    desc: true,
  }])
  const table = useReactTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      columnFilters,
      sorting
    },
    filterFns: {
      dateRange,
      includesExercise
    }
  })
  function handleClick(row: Row<Schema>) {
    console.log(row.original)
  }
  useEffect(() => {
    table.setPageSize(5)
  }, [table])

  return (
    <div className={"grid justify-center gap-3 " + className}>
      <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
        Sessions
      </h2>
      <div className="text-lg font-semibold flex items-center gap-3">
        <DateRangePicker columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
      </div>
      <Table className="max-w-lg w-[min(32rem,95vw)] min-w-[300px] border rounded-m">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn("text-center select-none", header.id === "date" ? "cursor-pointer" : "pointer-events-none")}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    {header.id === "date"
                      ? header.column.getIsSorted() as string === "desc"
                        ? <Icons.arrowDown className="h-4 w-4 inline absolute mt-0.5 ml-3" />
                        : header.column.getIsSorted() as string === "asc"
                          ? <Icons.arrowUp className="h-4 w-4 inline absolute mt-0.5 ml-3" />
                          : null
                      : null
                    }

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
                        role="button"
                        onClick={() => router.push(`/sessions/${row.original.date.toISOString()}`)}
                      >
                        {row.original.exercises.map((ex: z.infer<typeof ExerciseSchema>) =>
                          <div key={ex.name} className="capitalize">
                            {ex.name}:&nbsp;{String(Math.floor(ex.sets.reduce((a, v) => {
                              const setTonnage = v.reps * Number(v.weight)
                              return a + setTonnage
                            }, 0) * (weightUnit === "KG" ? 1 : 2.205)))}{` ${weightUnit}`}

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
      <div className="flex items-center gap-2">
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={e => {
            table.setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
function ExerciseFilter() {
  return (
    <Popover>
      <PopoverTrigger className="absolute top-0 left-0">
        <span className="absolute left-0 invisible">Open</span>
      </PopoverTrigger>
      <PopoverContent
        className="cursor-pointer hover:bg-muted"
        role="button"
        onClick={() => console.log('blah')}
      >
      </PopoverContent>
    </Popover>
  )
}
