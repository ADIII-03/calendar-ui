import React, { useState, useRef } from 'react';
import { useDateRange } from '../hooks/useDateRange';
import { useCalendarTheme } from '../hooks/useCalendarTheme';
import CalendarGrid from './CalendarGrid';
import NotesSection from './NotesSection';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

export default function WallCalendar() {
  const { range, hoverDate, handleDateSelect, handleDateHover, getDayState } = useDateRange();
  const { activeTheme, setActiveTheme, themes } = useCalendarTheme();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [flipDirection, setFlipDirection] = useState(0);

  // Parallax Mechanics
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for mouse movement
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Transform constraints: tiny tilt
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Normalize coordinates from -0.5 to 0.5
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const changeMonth = (newDate: Date) => {
    setFlipDirection(newDate > currentMonth ? 1 : -1);
    setCurrentMonth(newDate);
  };

  return (
    <div 
      className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 md:p-12 overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      {/* Dynamic Theme Selection Rings */}
      <div className="absolute top-4 right-4 flex gap-3 z-50">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setActiveTheme(theme)}
            className={`w-8 h-8 rounded-full border-2 transition-transform ${activeTheme.id === theme.id ? 'scale-125 border-zinc-900 dark:border-white shadow-lg' : 'border-transparent shadow-sm'}`}
            style={{ backgroundColor: theme.primary }}
            title={`Switch to ${theme.id} layout`}
          />
        ))}
      </div>

      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 transition-shadow duration-500 ease-out hover:shadow-4xl"
      >
        {/* Left/Top Hero Image Panel */}
        <div className="md:w-5/12 h-[250px] md:h-auto relative overflow-hidden flex-shrink-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeTheme.image}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              src={activeTheme.image}
              className="absolute inset-0 w-full h-full object-cover"
              alt="Calendar hero"
            />
          </AnimatePresence>
          {/* Glass Overlay on image for brand/title */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
            <h1 className="text-white text-3xl font-black tracking-tighter">Wall Calendar</h1>
            <p className="text-zinc-200 text-sm font-medium opacity-90 mt-1">Inspired by true physical design.</p>
          </div>
        </div>

        {/* Right/Bottom Calendar Panel */}
        <div className="md:w-7/12 flex flex-col relative bg-zinc-50 dark:bg-zinc-950" style={{ transformStyle: "preserve-3d" }}>
          {/* Flip Animation Container */}
          <div className="relative flex-1" style={{ transformStyle: "preserve-3d" }}>
             <AnimatePresence custom={flipDirection} mode="wait">
                <motion.div
                  key={currentMonth.toISOString()}
                  custom={flipDirection}
                  initial={(direction) => ({
                    rotateX: direction > 0 ? 90 : -90,
                    opacity: 0,
                    transformOrigin: "top"
                  })}
                  animate={{
                    rotateX: 0,
                    opacity: 1,
                    transformOrigin: "top"
                  }}
                  exit={(direction) => ({
                    rotateX: direction > 0 ? -90 : 90,
                    opacity: 0,
                    transformOrigin: "bottom"
                  })}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="w-full"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <CalendarGrid
                    currentMonth={currentMonth}
                    onMonthChange={changeMonth}
                    getDayState={getDayState}
                    onSelect={handleDateSelect}
                    onHover={handleDateHover}
                  />
                </motion.div>
             </AnimatePresence>
          </div>

          <div className="px-4 pb-4 md:px-6 md:pb-6">
            <NotesSection range={range} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
