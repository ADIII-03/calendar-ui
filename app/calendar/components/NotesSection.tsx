import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DateRange } from '../hooks/useDateRange';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { StickyNote, Save } from 'lucide-react';
import { motion } from 'framer-motion';

type NotesSectionProps = {
  range: DateRange;
};

// Auto-generates a clean key for localStorage, e.g., "2026-04-05_2026-04-09" or "2026-04-12"
const generateRangeKey = (range: DateRange) => {
  if (!range.start) return 'general_notes';
  const startStr = format(range.start, 'yyyy-MM-dd');
  if (range.end) {
    const endStr = format(range.end, 'yyyy-MM-dd');
    return `${startStr}_${endStr}`;
  }
  return startStr;
};

const getDisplayLabel = (range: DateRange) => {
  if (!range.start) return "General Notes";
  const startStr = format(range.start, 'MMM d, yyyy');
  if (range.end) {
    const endStr = format(range.end, 'MMM d, yyyy');
    return `${startStr} – ${endStr}`;
  }
  return startStr;
};

export default function NotesSection({ range }: NotesSectionProps) {
  const [noteText, setNoteText] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const key = generateRangeKey(range);
  const label = getDisplayLabel(range);

  // Load from local storage when date changes
  useEffect(() => {
    const savedData = localStorage.getItem(`calendar_notes_${key}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setNoteText(parsed.text || "");
      } catch (e) {
        setNoteText(savedData);
      }
    } else {
      setNoteText("");
    }
    setIsSaved(false);
  }, [key]);

  // Save to local storage
  const handleSave = () => {
    const data = {
      text: noteText,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(`calendar_notes_${key}`, JSON.stringify(data));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const Content = (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden glass shadow-sm">
      <div className="bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20 px-4 py-3 border-b border-[var(--primary)]/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[var(--primary)] font-semibold">
          <StickyNote className="w-4 h-4" />
          <span>{label}</span>
        </div>
        <button 
          onClick={handleSave}
          className="text-xs flex items-center gap-1 bg-[var(--primary)] text-white px-3 py-1.5 rounded-md hover:bg-opacity-90 transition shadow-sm"
        >
          <Save className="w-3 h-3" />
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>
      <textarea
        className="flex-1 w-full p-4 bg-transparent outline-none resize-none text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400"
        placeholder="Jot down notes, plans, or trips for this date..."
        value={noteText}
        onChange={(e) => {
          setNoteText(e.target.value);
          setIsSaved(false);
        }}
      />
    </div>
  );

  return (
    <>
      {/* Desktop view */}
      <div className="hidden md:block h-[300px] mt-4">
        {Content}
      </div>

      {/* Mobile view - Bottom Sheet via UI/Sheet (Shadcn) if available, otherwise just inline */}
      <div className="md:hidden mt-4">
         {/* Assuming Shadcn Sheet. Instruct user to setup */}
         <Sheet>
          <SheetTrigger asChild>
            <button className="w-full bg-[var(--primary)] text-white font-medium py-3 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <StickyNote className="w-4 h-4"/> 
              Open Notes ({label})
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh] p-0 rounded-t-xl bg-zinc-50 dark:bg-zinc-950 border-t border-[var(--primary)]/20">
            <SheetHeader className="sr-only"><SheetTitle>Notes</SheetTitle></SheetHeader>
            {Content}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
