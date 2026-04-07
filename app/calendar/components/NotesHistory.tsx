"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, X, NotebookText, CalendarDays } from 'lucide-react';
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

export default function NotesHistory({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notes, setNotes] = useState<SavedNote[]>([]);

  useEffect(() => {
    if (isOpen) loadNotes();
  }, [isOpen]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Side Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-base-100 shadow-2xl z-[101] flex flex-col border-l border-base-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-base-300 bg-base-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[var(--cal-primary)]/15">
                  <NotebookText className="w-5 h-5" style={{ color: 'var(--cal-primary)' }} />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-base-content">Saved Notes</h2>
                  <p className="text-xs text-base-content/50">{notes.length} note{notes.length !== 1 ? 's' : ''} saved</p>
                </div>
              </div>
              <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-base-content/30">
                  <NotebookText className="w-14 h-14" />
                  <p className="text-sm text-center">No saved notes yet.<br />Select dates on the calendar!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {notes.map((note) => (
                    <motion.div
                      key={note.key}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, overflow: 'hidden' }}
                      layout
                      className="card bg-base-200 border border-base-300 group"
                    >
                      <div className="card-body p-4 gap-2">
                        {/* Date label & Type badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: 'var(--cal-primary)' }}>
                            <CalendarDays className="w-3 h-3" />
                            {note.label}
                          </div>
                          <span className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded-full border ${note.type === 'event' ? 'bg-[var(--cal-primary)] text-white border-[var(--cal-primary)]' : 'bg-transparent text-base-content/40 border-base-content/20'}`}>
                            {note.type}
                          </span>
                        </div>

                        {/* Note text */}
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap line-clamp-4 ${note.type === 'event' ? 'font-bold text-base-content' : 'text-base-content/60 italic'}`}>
                          {note.text}
                        </p>

                        {/* Saved at + delete */}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-base-content/40">
                            {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                          <button
                            onClick={() => handleDelete(note.key, note.id)}
                            className="btn btn-ghost btn-xs text-error opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
