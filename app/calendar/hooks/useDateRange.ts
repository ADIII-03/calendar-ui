import { useState } from 'react';
import { isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';

export type DateRange = {
  start: Date | null;
  end: Date | null;
};

export function useDateRange() {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date) => {
    const selected = startOfDay(date);

    if (!range.start) {
      setRange({ start: selected, end: null });
    } else if (!range.end && isAfter(selected, range.start)) {
      setRange({ start: range.start, end: selected });
    } else if (!range.end && isSameDay(selected, range.start)) {
      // Toggle off if clicking the same start date again
      setRange({ start: null, end: null });
    } else {
      // Reset and start again if clicking a before-date or clicking when both exist
      setRange({ start: selected, end: null });
    }
  };

  const handleDateHover = (date: Date | null) => {
    setHoverDate(date ? startOfDay(date) : null);
  };

  const resetRange = () => {
    setRange({ start: null, end: null });
    setHoverDate(null);
  };

  // Helper to determine the state of a specific day cell
  const getDayState = (date: Date) => {
    const cellDate = startOfDay(date);
    
    const isStart = range.start && isSameDay(cellDate, range.start);
    const isEnd = range.end && isSameDay(cellDate, range.end);
    
    const isBetween = 
      range.start && range.end &&
      isAfter(cellDate, range.start) && isBefore(cellDate, range.end);
      
    const isPreview = 
      range.start && !range.end && hoverDate && 
      isAfter(cellDate, range.start) && isBefore(cellDate, hoverDate);
      
    const isPreviewEnd = 
      range.start && !range.end && hoverDate && 
      isSameDay(cellDate, hoverDate) && isAfter(hoverDate, range.start);

    return {
      isStart,
      isEnd,
      isBetween,
      isPreview,
      isPreviewEnd,
      isSelected: isStart || isEnd || isBetween
    };
  };

  return {
    range,
    hoverDate,
    handleDateSelect,
    handleDateHover,
    resetRange,
    getDayState
  };
}
