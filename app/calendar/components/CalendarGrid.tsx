"use client";

import React from 'react';
import {
  isSameMonth, startOfMonth, startOfWeek,
  addMonths, subMonths, format, addDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DayCell from './DayCell';

type CalendarGridProps = {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  getDayState: (date: Date) => any;
  onSelect: (date: Date) => void;
  onHover: (date: Date | null) => void;
  onDoubleClick?: (date: Date) => void;
  // Theme-aware colours
  paperBg?: string;
  paperText?: string;
  borderColor?: string;
  calendarData?: any[];
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({
  currentMonth, onMonthChange, getDayState, onSelect, onHover, onDoubleClick,
  paperBg, paperText, borderColor, calendarData = [],
}: CalendarGridProps) {
  // Always render exactly 42 cells (6 full weeks) - prevents height jumping
  const startDate = startOfWeek(startOfMonth(currentMonth));
  const days = Array.from({ length: 42 }, (_, i) => addDays(startDate, i));

  return (
    <div
      className="flex flex-col w-full p-4 sm:p-6 select-none"
      style={{ background: paperBg, color: paperText }}
      onMouseLeave={() => onHover(null)}
    >
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2
          className="text-xl sm:text-2xl font-black tracking-tight uppercase"
          style={{ color: paperText }}
        >
          {format(currentMonth, 'MMM yyyy')}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            className="p-2 rounded-full transition-colors hover:opacity-70"
            style={{ color: paperText, border: `1px solid ${borderColor}` }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            className="p-2 rounded-full transition-colors hover:opacity-70"
            style={{ color: paperText, border: `1px solid ${borderColor}` }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-3" style={{ borderTop: `1px solid ${borderColor}` }} />

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] sm:text-xs font-bold py-1 tracking-widest uppercase"
            style={{ color: 'var(--cal-primary)' }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 42 Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5 gap-x-0 justify-items-center">
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
              onDoubleClick={onDoubleClick}
              paperText={paperText}
              calendarData={calendarData}
            />
          );
        })}
      </div>
    </div>
  );
}
