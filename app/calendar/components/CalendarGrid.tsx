import React from 'react';
import { eachDayOfInterval, endOfMonth, endOfWeek, isSameMonth, startOfMonth, startOfWeek, addMonths, subMonths, format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DayCell from './DayCell';
import { DateRange } from '../hooks/useDateRange';

type CalendarGridProps = {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  getDayState: (date: Date) => any;
  onSelect: (date: Date) => void;
  onHover: (date: Date | null) => void;
};

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function CalendarGrid({ currentMonth, onMonthChange, getDayState, onSelect, onHover }: CalendarGridProps) {
  // Calculate grid dates
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="flex flex-col w-full p-4 sm:p-6 bg-white dark:bg-zinc-900 rounded-b-xl shadow-lg border border-zinc-100 dark:border-zinc-800" onMouseLeave={() => onHover(null)}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 uppercase">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
          <button 
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </div>

      {/* WeekDays Header */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-[var(--primary)] mb-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-2 justify-items-center">
        {days.map((day, i) => {
          const state = getDayState(day);
          return (
            <DayCell
              key={day.toISOString() + i}
              date={day}
              isCurrentMonth={isSameMonth(day, currentMonth)}
              {...state}
              onSelect={onSelect}
              onHover={onHover}
            />
          );
        })}
      </div>
    </div>
  );
}
