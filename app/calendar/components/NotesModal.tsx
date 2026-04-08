"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DateRange } from '../hooks/useDateRange';
import { StickyNote, Save, X, Trash2, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type NotesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  range: DateRange;
};

const generateRangeKey = (range: DateRange) => {
  if (!range.start) return 'general_notes';
  const startStr = format(range.start, 'yyyy-MM-dd');
  if (range.end) return `${startStr}_${format(range.end, 'yyyy-MM-dd')}`;
  return startStr;
};

const getDisplayLabel = (range: DateRange) => {
  if (!range.start) return "General Notes";
  const startStr = format(range.start, 'MMM d, yyyy');
  if (range.end) return `${startStr} – ${format(range.end, 'MMM d, yyyy')}`;
  return startStr;
};

type StoredItem = {
  id: string;
  text: string;
  type: 'note' | 'event';
  createdAt: string;
};

export default function NotesModal({ isOpen, onClose, range }: NotesModalProps) {
  const [items, setItems] = useState<StoredItem[]>([]);
  const [noteText, setNoteText] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [type, setType] = useState<'note' | 'event'>('event');
  const key = generateRangeKey(range);
  const label = getDisplayLabel(range);

  useEffect(() => {
    if (isOpen) {
      const raw = localStorage.getItem(`calendar_notes_${key}`);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          // Migration: if it's an object (old way), wrap it in an array
          if (Array.isArray(parsed)) {
            setItems(parsed);
          } else {
            setItems([{ ...parsed, id: parsed.id || Date.now().toString() }]);
          }
        }
        catch {
          setItems([{ id: Date.now().toString(), text: raw, type: 'note', createdAt: new Date().toISOString() }]);
        }
      } else {
        setItems([]);
      }
      setNoteText("");
      setType('event');
      setIsSaved(false);
    }
  }, [isOpen, key]);

  const handleSave = () => {
    if (!noteText.trim()) return;

    const newItem: StoredItem = {
      id: Date.now().toString(),
      text: noteText,
      type: type,
      createdAt: new Date().toISOString()
    };

    const updatedItems = [...items, newItem];
    localStorage.setItem(`calendar_notes_${key}`, JSON.stringify(updatedItems));
    setItems(updatedItems);
    setNoteText("");
    setIsSaved(true);

    window.dispatchEvent(new CustomEvent('calendar_data_updated'));

    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 200);
  };

  const handleDelete = (itemId: string) => {
    const updated = items.filter(i => i.id !== itemId);
    if (updated.length === 0) {
      localStorage.removeItem(`calendar_notes_${key}`);
    } else {
      localStorage.setItem(`calendar_notes_${key}`, JSON.stringify(updated));
    }
    setItems(updated);
    window.dispatchEvent(new CustomEvent('calendar_data_updated'));
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
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-lg z-[101]"
          >
            <div className="bg-base-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" style={{ background: 'var(--cal-paper)', color: 'var(--cal-paper-text)', border: '1px solid var(--cal-border)' }}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: 'var(--cal-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[var(--cal-primary)]/15">
                    <StickyNote className="w-4 h-4" style={{ color: 'var(--cal-primary)' }} />
                  </div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-tighter italic">Schedule Manager</h3>
                    <p className="font-bold opacity-40 text-[9px] tracking-widest uppercase">{label}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors active:scale-95">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Existing Items List (Only if items exist) */}
              {items.length > 0 && (
                <div className="overflow-y-auto px-6 py-6 space-y-4 max-h-[300px] custom-scrollbar border-b" style={{ borderColor: 'var(--cal-border)' }}>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="group relative flex flex-col p-4 rounded-[2rem] bg-black/5 border transition-all hover:bg-black-[8%] border-transparent hover:border-black/5">
                        <div 
                           className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 rounded-r-full transition-all group-hover:h-full" 
                           style={{ background: item.type === 'event' ? 'var(--cal-primary)' : 'rgba(0,0,0,0.1)' }}
                        />

                        <div className="flex items-start justify-between gap-3 pl-2">
                          <div className="flex-1 min-w-0">
                             <p className={`text-base leading-snug lowercase tracking-tight ${item.type === 'event' ? 'font-black text-base-content' : 'italic opacity-60'}`}>
                                {item.text}
                             </p>
                          </div>
                          <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-red-500 bg-red-500/0 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                          >
                              <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Section */}
              <div className="p-6 pt-0 mt-auto border-t" style={{ borderColor: 'var(--cal-border)' }}>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-3 px-1 pt-4 italic">Register Entry</p>
                <div className="flex bg-black-[4%] p-1 rounded-2xl mb-3 border border-[var(--cal-border)]">
                  {(['event', 'note'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`relative flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all z-[1] ${type === t ? 'text-white' : 'opacity-40'}`}
                    >
                      {type === t && (
                        <motion.div
                          layoutId="active-type"
                          className="absolute inset-0 rounded-xl z-[-1]"
                          style={{ background: 'var(--cal-primary)' }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      {t}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 items-end">
                    <textarea
                        className="flex-1 h-16 p-4 resize-none focus:outline-none text-xs leading-relaxed rounded-2xl bg-transparent border border-[var(--cal-border)] focus:border-[var(--cal-primary)] placeholder:opacity-40 placeholder:text-current font-bold"
                        placeholder={type === 'event' ? "Register activity..." : "Write a personal note..."}
                        value={noteText}
                        onChange={(e) => { setNoteText(e.target.value); setIsSaved(false); }}
                    />
                    <button
                        onClick={handleSave}
                        disabled={!noteText.trim() || isSaved}
                        className="w-12 h-12 flex items-center justify-center rounded-full text-white shadow-xl flex-shrink-0 transition-all active:scale-95 outline-none"
                        style={{
                            backgroundColor: 'var(--cal-primary)',
                            borderColor: 'var(--cal-primary)',
                            opacity: !noteText.trim() ? 0.4 : 1
                        }}
                    >
                        {isSaved ? "✓" : <Save className="w-5 h-5" />}
                    </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
