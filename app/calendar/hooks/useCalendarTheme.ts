import { useState, useEffect } from 'react';

export type CalendarTheme = {
  id: string;
  image: string;
  primary: string;
  accent: string;
  bgGlass: string;
  isDark: boolean;
};

// We predefine distinct themes. In a more advanced version, we could use color-thief here.
export const themes: CalendarTheme[] = [
  {
    id: 'ocean',
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&q=80&w=1200',
    primary: '#0ea5e9', // skylight blue
    accent: '#38bdf8',
    bgGlass: 'rgba(255, 255, 255, 0.1)',
    isDark: true,
  },
  {
    id: 'forest',
    image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a5d?auto=format&fit=crop&q=80&w=1200',
    primary: '#22c55e', // lush green
    accent: '#4ade80',
    bgGlass: 'rgba(20, 40, 20, 0.2)',
    isDark: true,
  },
  {
    id: 'desert',
    image: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=80&w=1200',
    primary: '#f97316', // sand orange
    accent: '#fb923c',
    bgGlass: 'rgba(255, 255, 255, 0.2)',
    isDark: false,
  }
];

export function useCalendarTheme() {
  const [activeTheme, setActiveTheme] = useState<CalendarTheme>(themes[0]);

  useEffect(() => {
    // Apply CSS Variables to root
    const root = document.documentElement;
    root.style.setProperty('--primary', activeTheme.primary);
    root.style.setProperty('--accent', activeTheme.accent);
    root.style.setProperty('--bg-glass', activeTheme.bgGlass);
    
    // Auto dark mode
    if (activeTheme.isDark) {
      document.body.classList.add('dark', 'bg-zinc-950', 'text-zinc-50');
      document.body.classList.remove('bg-zinc-50', 'text-zinc-900');
    } else {
      document.body.classList.add('bg-zinc-50', 'text-zinc-900');
      document.body.classList.remove('dark', 'bg-zinc-950', 'text-zinc-50');
    }
  }, [activeTheme]);

  return {
    activeTheme,
    setActiveTheme,
    themes
  };
}
