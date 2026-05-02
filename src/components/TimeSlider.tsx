import { useMemo, useState, useRef, useCallback } from 'react';
import { DateTime } from 'luxon';
import { useApp } from '../context/AppContext';
import { getCountryFlag } from '../utils/timezone';

interface TimeSliderProps {
  onOpenDatePicker: () => void;
  onOpenTimePicker: () => void;
}

export function TimeSlider({ onOpenDatePicker, onOpenTimePicker }: TimeSliderProps) {
  const { state, setAnchorTime, getPrimaryZone, resetToNow } = useApp();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const anchorTime = useMemo(() => DateTime.fromISO(state.anchorTime), [state.anchorTime]);
  const primaryZone = getPrimaryZone();
  const timeInZone = anchorTime.setZone(primaryZone.iana);
  const now = DateTime.now().setZone(primaryZone.iana);
  const flag = getCountryFlag(primaryZone.iana);

  // Calculate day difference from now
  const dayDiff = useMemo(() => {
    const nowStart = now.startOf('day');
    const anchorStart = timeInZone.startOf('day');
    return Math.round(anchorStart.diff(nowStart, 'days').days);
  }, [timeInZone, now]);

  // The slider range is based on the anchor time's day
  const sliderDayStart = useMemo(() => {
    return timeInZone.startOf('day');
  }, [timeInZone]);

  const sliderDayEnd = useMemo(() => {
    return timeInZone.endOf('day');
  }, [timeInZone]);

  // Calculate slider position (0-100)
  const sliderPosition = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    const diffMs = timeInZone.diff(sliderDayStart).as('milliseconds');
    return Math.max(0, Math.min(100, (diffMs / dayMs) * 100));
  }, [timeInZone, sliderDayStart]);

  // Convert position to time
  const positionToTime = useCallback((position: number) => {
    const dayMs = 24 * 60 * 60 * 1000;
    const newTime = sliderDayStart.plus({ milliseconds: (position / 100) * dayMs });
    return newTime;
  }, [sliderDayStart]);

  // Handle pointer events
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !sliderRef.current) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const updatePosition = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const position = ((clientX - rect.left) / rect.width) * 100;
    const clampedPosition = Math.max(0, Math.min(100, position));
    const newTime = positionToTime(clampedPosition);
    setAnchorTime(newTime);
  };

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    let delta = 0;
    if (e.key === 'ArrowLeft') delta = -state.settings.resolution;
    else if (e.key === 'ArrowRight') delta = state.settings.resolution;

    if (delta !== 0) {
      e.preventDefault();
      setAnchorTime(anchorTime.plus({ minutes: delta }));
    }
  };

  // Quick adjust time
  const adjustTime = (minutes: number) => {
    setAnchorTime(anchorTime.plus({ minutes }));
  };

  // Adjust by days
  const adjustDays = (days: number) => {
    setAnchorTime(anchorTime.plus({ days }));
  };

  // Calculate "now" position on slider
  const nowPosition = useMemo(() => {
    if (dayDiff !== 0) return null;
    const dayMs = 24 * 60 * 60 * 1000;
    const diffMs = now.diff(sliderDayStart).as('milliseconds');
    const pos = (diffMs / dayMs) * 100;
    if (pos < 0 || pos > 100) return null;
    return pos;
  }, [now, sliderDayStart, dayDiff]);

  // Time format based on settings
  const timeFormat = state.settings.timeFormat === '12h' ? 'h:mm' : 'HH:mm';

  return (
    <div className="glass-card p-6 sm:p-7">
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        {/* Location & Live Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="live-dot" />
          <span className="text-[22px]">{flag}</span>
          <span className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
            {primaryZone.city || primaryZone.label}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md tracking-wide" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
            PRIMARY
          </span>
        </div>

        {/* Time Controls */}
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <button onClick={resetToNow} className="glass-btn font-mono-time text-[12px]"><span>⏱</span> Now</button>
          <button onClick={() => adjustDays(-1)} className="glass-btn font-mono-time text-[12px]">◀ Day</button>
          <button onClick={() => adjustTime(-60)} className="glass-btn font-mono-time text-[12px]">−1h</button>
          <button onClick={() => adjustTime(-30)} className="glass-btn font-mono-time text-[12px]">−30m</button>
          <button onClick={() => adjustTime(30)} className="glass-btn font-mono-time text-[12px]">+30m</button>
          <button onClick={() => adjustTime(60)} className="glass-btn font-mono-time text-[12px]">+1h</button>
          <button onClick={() => adjustDays(1)} className="glass-btn font-mono-time text-[12px]">Day ▶</button>
          {/* Date Picker Trigger */}
          <button
            onClick={onOpenDatePicker}
            className="glass-btn font-mono-time text-[12px]"
            title="Jump to date"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Date</span>
          </button>
        </div>
      </div>

      {/* Main Time Display */}
      <div className="mt-5 flex items-baseline gap-4">
        <span
          className="font-mono-time text-[72px] font-medium leading-none tracking-tight bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
          title="Click to set time"
          onClick={onOpenTimePicker}
        >
          {timeInZone.toFormat(timeFormat)}
        </span>
        {state.settings.timeFormat === '12h' && (
          <span className="font-mono-time text-[22px] font-normal" style={{ color: 'var(--text-muted)' }}>
            {timeInZone.toFormat('a')}
          </span>
        )}
      </div>
      <div
        className="text-[14px] mt-1 cursor-pointer hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1.5"
        style={{ color: 'var(--text-muted)' }}
        onClick={onOpenDatePicker}
        title="Click to change date"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {timeInZone.toFormat('EEEE, MMMM d, yyyy')}
      </div>

      {/* Slider */}
      <div className="mt-6">
        <div
          ref={sliderRef}
          className="relative h-6 cursor-pointer touch-none group"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="slider"
          aria-label="Time slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(sliderPosition)}
        >
          {/* Track */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full" style={{ background: 'var(--glass-border)' }}>
            {/* Progress fill with gradient */}
            <div 
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-75"
              style={{ width: `${sliderPosition}%`, background: `linear-gradient(90deg, var(--accent), var(--accent2))` }}
            />
            
            {/* Now marker */}
            {nowPosition !== null && (
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-0.5 h-3 rounded-full"
                style={{ left: `${nowPosition}%`, background: 'var(--success)' }}
              />
            )}
          </div>

          {/* Thumb */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform duration-75 ${
              isDragging ? 'scale-110' : 'group-hover:scale-105'
            }`}
            style={{ left: `${sliderPosition}%` }}
          >
            <div className={`w-[18px] h-[18px] bg-white rounded-full shadow-lg ${
              isDragging ? 'shadow-[0_2px_12px_rgba(196,154,66,0.5)]' : 'shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
            }`} />
            {/* Tooltip on drag */}
            {isDragging && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-mono-time rounded-lg shadow-lg whitespace-nowrap" style={{ background: 'var(--tooltip-bg)', color: 'var(--tooltip-text)', border: '1px solid var(--glass-border)' }}>
                {anchorTime.setZone(primaryZone.iana).toFormat(state.settings.timeFormat === '12h' ? 'h:mm a' : 'HH:mm')}
              </div>
            )}
          </div>
        </div>

        {/* Slider Labels */}
        <div className="flex justify-between mt-3 text-[11px] font-mono-time" style={{ color: 'var(--text-muted)' }}>
          <span>{sliderDayStart.toFormat(state.settings.timeFormat === '12h' ? 'h:mm a' : 'HH:mm')}</span>
          <span>{sliderDayEnd.toFormat(state.settings.timeFormat === '12h' ? 'h:mm a' : 'HH:mm')}</span>
        </div>
      </div>
    </div>
  );
}
