"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDateRange } from '../hooks/useDateRange';
import { useCalendarTheme, CalendarTheme } from '../hooks/useCalendarTheme';
import CalendarGrid from './CalendarGrid';
import NotesModal from './NotesModal';
import NotesHistory from './NotesHistory';
import ViewEventsModal from './ViewEventsModal';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { BookOpen, PlusCircle } from 'lucide-react';
import { isSameDay } from 'date-fns';

// ─── Constants ───────────────────────────────────────────────────────────────
const flipVariants = {
  initial: (dir: number) => ({
    rotateX: dir > 0 ? -90 : 90,
    opacity: 0,
    y: dir > 0 ? -12 : 12,
    transformOrigin: 'top center',
  }),
  animate: {
    rotateX: 0,
    opacity: 1,
    y: 0,
    transformOrigin: 'top center',
    transition: { duration: 0.52, ease: [0.22, 0.6, 0.36, 1] as const },
  },
  exit: (dir: number) => ({
    rotateX: dir > 0 ? 90 : -90,
    opacity: 0,
    y: dir > 0 ? 12 : -12,
    transformOrigin: 'bottom center',
    transition: { duration: 0.4, ease: [0.64, 0, 0.78, 0] as const },
  }),
};

const monthlyImages = [
  "https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=1200&auto=format&fit=crop&q=80", // Jan
  "https://images.unsplash.com/photo-1457269449834-928af64c684d?w=1200&auto=format&fit=crop&q=80", // Feb
  "https://images.unsplash.com/photo-1458682625221-3a45f8a844c7?w=1200&auto=format&fit=crop&q=80", // Mar
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1200&auto=format&fit=crop&q=80", // Apr
  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80", // May
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80", // Jun
  "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1200&auto=format&fit=crop&q=80", // Jul
  "https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=1200&auto=format&fit=crop&q=80", // Aug
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80", // Sep
  "https://images.unsplash.com/photo-1477414956199-7dafc86a4f1a?w=1200&auto=format&fit=crop&q=80", // Oct
  "https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&auto=format&fit=crop&q=80", // Nov
  "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=1200&auto=format&fit=crop&q=80", // Dec
];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ─── Visual Air Flow (Wind Streaks) ──────────────────────────────────────────
function AirFlow({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-x-0 top-1/4 bottom-1/4 pointer-events-none z-[5] overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: '-100%', opacity: 0, scaleY: 0.5 }}
          animate={{ 
            x: '250%', 
            opacity: [0, 0.4, 0.4, 0],
            scaleY: [0.5, 1, 1, 0.5] 
          }}
          transition={{ 
            duration: 1.5, 
            delay: i * 0.15, 
            ease: "easeInOut" 
          }}
          className="absolute h-[1.5px] bg-white/30 rounded-full"
          style={{
            width: 150 + Math.random() * 200,
            top: `${(i / 6) * 100}%`,
            left: '10%',
            filter: 'blur(1px)',
            boxShadow: '0 0 10px rgba(255,255,255,0.2)'
          }}
        />
      ))}
    </div>
  );
}

// ─── Wall Window component (Themed) ───────────────────────────────────────────
function WallWindow({ theme }: { theme: CalendarTheme }) {
  return (
    <div
      className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 z-[1]"
      style={{ width: 220, height: 280 }}
    >
      {/* Wooden/Metallic frame shadow */}
      <div className="absolute inset-0 translate-x-4 translate-y-4 bg-black/40 blur-2xl rounded-lg" />

      {/* Frame */}
      <div
        className="w-full h-full rounded-lg overflow-hidden relative"
        style={{
          border: `12px solid ${theme.windowFrame}`,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 0 12px rgba(0,0,0,0.4)',
        }}
      >
        {/* Sky / Scenery */}
        <div className="absolute inset-0" style={{ background: theme.windowScenery }} />

        {/* The Sun / Moon */}
        <div
          className="absolute"
          style={{
            top: 25, right: 35,
            width: 40, height: 40,
            borderRadius: '50%',
            background: `radial-gradient(circle, #fff 10%, ${theme.windowSun} 70%)`,
            boxShadow: `0 0 25px 5px ${theme.windowSun}44`,
          }}
        />

        {/* Scenic Details (Mountains/Hills) */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none" style={{ opacity: theme.windowDetailAlpha }}>
          <div className="absolute bottom-6 left-0 right-0 h-full bg-black/30" 
               style={{ clipPath: 'polygon(0 100%, 20% 30%, 45% 60%, 65% 15%, 85% 50%, 100% 25%, 100% 100%)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-black/40" 
               style={{ clipPath: 'polygon(0 100%, 15% 55%, 35% 75%, 55% 45%, 75% 65%, 90% 40%, 100% 60%, 100% 100%)' }} />
        </div>

        {/* Glass Reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

        {/* Window Bars */}
        <div className="absolute left-0 right-0 top-1/2 h-2 z-10 opacity-60" style={{ background: theme.windowFrame }} />
        <div className="absolute top-0 bottom-0 left-1/2 w-2 z-10 opacity-60" style={{ background: theme.windowFrame }} />
      </div>

      {/* Frame texture detail */}
      <div className="absolute inset-0 border-[2px] border-white/5 pointer-events-none" />
    </div>
  );
}

// ─── Nail Component ─────────────────────────────────────────────────────────────
function Nail() {
  return (
    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
      <div
        style={{
          width: 22, height: 22, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #fff, #777)',
          border: '2px solid #555',
          boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{ width: 10, height: 1, background: '#444', transform: 'rotate(45deg)' }} />
      </div>
      <div style={{ width: 2, height: 16, background: 'linear-gradient(to bottom, #999, #444)' }} />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function WallCalendar() {
  const { range, handleDateSelect: onSelect, handleDateHover, getDayState } = useDateRange();
  const { activeTheme, setActiveTheme, themes, mounted: themeMounted } = useCalendarTheme();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [flipDirection, setFlipDirection] = useState(0);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBreezing, setIsBreezing] = useState(false);
  const [calendarData, setCalendarData] = useState<any[]>([]);

  const isMounted = useRef(false);
  const calendarControls = useAnimation();

  const loadCalendarData = useCallback(() => {
    const items: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('calendar_notes_')) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              const datePart = key.replace('calendar_notes_', '');
              const [start, end] = datePart.split('_');
              
              // Handle both single objects (old) and arrays (new)
              const entries = Array.isArray(parsed) ? parsed : [parsed];
              
              entries.forEach(entry => {
                items.push({
                  ...entry,
                  key,
                  startDate: new Date(start),
                  endDate: end ? new Date(end) : undefined
                });
              });
            }
          } catch(e) {}
        }
    }
    setCalendarData(items);
  }, []);

  useEffect(() => {
    loadCalendarData();
    window.addEventListener('calendar_data_updated', loadCalendarData);
    return () => window.removeEventListener('calendar_data_updated', loadCalendarData);
  }, [loadCalendarData]);

  // ── Sync'd Jiggle animation ────────────────────────────────────────────────
  const triggerBreeze = useCallback(async () => {
    if (!isMounted.current || !calendarControls) return;

    setIsBreezing(true);
    
    // Wait for wind to "hit"
    await new Promise(r => setTimeout(r, 400));

    try {
      // Rapid "jiggle" sequence
      await calendarControls.start({
        rotate: -2.5,
        x: -2,
        transition: { duration: 0.15, ease: 'easeOut' }
      });
      await calendarControls.start({
        rotate: 2,
        x: 1,
        transition: { duration: 0.12, ease: 'easeInOut' }
      });
      await calendarControls.start({
        rotate: -1.2,
        transition: { duration: 0.1, ease: 'easeInOut' }
      });
      await calendarControls.start({
        rotate: 0.6,
        transition: { duration: 0.3, ease: 'easeOut' }
      });
      await calendarControls.start({
        rotate: 0,
        x: 0,
        transition: { duration: 0.6, ease: 'easeInOut' }
      });
    } catch (e) {}

    setTimeout(() => setIsBreezing(false), 2000);
  }, [calendarControls]);

  useEffect(() => {
    isMounted.current = true;
    
    const breezeLoop = () => {
      const timeout = setTimeout(() => {
        if (isMounted.current) {
          triggerBreeze();
          const interval = setInterval(() => {
            if (isMounted.current) triggerBreeze();
          }, 9000);
          return () => clearInterval(interval);
        }
      }, 5000);
      return () => clearTimeout(timeout);
    };

    const cleanup = breezeLoop();
    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [triggerBreeze]);

  const changeMonth = (newDate: Date) => {
    setFlipDirection(newDate > currentMonth ? 1 : -1);
    setCurrentMonth(newDate);
  };

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date) => {
    // Basic range selection logic is handled by useDateRange
    onSelect(date);
    // Single click only selects the date, doesn't open the modal
  };

  const handleDateDoubleClick = (date: Date) => {
    setViewDate(date);
    setIsViewModalOpen(true);
  };

  const heroImage = monthlyImages[currentMonth.getMonth()];
  const heroMonth = monthNames[currentMonth.getMonth()];

  // Filter events for the view modal
  const viewDayEvents = viewDate ? calendarData.filter(item => {
    if (item.type !== 'event' && item.type !== 'note') return false;
    const d = new Date(viewDate);
    d.setHours(0,0,0,0);
    const s = new Date(item.startDate);
    s.setHours(0,0,0,0);
    if (!item.endDate) return d.getTime() === s.getTime();
    const e = new Date(item.endDate);
    e.setHours(0,0,0,0);
    return d >= s && d <= e;
  }) : [];

  // Safety gate for hydration and animation setup
  if (!themeMounted) return <div className="min-h-screen bg-zinc-900" />;

  const wallStyle: React.CSSProperties = {
    backgroundColor: activeTheme.wallBg,
    backgroundImage: [
      activeTheme.wallPattern,
      activeTheme.wallOverlay ? `linear-gradient(${activeTheme.wallOverlay}, ${activeTheme.wallOverlay})` : null,
    ].filter(Boolean).join(', '),
    backgroundRepeat: 'repeat, no-repeat',
    backgroundSize: 'auto, cover',
    transition: 'background-color 0.8s ease',
  };

  return (
    <div
      className="h-screen flex flex-col items-center justify-center py-6 md:py-20 px-4 md:px-10 relative overflow-hidden"
      style={wallStyle}
    >
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />

      {/* 🌪️ Visual Air Flow 🌪️ */}
      <AirFlow active={isBreezing} />

      {/* 🖼️ Themed Window 🖼️ */}
      <WallWindow theme={activeTheme} />

      {/* Top Bar Navigation */}
      <div className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-black/20 border-b border-white/5 uppercase tracking-tighter">
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-full text-[10px] md:text-xs font-black shadow-2xl transition-all hover:scale-105 active:scale-95 bg-white/10 border border-white/20 text-white"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Saved Notes</span>
        </button>

        <div className="flex gap-1.5 md:gap-2.5">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTheme(t)}
              title={t.label}
              className="rounded-full transition-all duration-300"
              style={{
                width: 24, height: 24,
                backgroundColor: t.swatch,
                border: activeTheme.id === t.id ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                boxShadow: activeTheme.id === t.id ? `0 0 15px ${t.swatch}` : 'none',
                transform: activeTheme.id === t.id ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Hanging Calendar Structure */}
      <div className="relative w-full max-w-4xl mt-12 md:mt-16 z-10">
        <Nail />

        <motion.div
          animate={calendarControls}
          initial={{ rotate: 0, y: 0, opacity: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full rounded-3xl overflow-hidden flex flex-col md:flex-row bg-white/95"
          style={{
            background: activeTheme.calPaper,
            border: `1.5px solid ${activeTheme.calBorder}`,
            transformOrigin: 'top center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 5px 15px rgba(0,0,0,0.15)',
          }}
        >
          {/* Main Visual Panel */}
          <div className="md:w-5/12 h-32 md:h-auto md:min-h-[520px] relative overflow-hidden bg-black flex-shrink-0">
            <AnimatePresence mode="wait">
              <motion.img
                key={heroImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8 }}
                src={heroImage}
                className="absolute inset-0 w-full h-full object-cover"
                alt={heroMonth}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-black/25 mix-blend-overlay opacity-40 pointer-events-none"
                 style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\'/></filter><rect width=\'100\' height=\'100\' filter=\'url(%23n)\'/></svg>")' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <p className="text-white/60 text-[10px] md:text-xs font-black tracking-widest uppercase mb-1 md:mb-2">{heroMonth}</p>
              <h1 className="text-white text-3xl md:text-5xl font-black italic tracking-tighter leading-none">TUF CALENDAR</h1>
            </div>
          </div>

          {/* Grid Panel */}
          <div className="md:w-7/12 flex flex-col relative" style={{ color: activeTheme.calPaperText }}>
            <div className="relative flex-1 z-[2]" style={{ perspective: '1200px' }}>
              <AnimatePresence custom={flipDirection} mode="wait">
                <motion.div
                  key={currentMonth.toISOString()}
                  custom={flipDirection}
                  variants={flipVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <CalendarGrid
                    currentMonth={currentMonth}
                    onMonthChange={changeMonth}
                    getDayState={getDayState}
                    onSelect={handleDateSelect}
                    onHover={handleDateHover}
                    onDoubleClick={handleDateDoubleClick}
                    paperBg={activeTheme.calPaper}
                    paperText={activeTheme.calPaperText}
                    borderColor={activeTheme.calBorder}
                    calendarData={calendarData}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="h-16 md:h-20 flex items-center justify-center p-4" style={{ borderTop: `1px solid ${activeTheme.calBorder}` }}>
              <AnimatePresence>
                {range.start && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setIsNotesModalOpen(true)}
                    className="flex items-center justify-center rounded-full text-white px-8 py-4 font-black shadow-2xl tracking-tighter hover:scale-105 active:scale-95 transition-all outline-none"
                    style={{
                      background: activeTheme.calPrimary,
                      border: 'none',
                      boxShadow: `0 10px 25px ${activeTheme.calPrimary}55`
                    }}
                  >
                    <PlusCircle className="w-6 h-6 mr-2" />
                    ADD NOTE TO {range.end ? 'RANGE' : 'DATE'}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Card Floor Shadow */}
        <div className="absolute -bottom-8 left-12 right-12 h-10 rounded-full blur-3xl bg-black/35 z-[-1]" />
      </div>

      <NotesModal isOpen={isNotesModalOpen} onClose={() => setIsNotesModalOpen(false)} range={range} />
      <NotesHistory isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <ViewEventsModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        date={viewDate}
        dayEvents={viewDayEvents}
      />
    </div>
  );
}
