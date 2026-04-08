"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDateRange } from '../hooks/useDateRange';
import { format, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import Image from 'next/image';
import { useCalendarTheme, CalendarTheme } from '../hooks/useCalendarTheme';
import CalendarGrid from './CalendarGrid';
import NotesModal from './NotesModal';
import NotesHistory from './NotesHistory';
import ViewEventsModal from './ViewEventsModal';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { BookOpen, PlusCircle } from 'lucide-react';

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
// ─── Visual Air Flow (Wind Streaks) ──────────────────────────────────────────
function AirFlow({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <>
      {/* Window flow streaks — originate from the left where the window is */}
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`wind-${i}`}
            initial={{ x: '-10%', opacity: 0 }}
            animate={{
              x: '110%',
              opacity: [0, 0.5, 0.5, 0],
            }}
            transition={{
              duration: 1.8 + i * 0.1,
              delay: i * 0.1,
              ease: "easeOut"
            }}
            className="absolute rounded-full"
            style={{
              height: i % 3 === 0 ? 2.5 : 1.5,
              width: 180 + (i % 4) * 60,
              top: `${28 + (i % 7) * 6}%`,   // cluster around middle-left (window area)
              left: '8%',
              background: 'rgba(255,255,255,0.55)',
              filter: 'blur(0.8px)',
              boxShadow: '0 0 10px rgba(255,255,255,0.25)',
            }}
          />
        ))}
      </div>
    </>
  );
}

// ─── Wall Window component (Themed) ───────────────────────────────────────────
const TERRAIN_PATHS = {
  mountains: {
    back: 'polygon(0 100%, 20% 30%, 45% 60%, 65% 15%, 85% 50%, 100% 25%, 100% 100%)',
    front: 'polygon(0 100%, 15% 55%, 35% 75%, 55% 45%, 75% 65%, 90% 40%, 100% 60%, 100% 100%)'
  },
  hills: {
    back: 'polygon(0 100%, 0 70%, 20% 60%, 40% 75%, 60% 55%, 80% 70%, 100% 60%, 100% 100%)',
    front: 'polygon(0 100%, 0 85%, 15% 75%, 35% 85%, 55% 70%, 75% 85%, 100% 75%, 100% 100%)'
  },
  dunes: {
    back: 'polygon(0 100%, 0 80%, 30% 65%, 60% 85%, 90% 60%, 100% 75%, 100% 100%)',
    front: 'polygon(0 100%, 0 90%, 25% 80%, 50% 95%, 75% 75%, 100% 90%, 100% 100%)'
  },
  drifts: {
    back: 'polygon(0 100%, 0 85%, 25% 90%, 50% 80%, 75% 95%, 100% 85%, 100% 100%)',
    front: 'polygon(0 100%, 0 95%, 20% 85%, 45% 98%, 70% 90%, 100% 95%, 100% 100%)'
  },
  cliffs: {
    back: 'polygon(0 100%, 0 50%, 40% 50%, 40% 80%, 70% 80%, 70% 40%, 100% 40%, 100% 100%)',
    front: 'polygon(0 100%, 0 75%, 30% 75%, 30% 90%, 60% 90%, 60% 65%, 100% 65%, 100% 100%)'
  }
};

function WallWindow({ theme }: { theme: CalendarTheme }) {
  const paths = TERRAIN_PATHS[theme.windowDetailType] || TERRAIN_PATHS.mountains;

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
            width: theme.isNight ? 32 : 40,
            height: theme.isNight ? 32 : 40,
            borderRadius: '50%',
            background: theme.isNight
              ? `radial-gradient(circle at 30% 30%, #fff 10%, ${theme.windowSun} 100%)`
              : `radial-gradient(circle, #fff 10%, ${theme.windowSun} 70%)`,
            boxShadow: theme.isNight
              ? `0 0 15px 2px ${theme.windowSun}66`
              : `0 0 25px 5px ${theme.windowSun}44`,
          }}
        >
          {theme.isNight && (
            <div className="absolute inset-0 rounded-full" style={{ background: 'inherit', filter: 'blur(1px)', opacity: 0.5 }} />
          )}
        </div>

        {/* Scenic Details (Mountains/Hills/Dunes) */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none" style={{ opacity: theme.windowDetailAlpha }}>
          <div className="absolute bottom-6 left-0 right-0 h-full bg-black/30"
            style={{ clipPath: paths.back }} />
          <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-black/40"
            style={{ clipPath: paths.front }} />
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

// ─── Seasonal Weather Particles ─────────────────────────────────────────────
function SeasonalWeather({ effect }: { effect: CalendarTheme['weatherEffect'] }) {
  const [particles, setParticles] = useState<{ id: number; x: number; delay: number; duration: number; size: number }[]>([]);

  useEffect(() => {
    // Generate static particle seeds for this effect
    const count = effect === 'snow-heavy' ? 40 : effect === 'snow-light' ? 15 : effect === 'leaves' ? 12 : effect === 'petals' ? 15 : 0;
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5,
      size: effect.includes('snow') ? 2 + Math.random() * 4 : 8 + Math.random() * 8
    }));
    setParticles(newParticles);
  }, [effect]);

  if (effect === 'breeze' || effect === 'heat') return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={`${effect}-${p.id}`}
            initial={{ y: -20, x: `${p.x}%`, opacity: 0, rotate: 0 }}
            animate={{
              y: '110vh',
              x: [`${p.x}%`, `${p.x + (Math.sin(p.id) * 10)}%`],
              opacity: [0, 1, 1, 0],
              rotate: effect === 'leaves' ? 360 : effect === 'petals' ? 180 : 0
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear"
            }}
            className="absolute"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: effect.includes('snow') ? 'white' : effect === 'petals' ? '#fbcfe8' : '#d97706',
              borderRadius: effect.includes('snow') ? '50%' : effect === 'petals' ? '40% 60% 40% 60%' : '20% 80% 20% 80%',
              filter: effect.includes('snow') ? 'blur(1px)' : 'none',
              boxShadow: effect.includes('snow') ? '0 0 5px rgba(255,255,255,0.8)' : 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function WallCalendar() {
  const { range, handleDateSelect: onSelect, handleDateHover, getDayState } = useDateRange();
  const { activeTheme, setThemeForMonth, mounted: themeMounted } = useCalendarTheme();

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
        } catch (e) { }
      }
    }
    setCalendarData(items);
  }, []);

  useEffect(() => {
    loadCalendarData();
    window.addEventListener('calendar_data_updated', loadCalendarData);
    return () => window.removeEventListener('calendar_data_updated', loadCalendarData);
  }, [loadCalendarData]);

  // Sync theme with month on mount and month change
  useEffect(() => {
    if (themeMounted) {
      setThemeForMonth(currentMonth.getMonth());
    }
  }, [currentMonth, setThemeForMonth, themeMounted]);

  // ── Sync'd Jiggle animation ────────────────────────────────────────────────
  const triggerBreeze = useCallback(async () => {
    if (!isMounted.current || !calendarControls) return;

    setIsBreezing(true);

    // Wait for wind to "hit"
    await new Promise(r => setTimeout(r, 400));

    try {
      // Very subtle "jiggle" sequence so it's not distracting
      await calendarControls.start({
        rotate: -0.8,
        x: -1,
        transition: { duration: 0.2, ease: 'easeOut' }
      });
      await calendarControls.start({
        rotate: 0.5,
        x: 0.5,
        transition: { duration: 0.15, ease: 'easeInOut' }
      });
      await calendarControls.start({
        rotate: -0.3,
        transition: { duration: 0.15, ease: 'easeInOut' }
      });
      await calendarControls.start({
        rotate: 0.1,
        transition: { duration: 0.3, ease: 'easeOut' }
      });
      await calendarControls.start({
        rotate: 0,
        x: 0,
        transition: { duration: 0.6, ease: 'easeInOut' }
      });
    } catch (e) { }

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

  // ── Keyboard Navigation ───────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in a text field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        changeMonth(subMonths(currentMonth, 1));
      } else if (e.key === 'ArrowRight') {
        changeMonth(addMonths(currentMonth, 1));
      } else if (e.key.toLowerCase() === 't') {
        changeMonth(new Date());
      } else if (e.key === 'Escape') {
        setIsNotesModalOpen(false);
        setIsHistoryOpen(false);
        setIsViewModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMonth]);

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
    d.setHours(0, 0, 0, 0);
    const s = new Date(item.startDate);
    s.setHours(0, 0, 0, 0);
    if (!item.endDate) return d.getTime() === s.getTime();
    const e = new Date(item.endDate);
    e.setHours(0, 0, 0, 0);
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
      className="h-screen w-full flex flex-col relative overflow-hidden"
      style={wallStyle}
    >
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />

      {/* 🌪️ Visual Air Flow & Seasonal Weather 🌪️ */}
      <AirFlow active={isBreezing || activeTheme.weatherEffect === 'breeze'} />
      <SeasonalWeather effect={activeTheme.weatherEffect} />

      {/* 🖼️ Themed Window 🖼️ */}
      <WallWindow theme={activeTheme} />

      {/* Top Bar Navigation (More compact) */}
      <div className="w-full z-50 flex justify-between items-center px-4 md:px-10 py-2 md:py-3 bg-black/40 backdrop-blur-xl border-b border-white/5 uppercase tracking-tighter">
        <div className="flex items-center gap-4">
          <div className="relative w-8 h-8 md:w-10 md:h-10 transition-all duration-700 hover:rotate-12 hover:scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            <Image
              src="/logo/image.png"
              alt="Brand Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-4 md:px-5 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-black shadow-lg transition-all hover:scale-105 active:scale-95 bg-white/5 hover:bg-white/10 border border-white/10 text-white backdrop-blur-md group"
          >
            <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline tracking-wider">SAVED NOTES</span>
          </button>
        </div>

        <div className="flex flex-col items-end">
          <p className="text-[9px] md:text-[11px] font-black tracking-[0.25em] uppercase italic opacity-70">
            <span className="text-white/90">Take</span>
            <span className="text-yellow-400">U</span>
            <span className="text-white/90">forward</span>
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] md:text-[12px] font-black text-white/80 tracking-tighter uppercase">{activeTheme.label}</p>
          </div>
        </div>
      </div>

      {/* Main Calendar Space (Centered & Scroll-free) */}
      <div className="flex-1 w-full flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden relative z-10">
        <div className="relative w-full max-w-3xl scale-[0.98] sm:scale-100 transition-transform duration-500">
          <Nail />

          <motion.div
            animate={calendarControls}
            initial={{ rotate: 0, y: 0, opacity: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full rounded-2xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row bg-white/95 shadow-[0_20px_80px_rgba(0,0,0,0.4)]"
            style={{
              background: 'var(--cal-paper)',
              border: `1px solid var(--cal-border)`,
              transformOrigin: 'top center',
              color: 'var(--cal-paper-text)',
            }}
          >
            {/* Main Visual Panel */}
            <div className="md:w-5/12 h-36 md:h-auto relative overflow-hidden bg-black flex-shrink-0">
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
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex items-end justify-between">
                <div>
                  <p className="text-white/60 text-[10px] md:text-xs font-black tracking-widest uppercase mb-1 md:mb-2">{heroMonth}</p>
                  <h1 className="text-white text-3xl md:text-5xl font-black italic tracking-tighter leading-none">TUF CALENDAR</h1>
                </div>
              </div>
            </div>

            {/* Grid Panel */}
            <div className="md:w-7/12 flex flex-col relative">
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

              <div className="h-12 md:h-14 flex items-center justify-center px-4" style={{ borderTop: `1px solid var(--cal-border)` }}>
                <AnimatePresence>
                  {range.start && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setIsNotesModalOpen(true)}
                      className="flex items-center justify-center rounded-full text-white px-6 py-3.5 text-sm font-black shadow-2xl tracking-tighter hover:scale-105 active:scale-95 transition-all outline-none"
                      style={{
                        background: 'var(--cal-primary)',
                        border: 'none',
                        boxShadow: `0 10px 25px var(--cal-primary)55`
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
          <div className="absolute -bottom-6 left-12 right-12 h-8 rounded-full blur-3xl bg-black/40 z-[-1]" />
        </div>
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

