import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { FormControl } from "./ui/form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "./ui/input"

interface DatePickerProps {
  date: Date | undefined
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>
  edit?: string
}

export function DatePicker({ date, setDate, edit }: DatePickerProps) {
  const [time, setTime] = React.useState<string>()

  const handleTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target) return
    setTime(e.target.value)
    if (!date) return
    const dateObject = new Date(date.getTime())
    const [hours, minutes] = e.target.value.split(":")
    dateObject.setHours(Number(hours))
    dateObject.setMinutes(Number(minutes))
    setDate(dateObject)
  }

  const handleDate = (e: Date | undefined) => {
    if (!e) return setDate(e)
    if (!time) return setDate(e)
    const dateObject = new Date(e.getTime())
    const [hours, minutes] = time.split(":")
    dateObject.setHours(Number(hours))
    dateObject.setMinutes(Number(minutes))
    setDate(dateObject)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
      <FormControl>
        <Button
          variant={"outline"}
          disabled={edit === "BREAKDOWN"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPp") : <span>Pick a date and time</span>}
        </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(e) => handleDate(e)}
          initialFocus
        />
        <Input
        className="m-2 w-auto inline"
          type="time"
          defaultValue="00:00"
          onChange={(e) => handleTime(e)}
        />
      </PopoverContent>
    </Popover>
  )
}

