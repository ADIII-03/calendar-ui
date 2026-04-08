"use client";

import { useState, useEffect, useCallback } from 'react';

export type CalendarTheme = {
  id: string;
  label: string;
  wallBg: string;
  wallPattern: string;
  calPrimary: string;
  calPaper: string;
  calPaperText: string;
  calBorder: string;
  swatch: string;
  wallOverlay?: string;
  windowFrame: string;
  windowScenery: string;
  windowSun: string;
  windowDetailAlpha: number;
  windowDetailType: 'mountains' | 'hills' | 'dunes' | 'drifts' | 'cliffs';
  isNight: boolean;
  weatherEffect: 'snow-heavy' | 'snow-light' | 'petals' | 'leaves' | 'breeze' | 'heat';
};

const svgUri = (svg: string) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

// ─── SVG Patterns ─────────────────────────────────────────────────────────────

const snowflakeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" opacity="0.06">
  <line x1="40" y1="10" x2="40" y2="70" stroke="#a8d8f0" stroke-width="1.5"/>
  <line x1="10" y1="40" x2="70" y2="40" stroke="#a8d8f0" stroke-width="1.5"/>
  <line x1="18" y1="18" x2="62" y2="62" stroke="#a8d8f0" stroke-width="1.5"/>
  <line x1="62" y1="18" x2="18" y2="62" stroke="#a8d8f0" stroke-width="1.5"/>
  <circle cx="40" cy="40" r="4" fill="#a8d8f0"/>
  <circle cx="40" cy="14" r="2" fill="#a8d8f0"/>
  <circle cx="40" cy="66" r="2" fill="#a8d8f0"/>
  <circle cx="14" cy="40" r="2" fill="#a8d8f0"/>
  <circle cx="66" cy="40" r="2" fill="#a8d8f0"/>
</svg>`;

const floralSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" opacity="0.07">
  <circle cx="60" cy="60" r="4" fill="#f9a8d4"/>
  <ellipse cx="60" cy="42" rx="5" ry="10" fill="#fbcfe8"/>
  <ellipse cx="60" cy="78" rx="5" ry="10" fill="#fbcfe8"/>
  <ellipse cx="42" cy="60" rx="10" ry="5" fill="#fbcfe8"/>
  <ellipse cx="78" cy="60" rx="10" ry="5" fill="#fbcfe8"/>
  <ellipse cx="48" cy="48" rx="5" ry="10" fill="#fce7f3" transform="rotate(45 48 48)"/>
  <ellipse cx="72" cy="72" rx="5" ry="10" fill="#fce7f3" transform="rotate(45 72 72)"/>
  <ellipse cx="72" cy="48" rx="5" ry="10" fill="#fce7f3" transform="rotate(-45 72 48)"/>
  <ellipse cx="48" cy="72" rx="5" ry="10" fill="#fce7f3" transform="rotate(-45 48 72)"/>
  <circle cx="20" cy="20" r="2" fill="#f9a8d4" opacity="0.4"/>
  <circle cx="100" cy="100" r="2" fill="#f9a8d4" opacity="0.4"/>
  <circle cx="100" cy="20" r="2" fill="#f9a8d4" opacity="0.4"/>
  <circle cx="20" cy="100" r="2" fill="#f9a8d4" opacity="0.4"/>
</svg>`;

const sunRaySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" opacity="0.05">
  <line x1="50" y1="5" x2="50" y2="25" stroke="#fbbf24" stroke-width="2"/>
  <line x1="50" y1="75" x2="50" y2="95" stroke="#fbbf24" stroke-width="2"/>
  <line x1="5" y1="50" x2="25" y2="50" stroke="#fbbf24" stroke-width="2"/>
  <line x1="75" y1="50" x2="95" y2="50" stroke="#fbbf24" stroke-width="2"/>
  <line x1="16" y1="16" x2="30" y2="30" stroke="#fbbf24" stroke-width="1.5"/>
  <line x1="70" y1="70" x2="84" y2="84" stroke="#fbbf24" stroke-width="1.5"/>
  <line x1="84" y1="16" x2="70" y2="30" stroke="#fbbf24" stroke-width="1.5"/>
  <line x1="30" y1="70" x2="16" y2="84" stroke="#fbbf24" stroke-width="1.5"/>
  <circle cx="50" cy="50" r="8" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
</svg>`;

const waveSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" opacity="0.06">
  <path d="M0 30 Q15 10 30 30 Q45 50 60 30 Q75 10 90 30 Q105 50 120 30" stroke="#67e8f9" stroke-width="2" fill="none"/>
  <path d="M0 45 Q15 25 30 45 Q45 65 60 45 Q75 25 90 45 Q105 65 120 45" stroke="#22d3ee" stroke-width="1.5" fill="none" opacity="0.5"/>
</svg>`;

const leafPatternSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" opacity="0.07">
  <path d="M20 60 Q40 20 60 60 Q40 80 20 60" fill="#c2410c"/>
  <path d="M60 20 Q80 40 60 60 Q50 40 60 20" fill="#b45309"/>
  <path d="M80 70 Q100 50 110 80 Q90 90 80 70" fill="#dc2626" opacity="0.6"/>
  <path d="M10 90 Q25 70 40 90 Q25 100 10 90" fill="#ea580c" opacity="0.5"/>
  <circle cx="60" cy="60" r="2" fill="#92400e"/>
  <circle cx="20" cy="20" r="1.5" fill="#b45309" opacity="0.4"/>
  <circle cx="100" cy="30" r="1.5" fill="#c2410c" opacity="0.4"/>
</svg>`;

// ─── 5  Themes ────────────────────────────────────────────────────────

export const themes: Record<string, CalendarTheme> = {

  // ❄️ WINTER — Dec, Jan, Feb
  // Deep midnight navy wall, golden warmth accents, frosted paper, icy borders
  winter: {
    id: 'winter',
    label: 'Winter Haven',
    wallBg: '#0d1b2a',
    wallPattern: svgUri(snowflakeSvg),
    wallOverlay: 'rgba(14, 42, 80, 0.55)',
    calPrimary: '#f59e0b',
    calPaper: '#f0f6ff',
    calPaperText: '#0f2748',
    calBorder: '#bfdbfe',
    swatch: '#f59e0b',
    windowFrame: '#1e3a5f',
    windowScenery: 'linear-gradient(to bottom, #0f2748 0%, #1e4080 40%, #c8ddf5 75%, #e8f0fa 100%)',
    windowSun: '#e2eeff',   // cold moon glow
    windowDetailAlpha: 0.18,
    windowDetailType: 'drifts',
    isNight: true,
    weatherEffect: 'snow-heavy',
  },

  // 🌸 SPRING — Mar, Apr, May
  // Warm parchment wall, blush pink blooms, fresh white paper, mint-rose accents
  spring: {
    id: 'spring',
    label: 'Spring Bloom',
    wallBg: '#fff1f6',
    wallPattern: svgUri(floralSvg),
    wallOverlay: 'rgba(253, 242, 248, 0.3)',
    calPrimary: '#ec4899',
    calPaper: '#ffffff',
    calPaperText: '#500724',
    calBorder: '#fbcfe8',
    swatch: '#ec4899',
    windowFrame: '#f9a8d4',
    windowScenery: 'linear-gradient(to bottom, #bae6fd 0%, #93c5fd 30%, #a7f3d0 70%, #bbf7d0 100%)',
    windowSun: '#fde68a',
    windowDetailAlpha: 0.55,
    windowDetailType: 'hills',
    isNight: false,
    weatherEffect: 'petals',
  },

  // ☀️ EARLY SUMMER — Jun, Jul
  // Warm sandy terracotta wall, sky blue primary, cream paper, golden borders
  'early-summer': {
    id: 'early-summer',
    label: 'Early Summer',
    wallBg: '#7c2d12',
    wallPattern: svgUri(sunRaySvg),
    wallOverlay: 'rgba(180, 83, 9, 0.25)',
    calPrimary: '#0284c7',
    calPaper: '#fffbf0',
    calPaperText: '#431a03',
    calBorder: '#fed7aa',
    swatch: '#0284c7',
    windowFrame: '#9a3412',
    windowScenery: 'linear-gradient(to bottom, #38bdf8 0%, #7dd3fc 35%, #fef08a 70%, #fde68a 100%)',
    windowSun: '#fbbf24',
    windowDetailAlpha: 0.35,
    windowDetailType: 'cliffs',
    isNight: false,
    weatherEffect: 'breeze',
  },

  // 🏖️ PEAK SUMMER — Aug, Sep (start)
  // Deep ocean blue wall, vivid cyan, crisp white paper, electric aqua borders
  'peak-summer': {
    id: 'peak-summer',
    label: 'Peak Summer',
    wallBg: '#082f49',
    wallPattern: svgUri(waveSvg),
    wallOverlay: 'rgba(6, 100, 140, 0.3)',
    calPrimary: '#06b6d4',
    calPaper: '#f0feff',
    calPaperText: '#083344',
    calBorder: '#a5f3fc',
    swatch: '#06b6d4',
    windowFrame: '#0e7490',
    windowScenery: 'linear-gradient(to bottom, #0369a1 0%, #0ea5e9 30%, #38bdf8 60%, #fef08a 100%)',
    windowSun: '#ffffff',
    windowDetailAlpha: 0.15,
    windowDetailType: 'dunes',
    isNight: false,
    weatherEffect: 'heat',
  },

  // 🍂 AUTUMN — Oct, Nov
  // Burnt sienna wall, amber-orange primary, warm parchment paper, deep amber borders
  autumn: {
    id: 'autumn',
    label: 'Golden Autumn',
    wallBg: '#3b0f02',
    wallPattern: svgUri(leafPatternSvg),
    wallOverlay: 'rgba(30, 10, 0, 0.35)',
    calPrimary: '#ea580c',
    calPaper: '#fef9ec',
    calPaperText: '#3b0f02',
    calBorder: '#fcd34d',
    swatch: '#ea580c',
    windowFrame: '#1c0a00',
    windowScenery: 'linear-gradient(to bottom, #7c2d12 0%, #b45309 40%, #d97706 70%, #78350f 100%)',
    windowSun: '#f59e0b',
    windowDetailAlpha: 0.65,
    windowDetailType: 'mountains',
    isNight: false,
    weatherEffect: 'leaves',
  },
};

// ─── Month → Season mapping ───────────────────────────────────────────────────

export const getSeasonForMonth = (month: number): string => {
  if ([11, 0, 1].includes(month)) return 'winter';
  if ([2, 3, 4].includes(month)) return 'spring';
  if ([5, 6].includes(month)) return 'early-summer';
  if ([7, 8].includes(month)) return 'peak-summer';
  if ([9, 10].includes(month)) return 'autumn';
  return 'winter';
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCalendarTheme() {
  const [activeTheme, setActiveThemeState] = useState<CalendarTheme>(
    themes[getSeasonForMonth(new Date().getMonth())]
  );
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((theme: CalendarTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--cal-primary', theme.calPrimary);
    root.style.setProperty('--cal-paper', theme.calPaper);
    root.style.setProperty('--cal-paper-text', theme.calPaperText);
    root.style.setProperty('--cal-border', theme.calBorder);
  }, []);

  const setThemeForMonth = useCallback((month: number) => {
    const season = getSeasonForMonth(month);
    const base = themes[season];

    // Oct/Nov get a subtle early-winter snow-light touch on top of autumn palette
    const finalTheme: CalendarTheme = (month === 9 || month === 10)
      ? { ...base, weatherEffect: 'snow-light' }
      : { ...base };

    setActiveThemeState(finalTheme);
    applyTheme(finalTheme);
  }, [applyTheme]);

  useEffect(() => {
    setThemeForMonth(new Date().getMonth());
    setMounted(true);
  }, [setThemeForMonth]);

  return {
    activeTheme,
    setThemeForMonth,
    themes: Object.values(themes),
    mounted,
  };
}