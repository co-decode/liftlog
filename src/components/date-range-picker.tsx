import React, { ChangeEventHandler, Dispatch, SetStateAction, useState } from 'react';

import { format, isAfter, isBefore, isValid, parse } from 'date-fns';
import {
  DateRange,
  SelectRangeEventHandler
} from 'react-day-picker';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Input } from './ui/input';
import { ColumnFiltersState } from '@tanstack/react-table';

interface DateRangePickerProps {
  columnFilters?: ColumnFiltersState
  setColumnFilters?: Dispatch<SetStateAction<ColumnFiltersState>>
  dateState?: [number, number]
  setDateState?: Dispatch<SetStateAction<[number, number]>>
}

export default function DateRangePicker({ columnFilters, setColumnFilters, dateState, setDateState }: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>();
  const [fromValue, setFromValue] = useState<string>('');
  const [toValue, setToValue] = useState<string>('');

  const handleFromChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setFromValue(e.target.value);
    const date = parse(e.target.value, 'y-MM-dd', new Date());
    if (!isValid(date)) {
      return setSelectedRange({ from: undefined, to: undefined });
    }
    if (selectedRange?.to && isAfter(date, selectedRange.to)) {
      setSelectedRange({ from: selectedRange.to, to: date });
    } else {
      setSelectedRange({ from: date, to: selectedRange?.to });
    }
  };

  const handleToChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setToValue(e.target.value);
    const date = parse(e.target.value, 'y-MM-dd', new Date());

    if (!isValid(date)) {
      return setSelectedRange({ from: selectedRange?.from, to: undefined });
    }
    if (selectedRange?.from && isBefore(date, selectedRange.from)) {
      setSelectedRange({ from: date, to: selectedRange.from });
    } else {
      setSelectedRange({ from: selectedRange?.from, to: date });
    }
  };

  const handleRangeSelect: SelectRangeEventHandler = (
    range: DateRange | undefined
  ) => {
    setSelectedRange(range);
    if (range?.from) {
      setFromValue(format(range.from, 'y-MM-dd'));
    } else {
      setFromValue('');
    }
    if (range?.to) {
      setToValue(format(range.to, 'y-MM-dd'));
    } else {
      setToValue('');
    }
  };

  function handleClose(open: boolean) {
    if (setColumnFilters && columnFilters) {
      if (!open && selectedRange?.from && selectedRange.to)
        setColumnFilters([
          ...columnFilters,
          {
            id: "date",
            value: [selectedRange?.from?.getTime(), selectedRange?.to?.getTime()]
          }
        ])
    }
    else if (dateState && setDateState) {
      if (!open && selectedRange?.from && selectedRange.to)
        setDateState([
          selectedRange.from.getTime(),
          selectedRange.to.getTime()
        ])
    }
  }

  return (
    <Popover onOpenChange={handleClose}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "text-left font-normal w-[190px] ",
          )}
        >
          <DateFilter selectedRange={selectedRange} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={selectedRange}
          onSelect={handleRangeSelect}
          footer={
            <form className="ma2 flex items-center">
              <Input
                size={3}
                placeholder="From Date"
                value={fromValue}
                onChange={handleFromChange}
              />
              <span className=''>
                :
              </span>
              <Input
                size={3}
                placeholder="To Date"
                value={toValue}
                onChange={handleToChange}
              />
            </form>
          }
        />
      </PopoverContent>
    </Popover>
  );
}

interface DateFilterProps {
  selectedRange: DateRange | undefined
}

function DateFilter({ selectedRange }: DateFilterProps) {
  return (
    <>
      <CalendarIcon className="h-4 w-4 mr-2" />
      <div className='grid grid-cols-[1fr_min-content_1fr] grow justify-items-center'>
        <span>
          {
            `${selectedRange?.from
              ? new Intl.DateTimeFormat([], {
                day: "numeric",
                month: "numeric",
                year: "2-digit",
              }).format(selectedRange?.from)
              : "From"
            }`}
        </span>
        <span>:</span>
        <span>
          {`${selectedRange?.to
            ? new Intl.DateTimeFormat([], {
              day: "numeric",
              month: "numeric",
              year: "2-digit",
            }).format(selectedRange?.to)
            : "To"
            }`
          }
        </span>
      </div>
    </>
  )
}
