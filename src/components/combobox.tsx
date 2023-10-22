import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CommandList } from "@/components/ui/command";
import { UseFieldArrayUpdate, UseFormSetValue } from "react-hook-form";
import { Program } from "@/components/programs/add-and-edit";

const frameworks = [
  {
    value: "deadlift",
    label: "deadlift",
  },
  {
    value: "squat",
    label: "squat",
  },
  {
    value: "back extension",
    label: "back extension",
  },
  {
    value: "bench press",
    label: "bench press",
  },
  {
    value: "pull up",
    label: "pull up",
  },
  {
    value: "overhead press",
    label: "overhead press",
  },
  {
    value: "calf raise",
    label: "calf raise",
  },
  {
    value: "incline curl",
    label: "incline curl",
  },
  {
    value: "french press",
    label: "french press",
  },
  {
    value: "incline dumbbell press",
    label: "incline dumbbell press",
  },
  {
    value: "bulgarian split squat",
    label: "bulgarian split squat",
  },
  {
    value: "bicep curl",
    label: "bicep curl",
  },
  {
    value: "skull crusher",
    label: "skull crusher",
  },
  {
    value: "dip",
    label: "dip",
  },
  {
    value: "push up",
    label: "push up",
  },
  {
    value: "barbell row",
    label: "barbell row",
  },
  {
    value: "dumbbell row",
    label: "dumbbell row",
  },
  {
    value: "lateral raise",
    label: "lateral raise",
  },
  {
    value: "front raise",
    label: "front raise",
  },
  {
    value: "seated press",
    label: "seated press",
  },
  {
    value: "skullcrusher",
    label: "skullcrusher",
  },

];

interface ComboboxProps {
  value: string | undefined;
  setValue?: React.Dispatch<React.SetStateAction<string | undefined>>;
  programSetValue?: UseFieldArrayUpdate<Program, `programSessions.${number}.programSets.${number}.sets`>
  programIndex?: number
  edit?: "BREAKDOWN" | "EDIT"
  currentExercises: string[]

}

export function Combobox({ value, setValue, currentExercises, programSetValue, programIndex, edit }: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState(frameworks.slice(0, 2));

  React.useEffect(() => {
    setSearchResults(frameworks.filter((val) => !currentExercises?.includes(val.value)).slice(0, 2))
  }, [currentExercises])

  const handleSearch = (e: string) => {
    setSearchResults(
      frameworks.filter((val) =>
        val.value.includes(e.toLowerCase()) && !currentExercises?.includes(val.value)
      ).slice(0, 2)
    );
  };

  const handleSelect = (currentValue: string) => {
    if (setValue)
      setValue(currentValue === value ? "" : currentValue);
    else if (programSetValue && programIndex !== undefined) {
      programSetValue(programIndex, { exerciseName: currentValue })
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] capitalize justify-between", !value && "text-primary/50")}
          disabled={edit === "BREAKDOWN"}
        >
          {/*value
            ? frameworks.find((framework) => framework.value === value)?.label
            : "Add Exercise..."*/}
          {setValue ? value || "Add Exercise..." : value || "Choose Exercise..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command shouldFilter={false}>
          <CommandInput onValueChange={handleSearch} placeholder="Search framework..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {searchResults.map((framework) => (
                <CommandItem
                  key={framework.value}
                  className="capitalize"
                  onSelect={(currentValue) => handleSelect(currentValue)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
