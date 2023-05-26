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
];

interface ComboboxProps {
  value: string | undefined;
  setValue: React.Dispatch<React.SetStateAction<string | undefined>>;
  currentExercises: string[]
}

export function Combobox({ value, setValue, currentExercises }: ComboboxProps) {
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] capitalize justify-between"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : "Add Exercise..."}
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
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
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
