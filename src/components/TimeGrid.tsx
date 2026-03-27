import { useMemo, useRef, useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { useApp } from '../context/AppContext';
import { generateTimeSlots, getTooltipText, getTimezoneAbbreviation, getCountryFlag } from '../utils/timezone';
import type { TimezoneEntry } from '../types';

export function TimeGrid() {
  const { state, setAnchorTime, getPrimaryZone, reorderTimezones, updateSettings } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{ zoneId: string; slotIndex: number } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isDraggingTime, setIsDraggingTime] = useState(false);
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const [dragOverRowId, setDragOverRowId] = useState<string | null>(null);

  const anchorTime = useMemo(() => DateTime.fromISO(state.anchorTime), [state.anchorTime]);
  const primaryZone = getPrimaryZone();

  // Generate slots for all timezones
  const gridData = useMemo(() => {
    return state.timezones.map((tz) => ({
      timezone: tz,
      slots: generateTimeSlots(
        anchorTime,
        primaryZone.iana,
        tz.iana,
        state.settings.hourRange,
        state.settings.resolution
      ),
    }));
  }, [state.timezones, anchorTime, primaryZone.iana, state.settings.hourRange, state.settings.resolution]);

  // Separate primary row from other rows
  const primaryRow = useMemo(() => {
    return gridData.find((row) => row.timezone.id === state.settings.primaryZoneId);
  }, [gridData, state.settings.primaryZoneId]);

  const otherRows = useMemo(() => {
    return gridData.filter((row) => row.timezone.id !== state.settings.primaryZoneId);
  }, [gridData, state.settings.primaryZoneId]);

  // Find "now" column index (visual highlight only)
  const nowColumnIndex = useMemo(() => {
    if (gridData.length === 0) return -1;
    const now = DateTime.now();
    const slots = gridData[0].slots;
    return slots.findIndex((slot) => {
      const slotEnd = slot.time.plus({ minutes: state.settings.resolution });
      return now >= slot.time && now < slotEnd;
    });
  }, [gridData, state.settings.resolution]);

  // Find the column that contains the anchor time in the primary zone
  const anchorColumnIndex = useMemo(() => {
    if (!primaryRow) return -1;
    const anchor = anchorTime.setZone(primaryZone.iana);
    return primaryRow.slots.findIndex((slot) => {
      const slotEnd = slot.time.plus({ minutes: state.settings.resolution });
      return anchor >= slot.time && anchor < slotEnd;
    });
  }, [primaryRow, anchorTime, primaryZone.iana, state.settings.resolution]);

  // Scroll to anchor column whenever anchor time or settings change, but not during grid drag
  useEffect(() => {
    if (isDraggingTime) return;
    if (anchorColumnIndex >= 0 && scrollContainerRef.current) {
      const cellWidthPx = state.settings.resolution === 60 ? 64 : 48;
      const scrollLeft = anchorColumnIndex * cellWidthPx - scrollContainerRef.current.clientWidth / 2 + cellWidthPx / 2;
      scrollContainerRef.current.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
    }
  }, [anchorColumnIndex, state.anchorTime, state.settings.resolution, isDraggingTime]);

  // Handle mouse/touch drag to adjust time (on header only)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDraggingTime(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingTime) return;
    const cellWidth = state.settings.resolution === 60 ? 64 : 48;
    const delta = -e.movementX / cellWidth;
    if (Math.abs(delta) > 0.1) {
      const newTime = anchorTime.plus({ minutes: delta * state.settings.resolution * 10 });
      setAnchorTime(newTime);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDraggingTime(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    let delta = 0;
    if (e.key === 'ArrowLeft') delta = -state.settings.resolution;
    else if (e.key === 'ArrowRight') delta = state.settings.resolution;
    else if (e.key === 'ArrowUp') delta = -60;
    else if (e.key === 'ArrowDown') delta = 60;

    if (delta !== 0) {
      e.preventDefault();
      setAnchorTime(anchorTime.plus({ minutes: delta }));
    }
  };

  // Handle cell hover for tooltips
  const handleCellHover = (e: React.MouseEvent, zoneId: string, slotIndex: number) => {
    setHoveredCell({ zoneId, slotIndex });
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

  // Get tooltip content
  const getTooltipContent = () => {
    if (!hoveredCell) return null;
    const row = gridData.find((d) => d.timezone.id === hoveredCell.zoneId);
    if (!row) return null;
    const slot = row.slots[hoveredCell.slotIndex];
    if (!slot) return null;
    return getTooltipText(slot.time, row.timezone.label);
  };

  // Row drag and drop handlers
  const handleRowDragStart = (e: React.DragEvent, tz: TimezoneEntry) => {
    setDraggedRowId(tz.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tz.id);
  };

  const handleRowDragOver = (e: React.DragEvent, tz: TimezoneEntry) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedRowId && draggedRowId !== tz.id) {
      setDragOverRowId(tz.id);
    }
  };

  const handleRowDragLeave = () => {
    setDragOverRowId(null);
  };

  const handleRowDrop = (e: React.DragEvent, targetTz: TimezoneEntry) => {
    e.preventDefault();
    if (!draggedRowId || draggedRowId === targetTz.id) {
      setDraggedRowId(null);
      setDragOverRowId(null);
      return;
    }

    const newTimezones = [...state.timezones];
    const draggedIndex = newTimezones.findIndex((tz) => tz.id === draggedRowId);
    const targetIndex = newTimezones.findIndex((tz) => tz.id === targetTz.id);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedItem] = newTimezones.splice(draggedIndex, 1);
      newTimezones.splice(targetIndex, 0, draggedItem);
      reorderTimezones(newTimezones);
    }

    setDraggedRowId(null);
    setDragOverRowId(null);
  };

  const handleRowDragEnd = () => {
    setDraggedRowId(null);
    setDragOverRowId(null);
  };

  if (state.timezones.length === 0) {
    return (
      <div className="glass-card p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--glass)' }}>
          <svg className="w-8 h-8" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>No Time Comparison Yet</h3>
        <p className="text-[13px] max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
          Add timezones using the "Add Zone" button above to see a side-by-side time comparison grid.
        </p>
      </div>
    );
  }

  const cellWidth = state.settings.resolution === 60 ? 'w-16' : 'w-12';
  const timeFormatString = state.settings.timeFormat === '12h' ? 'h:mm a' : 'HH:mm';
  const rowHeight = 'h-14';

  return (
    <div className="glass-card glass-card-static overflow-hidden p-0">
      {/* Controls Toolbar */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--glass-border)', background: 'var(--glass)' }}>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Title */}
          <h2 className="text-[14px] font-semibold mr-auto" style={{ color: 'var(--text)' }}>
            Time Comparison
          </h2>

          {/* Primary Zone Selector */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Primary:</label>
            <select
              value={state.settings.primaryZoneId}
              onChange={(e) => updateSettings({ primaryZoneId: e.target.value })}
              className="px-2.5 py-1.5 text-[11px] rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text)', '--tw-ring-color': 'var(--accent-glow)' } as React.CSSProperties}
            >
              {state.timezones.map((tz) => (
                <option key={tz.id} value={tz.id} style={{ background: 'var(--bg-primary)' }}>
                  {tz.city || tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Hour Range */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Range:</span>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--glass-border)' }}>
              {([12, 24, 48] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => updateSettings({ hourRange: range })}
                  className={`px-2.5 py-1.5 text-[11px] font-medium transition-all`}
                  style={state.settings.hourRange === range ? { background: 'var(--accent)', color: 'white' } : { background: 'var(--glass)', color: 'var(--text-secondary)' }}
                >
                  {range}h
                </button>
              ))}
            </div>
          </div>

          {/* Resolution */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Interval:</span>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--glass-border)' }}>
              {([30, 60] as const).map((res) => (
                <button
                  key={res}
                  onClick={() => updateSettings({ resolution: res })}
                  className={`px-2.5 py-1.5 text-[11px] font-medium transition-all`}
                  style={state.settings.resolution === res ? { background: 'var(--accent)', color: 'white' } : { background: 'var(--glass)', color: 'var(--text-secondary)' }}
                >
                  {res}m
                </button>
              ))}
            </div>
          </div>

          {/* Format Toggle */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--glass-border)' }}>
            {(['12h', '24h'] as const).map((format) => (
              <button
                key={format}
                onClick={() => updateSettings({ timeFormat: format })}
                className={`px-2.5 py-1.5 text-[11px] font-medium transition-all`}
                style={state.settings.timeFormat === format ? { background: 'var(--accent)', color: 'white' } : { background: 'var(--glass)', color: 'var(--text-secondary)' }}
              >
                {format === '12h' ? 'AM/PM' : '24h'}
              </button>
            ))}
          </div>

          {/* Business Hours Toggle */}
          <button
            onClick={() => updateSettings({ showBusinessHours: !state.settings.showBusinessHours })}
            className={`px-2.5 py-1.5 text-[11px] font-medium rounded-lg transition-all`}
            style={state.settings.showBusinessHours ? { background: 'var(--accent)', color: 'white' } : { background: 'var(--glass)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}
            title="Toggle business/night hour shading"
          >
            Hours
          </button>

          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4 ml-auto text-[11px]" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--anchor-bg)', border: '1px solid rgba(251,146,60,0.5)' }}></div>
              <span className="font-medium">Selected</span>
            </div>
            {state.settings.showBusinessHours && (
              <>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--business-bg)', border: '1px solid rgba(74,222,128,0.4)' }}></div>
                  <span className="font-medium">Business</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--night-bg)', border: '1px solid var(--glass-border)' }}></div>
                  <span className="font-medium">Night</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--now-bg)', border: '1px solid rgba(56,178,172,0.5)' }}></div>
              <span className="font-medium">Now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid with single horizontal scroll */}
      <div className="flex">
        {/* Sticky Labels Column */}
        <div className="sticky left-0 z-20 flex-shrink-0" style={{ background: 'var(--glass)', backdropFilter: 'blur(40px) saturate(180%)' }}>
          {/* Primary Zone Label */}
          {primaryRow && (
            <div className={`w-32 sm:w-44 px-3 ${rowHeight} flex items-center gap-2.5`} style={{ background: 'var(--accent-glow)', borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
              <span className="text-[18px]">{getCountryFlag(primaryRow.timezone.iana)}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13px] truncate" style={{ color: 'var(--text)' }}>
                  {primaryRow.timezone.city || primaryRow.timezone.label}
                </div>
                <div className="text-[10px] flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                  <span>{getTimezoneAbbreviation(primaryRow.timezone.iana)}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>PRIMARY</span>
                </div>
              </div>
            </div>
          )}

          {/* Other Zone Labels */}
          {otherRows.map((row) => {
            const isDragging = draggedRowId === row.timezone.id;
            const isDragOver = dragOverRowId === row.timezone.id;

            return (
              <div 
                key={row.timezone.id}
                className={`w-32 sm:w-44 px-3 ${rowHeight} flex items-center gap-2.5 cursor-grab active:cursor-grabbing group transition-all ${
                  isDragging ? 'opacity-50' : ''
                } ${isDragOver ? 'border-t-2' : ''}`}
                style={{ background: isDragging ? 'var(--glass-hover)' : 'transparent', borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', borderTopColor: isDragOver ? 'var(--accent)' : 'transparent' }}
                draggable
                onDragStart={(e) => handleRowDragStart(e, row.timezone)}
                onDragOver={(e) => handleRowDragOver(e, row.timezone)}
                onDragLeave={handleRowDragLeave}
                onDrop={(e) => handleRowDrop(e, row.timezone)}
                onDragEnd={handleRowDragEnd}
              >
                {/* Drag handle */}
                <div className="flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                  </svg>
                </div>
                <span className="text-[18px]">{getCountryFlag(row.timezone.iana)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[13px] truncate" style={{ color: 'var(--text)' }}>
                    {row.timezone.city || row.timezone.label}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {getTimezoneAbbreviation(row.timezone.iana)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollable Time Cells Container - single scroll for all rows */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto scrollbar-hide"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="slider"
          aria-label="Time slider"
        >
          <div className="inline-block min-w-full">
            {/* Primary Row Cells */}
            {primaryRow && (
              <div className="flex" style={{ borderBottom: '1px solid var(--glass-border)', background: 'var(--accent-glow)' }}>
                {primaryRow.slots.map((slot, idx) => {
                  const isHourStart = slot.time.minute === 0;
                  const isDayStart = slot.time.hour === 0 && slot.time.minute === 0;
                  const isNow = idx === nowColumnIndex;
                  const isAnchor = idx === anchorColumnIndex;

                  let bgStyle = { background: 'rgba(196,154,66,0.05)' };
                  if (isAnchor) {
                    bgStyle = { background: 'var(--anchor-bg)' };
                  } else if (isNow) {
                    bgStyle = { background: 'var(--now-bg)' };
                  } else if (state.settings.showBusinessHours && slot.isNightHour) {
                    bgStyle = { background: 'var(--night-bg)' };
                  } else if (state.settings.showBusinessHours && slot.isBusinessHour) {
                    bgStyle = { background: 'var(--business-bg)' };
                  }

                  return (
                    <div
                      key={idx}
                      className={`${cellWidth} ${rowHeight} flex-shrink-0 px-1 text-center flex flex-col items-center justify-center`}
                      style={{ ...bgStyle, borderRight: '1px solid var(--glass-border)', borderLeft: isDayStart ? '2px solid var(--accent)' : 'none' }}
                      onMouseEnter={(e) => handleCellHover(e, primaryRow.timezone.id, idx)}
                      onMouseLeave={handleCellLeave}
                    >
                      {isDayStart && (
                        <div className="text-[9px] font-medium" style={{ color: 'var(--accent)' }}>
                          {slot.time.toFormat('EEE d')}
                        </div>
                      )}
                      <div className="text-[12px] font-mono-time" style={{ fontWeight: isHourStart ? 600 : 500, color: isHourStart ? 'var(--text)' : 'var(--text-secondary)' }}>
                        {slot.time.toFormat(timeFormatString)}
                      </div>
                      {isDayStart && (
                        <div className="text-[9px] font-medium" style={{ color: 'var(--accent)' }}>
                          {slot.isToday ? 'Today' : slot.isTomorrow ? 'Tomorrow' : slot.isYesterday ? 'Yesterday' : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Other Rows Cells */}
            {otherRows.map((row) => {
              const isDragging = draggedRowId === row.timezone.id;
              const isDragOver = dragOverRowId === row.timezone.id;

              return (
                <div 
                  key={row.timezone.id} 
                  className={`flex last:border-b-0 transition-all ${
                    isDragging ? 'opacity-50' : ''
                  } ${isDragOver ? 'border-t-2' : ''}`}
                  style={{ borderBottom: '1px solid var(--glass-border)', borderTopColor: isDragOver ? 'var(--accent)' : 'transparent' }}
                >
                  {row.slots.map((slot, idx) => {
                    const isNow = idx === nowColumnIndex;
                    const isAnchor = idx === anchorColumnIndex;
                    const isDayStart = slot.time.hour === 0 && slot.time.minute === 0;
                    const isHourStart = slot.time.minute === 0;

                    let bgStyle = { background: 'transparent' };
                    if (isAnchor) {
                      bgStyle = { background: 'var(--anchor-bg)' };
                    } else if (isNow) {
                      bgStyle = { background: 'var(--now-bg)' };
                    } else if (state.settings.showBusinessHours && slot.isNightHour) {
                      bgStyle = { background: 'var(--night-bg)' };
                    } else if (state.settings.showBusinessHours && slot.isBusinessHour) {
                      bgStyle = { background: 'var(--business-bg)' };
                    }

                    return (
                      <div
                        key={idx}
                        className={`${cellWidth} ${rowHeight} flex-shrink-0 px-1 text-center transition-colors cursor-pointer flex flex-col items-center justify-center`}
                        style={{ ...bgStyle, borderRight: '1px solid var(--glass-border)', borderLeft: isDayStart ? '2px solid var(--accent)' : 'none' }}
                        onMouseEnter={(e) => handleCellHover(e, row.timezone.id, idx)}
                        onMouseLeave={handleCellLeave}
                      >
                        <div className="text-[12px] font-mono-time" style={{ fontWeight: isHourStart ? 500 : 400, color: isHourStart ? 'var(--text)' : 'var(--text-muted)' }}>
                          {slot.time.toFormat(timeFormatString)}
                        </div>
                        {isDayStart && (
                          <div className="text-[9px] font-medium" style={{ color: 'var(--accent)' }}>
                            {slot.isToday ? 'Today' : slot.isTomorrow ? 'Tomorrow' : slot.isYesterday ? 'Yesterday' : slot.time.toFormat('EEE')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 px-3 py-2 text-[12px] rounded-lg shadow-lg pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y + 10,
            background: 'var(--tooltip-bg)',
            color: 'var(--tooltip-text)',
            border: '1px solid var(--glass-border)',
          }}
        >
          {getTooltipContent()}
        </div>
      )}
    </div>
  );
}