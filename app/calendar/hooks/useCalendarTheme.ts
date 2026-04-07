"use client";

import { useState, useEffect } from 'react';

export type CalendarTheme = {
  id: string;
  label: string;
  // Wall background CSS
  wallBg: string;
  wallPattern: string;       
  calPrimary: string;        
  calPaper: string;          
  calPaperText: string;      
  calBorder: string;         
  swatch: string;            
  wallOverlay?: string;      
  // Window specific
  windowFrame: string;
  windowScenery: string;     // CSS gradient or image for the sky
  windowSun: string;         // color for the sun/moon
  windowDetailAlpha: number; // opacity for trees/mountains
};

const svgUri = (svg: string) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

// Patterns
const brickPatternSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40"><rect width="80" height="40" fill="#b05030"/><rect x="1" y="1" width="36" height="18" rx="1" fill="#c0603a" opacity="0.9"/><rect x="41" y="1" width="38" height="18" rx="1" fill="#b85535" opacity="0.9"/><rect x="1" y="21" width="38" height="18" rx="1" fill="#bb5c38" opacity="0.85"/><rect x="41" y="21" width="38" height="18" rx="1" fill="#c06040" opacity="0.85"/></svg>`;
const woodPatternSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><rect width="200" height="60" fill="#8B5E3C"/><rect y="0"  width="200" height="19" fill="#9C6B48" opacity="0.9"/><rect y="20" width="200" height="19" fill="#7A5030" opacity="0.9"/><rect y="40" width="200" height="20" fill="#8B5E3C" opacity="0.85"/><line x1="0" y1="19.5" x2="200" y2="19.5" stroke="#5a3820" stroke-width="1.5" opacity="0.6"/><line x1="0" y1="39.5" x2="200" y2="39.5" stroke="#5a3820" stroke-width="1.5" opacity="0.6"/></svg>`;
const concretePatternSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="200" height="200" fill="#a0a0a0"/><rect width="200" height="200" filter="url(#noise)" opacity="0.25"/></svg>`;
const floralPatternSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="#f5e6c8"/><circle cx="30" cy="30" r="10" fill="none" stroke="#c9a96e" stroke-width="1.5" opacity="0.6"/><circle cx="30" cy="30" r="4"  fill="#d4b483" opacity="0.7"/></svg>`;
const metalPatternSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#1a1a2e"/><line x1="0"  y1="20" x2="80" y2="20" stroke="#2a2a4a" stroke-width="1"/><line x1="20" y1="0"  x2="20" y2="80" stroke="#2a2a4a" stroke-width="1"/></svg>`;

export const themes: CalendarTheme[] = [
  {
    id: 'brick',
    label: 'Warm Brick',
    wallBg: '#a04828',
    wallPattern: svgUri(brickPatternSvg),
    calPrimary: '#f87171',
    calPaper: '#fef9f5',
    calPaperText: '#3b1f10',
    calBorder: '#e2c9b0',
    swatch: '#c0603a',
    wallOverlay: 'rgba(0,0,0,0.18)',
    windowFrame: '#5a2d1a',
    windowScenery: 'linear-gradient(180deg, #ff9d6c 0%, #ff7e5f 100%)', // Sunset
    windowSun: '#ffeb3b',
    windowDetailAlpha: 0.3,
  },
  {
    id: 'wood',
    label: 'Cottage Wood',
    wallBg: '#7a4e2d',
    wallPattern: svgUri(woodPatternSvg),
    calPrimary: '#f59e0b',
    calPaper: '#fefdf8',
    calPaperText: '#2d1a00',
    calBorder: '#d4b896',
    swatch: '#9c6b48',
    wallOverlay: 'rgba(0,0,0,0.15)',
    windowFrame: '#4a2c16',
    windowScenery: 'linear-gradient(180deg, #87ceeb 0%, #6fa34a 100%)', // Morning Forest
    windowSun: '#ffee58',
    windowDetailAlpha: 0.6,
  },
  {
    id: 'concrete',
    label: 'Modern Loft',
    wallBg: '#8a8a8a',
    wallPattern: svgUri(concretePatternSvg),
    calPrimary: '#60a5fa',
    calPaper: '#f8fafc',
    calPaperText: '#1e293b',
    calBorder: '#cbd5e1',
    swatch: '#94a3b8',
    wallOverlay: 'rgba(0,0,0,0.2)',
    windowFrame: '#334155',
    windowScenery: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)', // Rainy City
    windowSun: '#94a3b8',
    windowDetailAlpha: 0.2,
  },
  {
    id: 'vintage',
    label: 'Grandma House',
    wallBg: '#e8d5a3',
    wallPattern: svgUri(floralPatternSvg),
    calPrimary: '#b45309',
    calPaper: '#fffcf0',
    calPaperText: '#3b2a00',
    calBorder: '#d4b483',
    swatch: '#c9a96e',
    wallOverlay: 'rgba(180,120,40,0.10)',
    windowFrame: '#f5f5f5', // Whitewashed
    windowScenery: 'linear-gradient(180deg, #e0f2f1 0%, #80cbc4 100%)', // Spring Garden
    windowSun: '#fff9c4',
    windowDetailAlpha: 0.4,
  },
  {
    id: 'neon',
    label: 'Cyberpunk',
    wallBg: '#0d0d1a',
    wallPattern: svgUri(metalPatternSvg),
    calPrimary: '#a78bfa',
    calPaper: '#13131f',
    calPaperText: '#e2e8f0',
    calBorder: '#312e6b',
    swatch: '#a78bfa',
    wallOverlay: 'rgba(100,0,200,0.08)',
    windowFrame: '#1e1b4b',
    windowScenery: 'linear-gradient(180deg, #2e1065 0%, #1e1b4b 100%)', // Deep Night
    windowSun: '#f472b6', // Neon Moon
    windowDetailAlpha: 0.5,
  },
];

export function useCalendarTheme() {
  const getInitialTheme = (): CalendarTheme => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cal_theme_id');
      if (saved) {
        const found = themes.find(t => t.id === saved);
        if (found) return found;
      }
    }
    return themes[0];
  };

  const [activeTheme, setActiveThemeState] = useState<CalendarTheme>(themes[0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setActiveThemeState(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const setActiveTheme = (theme: CalendarTheme) => {
    setActiveThemeState(theme);
    localStorage.setItem('cal_theme_id', theme.id);
    applyTheme(theme);
  };

  const applyTheme = (theme: CalendarTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--cal-primary', theme.calPrimary);
    root.style.setProperty('--cal-paper', theme.calPaper);
    root.style.setProperty('--cal-paper-text', theme.calPaperText);
    root.style.setProperty('--cal-border', theme.calBorder);
  };

  return { activeTheme, setActiveTheme, themes, mounted };
}
