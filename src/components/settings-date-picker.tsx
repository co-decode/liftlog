import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAuth } from "./auth-and-context"

type Form = { startDate: Date, programId: number, programName: string }

interface DatePickerProps {
  currentProgramForm: Form,
  setCurrentProgramForm: React.Dispatch<React.SetStateAction<Form>>
  disabled: boolean
}

export function DatePicker({ currentProgramForm, setCurrentProgramForm, disabled }: DatePickerProps) {
  const { currentProgram, setCurrentProgram } = useAuth()
  const handleDate = (e: Date | undefined) => {
    if (!setCurrentProgram || !e) return;
    //setCurrentProgram({ ...currentProgram, startDate: e })
    if (setCurrentProgramForm && currentProgramForm)
    setCurrentProgramForm({ ...currentProgramForm, startDate: e })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-[200px] justify-start text-left font-normal",
            !currentProgram?.startDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {currentProgramForm?.startDate
            ? format(currentProgramForm.startDate, "PPP")
            : <span>Pick a date</span>
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={currentProgramForm?.startDate}
          onSelect={handleDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

