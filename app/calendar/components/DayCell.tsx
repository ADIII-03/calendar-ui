import React from 'react';
import { format, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils'; // Assuming shadcn initialized 'utils'

type DayCellProps = {
  date: Date;
  isCurrentMonth: boolean;
  isStart: boolean;
  isEnd: boolean;
  isBetween: boolean;
  isPreview: boolean;
  isPreviewEnd: boolean;
  isSelected: boolean;
  onSelect: (date: Date) => void;
  onHover: (date: Date | null) => void;
};

// Pure UI Component
const DayCell = ({
  date,
  isCurrentMonth,
  isStart,
  isEnd,
  isBetween,
  isPreview,
  isPreviewEnd,
  isSelected,
  onSelect,
  onHover
}: DayCellProps) => {
  const today = isToday(date);

  return (
    <div
      className={cn(
        "relative flex h-10 w-10 sm:h-12 sm:w-12 cursor-pointer items-center justify-center font-medium transition-colors",
        !isCurrentMonth && "text-muted-foreground/30",
        isCurrentMonth && !isSelected && "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        isBetween && "bg-[var(--primary)]/10 text-[var(--primary)] font-bold",
        isPreview && "bg-[var(--primary)]/5 border-y border-[var(--primary)]/20 border-dashed"
      )}
      onClick={() => onSelect(date)}
      onMouseEnter={() => onHover(date)}
      // Support keyboard nav via simple tab selection natively handled later
    >
      {/* Background shapes for Start/End */}
      {(isStart || isEnd || isPreviewEnd) && (
        <motion.div
           layoutId={isStart ? "start-bg" : isEnd ? "end-bg" : undefined}
           className={cn(
            "absolute inset-0 m-1 rounded-full",
             (isStart || isEnd) && "bg-[var(--primary)] shadow-md",
             isPreviewEnd && "border-2 border-dashed border-[var(--primary)]"
           )}
           transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      )}

      {/* Today Pulse Indicator */}
      {today && !isSelected && (
        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[var(--accent)] animate-pulse" />
      )}

      {/* Date text (bring to front) */}
      <span className={cn(
        "relative z-10",
        (isStart || isEnd) && "text-white",
        today && isSelected && "text-white"
      )}>
        {format(date, 'd')}
      </span>
    </div>
  );
};

export default React.memo(DayCell);
