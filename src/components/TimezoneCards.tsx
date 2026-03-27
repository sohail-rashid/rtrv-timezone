import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import type { TimezoneEntry } from '../types';
import { getCurrentTimeInZone, getOffsetString, getTimezoneAbbreviation, getCountryFlag, getRelativeOffset } from '../utils/timezone';

interface TimezoneCardsProps {
  onAddTimezone?: () => void;
}

export function TimezoneCards({ onAddTimezone }: TimezoneCardsProps) {
  const { state, removeTimezone, reorderTimezones, updateSettings } = useApp();
  const { addToast } = useToast();
  const [currentTimes, setCurrentTimes] = useState<Map<string, DateTime>>(new Map());
  const [draggedItem, setDraggedItem] = useState<TimezoneEntry | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Update times every second
  useEffect(() => {
    const updateTimes = () => {
      const newTimes = new Map<string, DateTime>();
      state.timezones.forEach((tz) => {
        newTimes.set(tz.id, getCurrentTimeInZone(tz.iana));
      });
      setCurrentTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [state.timezones]);

  const handleRemove = (id: string) => {
    const tz = state.timezones.find((t) => t.id === id);
    setRemovingId(id);
    setTimeout(() => {
      removeTimezone(id);
      setRemovingId(null);
      addToast(`Removed ${tz?.city || tz?.label || 'timezone'}`, 'info');
    }, 200);
  };

  const handleDragStart = (e: React.DragEvent, tz: TimezoneEntry) => {
    setDraggedItem(tz);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTz: TimezoneEntry) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetTz.id) return;

    const newTimezones = [...state.timezones];
    const draggedIndex = newTimezones.findIndex((tz) => tz.id === draggedItem.id);
    const targetIndex = newTimezones.findIndex((tz) => tz.id === targetTz.id);

    newTimezones.splice(draggedIndex, 1);
    newTimezones.splice(targetIndex, 0, draggedItem);

    reorderTimezones(newTimezones);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleSetPrimary = (id: string) => {
    updateSettings({ primaryZoneId: id });
  };

  if (state.timezones.length === 0) {
    return (
      <div className="glass-card p-8 text-center cursor-pointer" onClick={onAddTimezone}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--glass)' }}>
          <span className="text-3xl">🕐</span>
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>No Timezones Added</h3>
        <p style={{ color: 'var(--text-muted)' }}>Click here to add timezones</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {state.timezones.map((tz, index) => {
        const time = currentTimes.get(tz.id);
        const isPrimary = state.settings.primaryZoneId === tz.id;
        const isRemoving = removingId === tz.id;
        const isDragging = draggedItem?.id === tz.id;
        const flag = getCountryFlag(tz.iana);
        const primaryZone = state.timezones.find((t) => t.id === state.settings.primaryZoneId);
        const relOffset = primaryZone && !isPrimary ? getRelativeOffset(tz.iana, primaryZone.iana) : null;

        return (
          <div
            key={tz.id}
            draggable
            onDragStart={(e) => handleDragStart(e, tz)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, tz)}
            onDragEnd={handleDragEnd}
            style={{ order: isPrimary ? -1 : index }}
            className={`glass-card p-5 cursor-grab active:cursor-grabbing transition-all duration-200 group ${
              isPrimary ? 'active' : ''
            } ${isRemoving ? 'opacity-0 scale-95' : ''} ${isDragging ? 'opacity-50' : ''}`}
          >
            {/* Top Row: Flag + Actions */}
            <div className="flex items-start justify-between mb-2.5">
              <span className="text-[26px]">{flag}</span>
              
              {/* Actions - always visible */}
              <div className="flex items-center gap-1">
                {!isPrimary && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSetPrimary(tz.id); }}
                    title="Set as primary"
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--accent)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-glow)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                )}
                {isPrimary && (
                  <span
                    title="Primary timezone"
                    className="p-1.5"
                    style={{ color: 'var(--accent)' }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(tz.id); }}
                  title="Remove timezone"
                  className="p-1.5 rounded-lg hover:bg-[rgba(255,107,107,0.15)] transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* City & TZ */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[15px] truncate" style={{ color: 'var(--text)' }}>
                {tz.city || tz.label}
              </h3>
              <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                {tz.iana.replace('_', ' ')}
              </p>
            </div>

            {/* Time Display */}
            {time && (
              <>
                <div className="font-mono-time text-[28px] font-medium tracking-tight leading-none mt-3" style={{ color: 'var(--text)' }}>
                  {time.toFormat(state.settings.timeFormat === '12h' ? 'h:mm' : 'HH:mm')}
                  {state.settings.timeFormat === '12h' && (
                    <span className="text-[13px] font-normal ml-1 align-super" style={{ color: 'var(--text-muted)' }}>
                      {time.toFormat('a')}
                    </span>
                  )}
                </div>
                <div className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  {time.toFormat('EEE, MMM d')}
                </div>

                {/* Offset Badge */}
                <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-lg text-[11px] font-mono-time" style={{ background: 'var(--glass)', color: 'var(--text-muted)' }}>
                  {getTimezoneAbbreviation(tz.iana, time)} · {getOffsetString(tz.iana, time)}
                  {relOffset && (
                    <span className="ml-1 font-semibold" style={{ color: 'var(--accent)' }}>({relOffset})</span>
                  )}
                  {isPrimary && (
                    <span className="ml-1 font-semibold" style={{ color: 'var(--accent)' }}>(you)</span>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
