"use client";

import React from 'react';
import { format } from 'date-fns';
import { X, Calendar, MessageSquare, Info, ChevronRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ViewEventsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  dayEvents: any[];
};

export default function ViewEventsModal({ isOpen, onClose, date, dayEvents }: ViewEventsModalProps) {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  if (!date) return null;

  const toggleExpand = (id: string) => {
    const next = new Set(expandedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedItems(next);
  };

  const handleDeleteItem = (item: any) => {
    const key = item.key || `calendar_notes_${format(new Date(item.startDate), 'yyyy-MM-dd')}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      const entries = Array.isArray(parsed) ? parsed : [parsed];
      const updated = entries.filter((i: any) => (i.id || i.key) !== (item.id || item.key));

      if (updated.length === 0) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(updated));
      }

      // Dispatch sync event
      window.dispatchEvent(new CustomEvent('calendar_data_updated'));
      
      // If no events left for this day, close or refresh will happen via sync
    } catch (e) {}
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with extreme blur for theme focus */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[110]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[94%] max-w-lg z-[111] overflow-hidden"
          >
            <div 
              className="rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border relative flex flex-col"
              style={{ 
                background: 'var(--cal-paper)', 
                color: 'var(--cal-paper-text)', 
                borderColor: 'var(--cal-border)' 
              }}
            >
              {/* Dynamic Theme Gradient Header */}
              <div 
                className="h-44 relative flex items-end px-12 pb-8 overflow-hidden group"
                style={{ 
                   background: `linear-gradient(135deg, var(--cal-primary) 0%, rgba(0,0,0,0.2) 100%)`,
                   backgroundColor: 'var(--cal-primary)'
                }}
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-24 -mr-20 -mt-20 bg-white/20 rounded-full blur-[100px] pointer-events-none transition-transform group-hover:scale-110" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                <div className="relative z-10 text-white">
                  <motion.p 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-[11px] font-black uppercase tracking-[0.3em] opacity-70 mb-2"
                  >
                    Daily Snapshot
                  </motion.p>
                  <motion.h3 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-black tracking-tighter italic uppercase leading-none"
                  >
                    {format(date, 'MMM do')}
                  </motion.h3>
                  <p className="text-xs font-bold opacity-60 mt-1">{format(date, 'eeee, yyyy')}</p>
                </div>

                {/* Premium Cross Button */}
                <button 
                  onClick={onClose} 
                  className="absolute top-8 right-8 h-10 px-3 flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95 border border-white/20 text-white group/btn"
                  title="Close (ESC)"
                >
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[8px] font-sans font-black bg-black/20 rounded border border-white/20 opacity-60 uppercase group-hover/btn:opacity-100 transition-opacity">Esc</kbd>
                  <X className="w-5 h-5 transition-transform group-hover/btn:rotate-90 opacity-80 group-hover/btn:opacity-100" />
                </button>
              </div>

              {/* Content List */}
              <div className="p-10 max-h-[55vh] overflow-y-auto custom-scrollbar flex-1">
                {dayEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-5 opacity-20">
                    <div className="w-20 h-20 rounded-[2rem] border-[2px] border-dashed border-current flex items-center justify-center">
                        <Info className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black tracking-widest uppercase">No activities recorded</p>
                      <p className="text-[10px] font-bold opacity-60">This day is currently blank in your schedule.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dayEvents.map((item, idx) => {
                      const itemId = item.id || item.key + idx;
                      const isExpanded = expandedItems.has(itemId);
                      const isLong = item.text && item.text.length > 60;

                      return (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          key={itemId} 
                          className="group relative flex items-start gap-6 p-5 rounded-[2rem] bg-black/5 hover:bg-black/10 border border-transparent hover:border-black/5 transition-all cursor-default"
                        >
                           <div className={`p-4 rounded-2xl shadow-lg transition-transform group-hover:rotate-6 shrink-0 mt-1 ${item.type === 'event' ? 'bg-[var(--cal-primary)] text-white' : 'bg-black/10 text-base-content/40'}`}>
                              {item.type === 'event' ? <Calendar className="w-5 h-5 shadow-2xl" /> : <MessageSquare className="w-5 h-5" />}
                           </div>

                          <div className="flex-1 min-w-0">
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${item.type === 'event' ? 'text-[var(--cal-primary)]' : 'opacity-30'}`}>
                              {item.type}
                            </p>
                            <p className={`text-base leading-snug whitespace-pre-wrap ${item.type === 'event' ? 'font-black tracking-tighter text-base-content' : 'italic opacity-60'} ${!isExpanded ? 'line-clamp-2' : ''}`}>
                              {item.text}
                            </p>
                            {isLong && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleExpand(itemId); }}
                                    className="text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity mt-2 flex items-center gap-1"
                                >
                                    {isExpanded ? "Show Less" : "See More..."}
                                </button>
                            )}
                          </div>
                          
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteItem(item); }}
                            className="p-2.5 rounded-xl text-red-500 bg-red-500/0 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* High-Fidelity Close Button */}
              <div className="p-8 pt-0 flex justify-center">
                    <button 
                        onClick={onClose} 
                        className="group flex items-center gap-3 px-12 py-4 rounded-full border border-black/5 hover:bg-black/5 transition-all active:scale-95 shadow-sm overflow-hidden relative"
                    >
                        <span className="relative z-10 font-black text-[12px] uppercase tracking-[0.3em] opacity-40 group-hover:opacity-90 transition-opacity">
                            Back to Wall
                        </span>
                        <ChevronRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-40 group-hover:translate-x-0 transition-all" />
                    </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
