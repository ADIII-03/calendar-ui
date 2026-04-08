"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, X, NotebookText, CalendarDays, Search, Inbox, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

type SavedNote = {
  key: string;
  id: string;
  label: string;
  text: string;
  type: 'note' | 'event';
  createdAt: string;
};

// Animation variants for the stagger effect
const listVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  initial: { opacity: 0, x: 20, y: 10 },
  animate: { opacity: 1, x: 0, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export default function NotesHistory({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const [isNotesLoaded, setIsNotesLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay loading to allow modal to animate smoothly
      const timer = setTimeout(() => {
        loadNotes();
        setIsNotesLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsNotesLoaded(false);
      setNotes([]);
      setSearch("");
      setVisibleCount(20);
    }
  }, [isOpen]);

  useEffect(() => {
    setVisibleCount(20);
  }, [search]);

  useEffect(() => {
    window.addEventListener('calendar_data_updated', loadNotes);
    return () => window.removeEventListener('calendar_data_updated', loadNotes);
  }, []);

  const loadNotes = () => {
    const loaded: SavedNote[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('calendar_notes_')) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            const entries = Array.isArray(parsed) ? parsed : [parsed];
            const dateLabel = parsed.label || key.replace('calendar_notes_', '').split('_')[0];

            entries.forEach((item: any) => {
              loaded.push({
                key: key,
                id: item.id || Math.random().toString(),
                label: item.label || dateLabel,
                text: item.text || '',
                type: item.type || 'note',
                createdAt: item.createdAt || new Date().toISOString(),
              });
            });
          }
        } catch { }
      }
    }
    loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setNotes(loaded);
  };

  const handleDelete = (key: string, itemId: string) => {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      const entries = Array.isArray(parsed) ? parsed : [parsed];
      const updated = entries.filter((i: any) => (i.id || i.key) !== itemId);

      if (updated.length === 0) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(updated));
      }

      setNotes(prev => prev.filter(n => n.id !== itemId));
      window.dispatchEvent(new CustomEvent('calendar_data_updated'));
    }
  };

  const filteredNotes = notes.filter(n =>
    n.text.toLowerCase().includes(search.toLowerCase()) ||
    n.label.toLowerCase().includes(search.toLowerCase())
  );

  const displayedNotes = filteredNotes.slice(0, visibleCount);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with extreme blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
          />

          {/* Premium Side Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
            className="fixed top-0 right-0 h-full w-full max-w-md shadow-[0_0_80px_rgba(0,0,0,0.4)] z-[101] flex flex-col border-l overflow-hidden"
            style={{
              background: 'var(--cal-paper)',
              color: 'var(--cal-paper-text)',
              borderColor: 'var(--cal-border)'
            }}
          >
            {/* Header Visual */}
            <div className="relative px-8 py-10 bg-black/5" style={{ borderBottom: '1px solid var(--cal-border)' }}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[var(--cal-primary)] flex items-center justify-center shadow-lg">
                    <NotebookText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter italic uppercase leading-tight">Journal</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">All saved activities</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-all active:scale-90 flex items-center gap-2 group/btn" title="Close (ESC)">
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[8px] font-sans font-black bg-black/10 rounded border border-current opacity-40 uppercase group-hover/btn:opacity-80 transition-opacity">Esc</kbd>
                  <X className="w-5 h-5 opacity-40 group-hover/btn:opacity-100" />
                </button>
              </div>

              {/* Interactive Search */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 group-focus-within:opacity-80 transition-all group-focus-within:text-[var(--cal-primary)]" />
                <input
                  type="text"
                  placeholder="Search your notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/5 focus:bg-black/10 transition-all outline-none border border-transparent focus:border-[var(--cal-primary)]/30 font-bold text-sm"
                />
              </div>
            </div>

            {/* Notes List with Custom Scrollbar */}
            <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-6 custom-scrollbar scroll-smooth">
              {!isNotesLoaded ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 opacity-30 text-center py-20">
                  <div className="w-8 h-8 rounded-full border-t-2 border-[var(--cal-primary)] animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Loading Journal...</p>
                </div>
              ) : filteredNotes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full gap-5 opacity-20 text-center py-20"
                >
                  <Inbox className="w-16 h-16" />
                  <div className="space-y-1">
                    <p className="text-sm font-black tracking-widest uppercase">No entries found</p>
                    <p className="text-[10px] font-bold">Try searching for something else or add notes!</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  variants={listVariants}
                  initial="initial"
                  animate="animate"
                  className="space-y-4"
                >
                  {displayedNotes.map((note) => (
                    <motion.div
                      key={note.id}
                      variants={itemVariants}
                      className="group relative flex flex-col p-6 rounded-[2.5rem] bg-black/5 border transition-all hover:bg-black-[8%] border-transparent hover:border-black/5"
                      style={{ borderColor: 'var(--cal-border)' }}
                    >
                      {/* Type Bar Accent */}
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 rounded-r-full transition-all group-hover:h-2/3"
                        style={{ background: note.type === 'event' ? 'var(--cal-primary)' : 'rgba(0,0,0,0.1)' }}
                      />

                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-3 pl-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${note.type === 'event' ? 'bg-[var(--cal-primary)]/10 text-[var(--cal-primary)]' : 'bg-black/5 opacity-40'}`}>
                            <CalendarDays className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            {note.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black tracking-widest uppercase px-3 py-1 rounded-full border ${note.type === 'event' ? 'bg-[var(--cal-primary)] text-white border-[var(--cal-primary)]' : 'bg-transparent opacity-30 border-current'}`}>
                            {note.type}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(note.key, note.id); }}
                            className="p-1.5 ml-1 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                            title="Delete Entry"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="pl-2">
                        <p className={`text-lg leading-[1.4] mb-4 whitespace-pre-wrap line-clamp-5 ${note.type === 'event' ? 'font-black tracking-tighter text-base-content' : 'italic opacity-60'}`}>
                          {note.text}
                        </p>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5 pl-2">
                        <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
                          {format(new Date(note.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {visibleCount < filteredNotes.length && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setVisibleCount(v => v + 20)}
                      className="w-full py-4 mt-6 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all border border-dashed border-current rounded-2xl active:scale-95"
                    >
                      Load {Math.min(20, filteredNotes.length - visibleCount)} More Notes ({filteredNotes.length - visibleCount} remaining)
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>

            {/* Premium Sticky Footer */}
            <div className="p-8 border-t bg-black/[0.02] flex items-center justify-center" style={{ borderColor: 'var(--cal-border)' }}>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 text-center">
                TUF Wall Calendar • Journal
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
