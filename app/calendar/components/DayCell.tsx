"use client";

import React from 'react';
import { format, isToday, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type DayCellProps = {
  date: Date;
  isCurrentMonth: boolean;
  isStart: boolean | null | undefined;
  isEnd: boolean | null | undefined;
  isBetween: boolean | null | undefined;
  isPreview: boolean | null | undefined;
  isPreviewEnd: boolean | null | undefined;
  isSelected: boolean | null | undefined;
  onSelect: (date: Date) => void;
  onHover: (date: Date | null) => void;
  onDoubleClick?: (date: Date) => void;
  paperText?: string;
  calendarData?: any[];
};

const DayCell = ({
  date, isCurrentMonth,
  isStart, isEnd, isBetween, isPreview, isPreviewEnd, isSelected,
  onSelect, onHover, onDoubleClick, paperText, calendarData = [],
}: DayCellProps) => {
  const today = isToday(date);
  const isActive = isStart || isEnd;

  // Filter and sort for consistent "lanes" across cells
  const dayEvents = calendarData
    .filter(item => {
      if (item.type !== 'event') return false;
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const s = new Date(item.startDate);
      s.setHours(0, 0, 0, 0);
      if (!item.endDate) return d.getTime() === s.getTime();
      const e = new Date(item.endDate);
      e.setHours(0, 0, 0, 0);
      return d >= s && d <= e;
    })
    .sort((a, b) => (a.id || a.key).localeCompare(b.id || b.key));

  const lastClickRef = React.useRef<number>(0);

  const handleClick = () => {
    const now = Date.now();
    onSelect(date); // Always select on first/any click

    if (now - lastClickRef.current < 300) {
      onDoubleClick?.(date); // Trigger view modal on double tap
      lastClickRef.current = 0;
    } else {
      lastClickRef.current = now;
    }
  };

  return (
    <div
      className="relative flex h-14 sm:h-20 w-full cursor-pointer flex-col py-1 transition-all duration-150 select-none border-[0.5px]"
      style={{
        opacity: !isCurrentMonth ? 0.25 : 1,
        background: isBetween
          ? 'var(--cal-primary)15'
          : isPreview
            ? 'var(--cal-primary)10'
            : 'transparent',
        borderColor: 'var(--cal-border)',
        minWidth: 0,
        touchAction: 'manipulation'
      }}
      onClick={handleClick}
      onMouseEnter={() => onHover(date)}
    >
      {/* Date header line */}
      <div className="flex justify-between items-start mb-1 px-1">
        <span
          className={cn(
            'relative z-10 w-6 h-6 flex items-center justify-center rounded-full text-[10px] sm:text-[12px] font-black transition-all',
            today && !isActive && 'ring-2 ring-emerald-500 text-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
            isActive && 'bg-[var(--cal-primary)] text-white shadow-lg scale-110'
          )}
          style={{
            color: (isActive) ? '#fff' : (today && !isActive) ? '#10b981' : paperText || 'inherit'
          }}
        >
          {format(date, 'd')}
        </span>
      </div>

      {/* Events List (Continuous Ranges) */}
      <div className="flex-1 space-y-0.5 overflow-hidden">
        {dayEvents.slice(0, 3).map((ev, idx) => {
          const isStart = isSameDay(date, new Date(ev.startDate));
          const isEnd = ev.endDate ? isSameDay(date, new Date(ev.endDate)) : true;
          // Standard calendars only show text on the first day
          const showText = isStart;

          return (
            <div
              key={(ev.id || ev.key) + idx}
              className={cn(
                "text-[8px] sm:text-[10px] leading-none flex items-center justify-center h-5 sm:h-6 transition-all text-white shadow-sm font-black z-[5] px-1",
                isStart ? "rounded-l-xl ml-1" : "-ml-[1px]",
                isEnd ? "rounded-r-xl mr-1" : "-mr-[1px]"
              )}
              style={{
                background: 'var(--cal-primary)',
                opacity: 0.95,
                borderLeft: !isStart ? 'none' : undefined,
                borderRight: !isEnd ? 'none' : undefined,
              }}
              title={ev.text}
            >
              <span className="truncate whitespace-nowrap overflow-hidden">
                {ev.text}
              </span>
            </div>
          );
        })}
        {dayEvents.length > 3 && (
          <div className="text-[7px] sm:text-[8px] font-black opacity-40 px-1.5">
            + {dayEvents.length - 3} MORE
          </div>
        )}
      </div>

      {/* Active selection markers */}
      {isActive && (
        <motion.div
          layoutId={isStart ? 'range-start' : isEnd ? 'range-end' : undefined}
          className="absolute inset-0 border-2 border-[var(--cal-primary)] pointer-events-none rounded-sm z-[2]"
        />
      )}
    </div>
  );
};

export default React.memo(DayCell);
