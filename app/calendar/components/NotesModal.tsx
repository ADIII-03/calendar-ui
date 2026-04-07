"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DateRange } from '../hooks/useDateRange';
import { StickyNote, Save, X } from 'lucide-react';
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
            setItems([ { ...parsed, id: parsed.id || Date.now().toString() } ]);
          }
        }
        catch { 
          setItems([ { id: Date.now().toString(), text: raw, type: 'note', createdAt: new Date().toISOString() } ]);
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
    }, 1000);
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
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--cal-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[var(--cal-primary)]/15">
                    <StickyNote className="w-5 h-5" style={{ color: 'var(--cal-primary)' }} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-tighter">Schedule Manager</h3>
                    <p className="font-bold opacity-50 text-[10px] tracking-widest uppercase">{label}</p>
                  </div>
                </div>
                <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Existing Items List (Dynamic Height) */}
              <div className={`overflow-y-auto px-6 space-y-3 custom-scrollbar transition-all duration-300 ${items.length > 0 ? 'py-6 flex-1 min-h-[120px]' : 'py-2 h-auto'}`}>
                {items.length === 0 ? (
                  <div className="text-center opacity-30 text-[10px] italic tracking-tight py-4">No schedule recorded for this date.</div>
                ) : (
                  <div className="space-y-2 pb-2">
                    {items.map((item) => (
                      <div key={item.id} className="group relative flex items-start gap-3 p-3 rounded-2xl bg-black/5 border border-black/5 hover:bg-black/10 transition-all">
                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${item.type === 'event' ? 'bg-[var(--cal-primary)]' : 'bg-zinc-400'}`} />
                        <div className="flex-1 min-w-0 font-medium">
                            <p className={`text-sm leading-snug ${item.type === 'event' ? 'font-black tracking-tight' : 'italic opacity-60'}`}>
                                {item.text}
                            </p>
                        </div>
                        <button 
                            onClick={() => handleDelete(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Section */}
              <div className="p-6 pt-0 mt-auto border-t" style={{ borderColor: 'var(--cal-border)' }}>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-3 px-1 pt-4">Add new item</p>
                <div className="flex bg-base-200/50 p-1 rounded-2xl mb-3 border border-[var(--cal-border)]">
                  {(['event', 'note'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`relative flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors z-[1] ${type === t ? 'text-white' : 'opacity-40'}`}
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
                        className="textarea textarea-bordered flex-1 h-16 resize-none focus:outline-none text-xs leading-relaxed rounded-2xl bg-transparent"
                        placeholder={type === 'event' ? "Event title..." : "Personal note..."}
                        value={noteText}
                        onChange={(e) => { setNoteText(e.target.value); setIsSaved(false); }}
                    />
                    <button
                        onClick={handleSave}
                        disabled={!noteText.trim() || isSaved}
                        className="btn btn-circle text-white shadow-xl flex-shrink-0"
                        style={{
                            backgroundColor: 'var(--cal-primary)',
                            borderColor: 'var(--cal-primary)',
                            opacity: !noteText.trim() ? 0.4 : 1
                        }}
                    >
                        {isSaved ? "✓" : <Save className="w-4 h-4" />}
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
