import { useState, useMemo, useCallback } from 'react';
import { DateTime } from 'luxon';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: DateTime;
  onChange: (dt: DateTime) => void;
}

export function DatePickerModal({ isOpen, onClose, value, onChange }: DatePickerModalProps) {
  const [viewDate, setViewDate] = useState(() => value.startOf('month'));

  const monthName = viewDate.toFormat('MMMM yyyy');

  const days = useMemo(() => {
    const start = viewDate.startOf('month');
    const end = viewDate.endOf('month');
    const startWeekday = start.weekday % 7; // 0=Sun

    const cells: { day: number; dt: DateTime; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean }[] = [];

    // Fill leading blanks from previous month
    for (let i = 0; i < startWeekday; i++) {
      const prev = start.minus({ days: startWeekday - i });
      cells.push({ day: prev.day, dt: prev, isCurrentMonth: false, isToday: false, isSelected: false });
    }

    // Current month days
    for (let d = 1; d <= end.day; d++) {
      const dt = viewDate.set({ day: d });
      const isToday = dt.hasSame(DateTime.now(), 'day');
      const isSelected = dt.hasSame(value, 'day');
      cells.push({ day: d, dt, isCurrentMonth: true, isToday, isSelected });
    }

    // Fill trailing blanks
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const next = end.plus({ days: i });
      cells.push({ day: next.day, dt: next, isCurrentMonth: false, isToday: false, isSelected: false });
    }

    return cells;
  }, [viewDate, value]);

  const handleSelect = useCallback((dt: DateTime) => {
    const newTime = value.set({ year: dt.year, month: dt.month, day: dt.day });
    onChange(newTime);
    onClose();
  }, [value, onChange, onClose]);

  const prevMonth = () => setViewDate((v) => v.minus({ months: 1 }));
  const nextMonth = () => setViewDate((v) => v.plus({ months: 1 }));
  const goToToday = () => {
    const today = DateTime.now();
    setViewDate(today.startOf('month'));
    handleSelect(today);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm modal-backdrop-enter"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-[340px] rounded-2xl shadow-2xl modal-content-enter p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(20px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top shine */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--card-shine)] to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="glass-btn p-2 text-[13px]" style={{ padding: '6px 10px' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>{monthName}</span>
            <button onClick={nextMonth} className="glass-btn p-2 text-[13px]" style={{ padding: '6px 10px' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-center text-[11px] font-medium py-1" style={{ color: 'var(--text-muted)' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(cell.dt)}
                className={`w-full aspect-square rounded-lg text-[13px] font-medium transition-all ${
                  cell.isSelected
                    ? 'text-white shadow-lg'
                    : cell.isToday
                    ? 'font-bold'
                    : cell.isCurrentMonth
                    ? ''
                    : 'opacity-30'
                }`}
                style={{
                  background: cell.isSelected
                    ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                    : cell.isToday
                    ? 'var(--accent-glow)'
                    : 'transparent',
                  color: cell.isSelected ? 'white' : cell.isToday ? 'var(--accent)' : 'var(--text)',
                  boxShadow: cell.isSelected ? '0 4px 16px var(--accent-glow)' : 'none',
                }}
              >
                {cell.day}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--glass-border)' }}>
            <button onClick={goToToday} className="glass-btn text-[12px]" style={{ padding: '6px 14px' }}>
              Today
            </button>
            <button onClick={onClose} className="glass-btn text-[12px]" style={{ padding: '6px 14px', color: 'var(--text-muted)' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: DateTime;
  onChange: (dt: DateTime) => void;
  format: '12h' | '24h';
}

export function TimePickerModal({ isOpen, onClose, value, onChange, format }: TimePickerModalProps) {
  const [hour, setHour] = useState(() => value.hour);
  const [minute, setMinute] = useState(() => value.minute);
  const [period, setPeriod] = useState<'AM' | 'PM'>(() => (value.hour >= 12 ? 'PM' : 'AM'));

  const displayHour = format === '12h' ? (hour % 12 === 0 ? 12 : hour % 12) : hour;

  const incrementHour = () => {
    if (format === '12h') {
      const h12 = displayHour === 12 ? 1 : displayHour + 1;
      let h24 = period === 'AM' ? h12 : h12 + 12;
      if (period === 'AM' && h12 === 12) h24 = 0;
      if (period === 'PM' && h12 === 12) h24 = 12;
      setHour(h24);
    } else {
      setHour((h) => (h + 1) % 24);
    }
  };

  const decrementHour = () => {
    if (format === '12h') {
      const h12 = displayHour === 1 ? 12 : displayHour - 1;
      let h24 = period === 'AM' ? h12 : h12 + 12;
      if (period === 'AM' && h12 === 12) h24 = 0;
      if (period === 'PM' && h12 === 12) h24 = 12;
      setHour(h24);
    } else {
      setHour((h) => (h - 1 + 24) % 24);
    }
  };

  const incrementMinute = () => setMinute((m) => (m + 5) % 60);
  const decrementMinute = () => setMinute((m) => (m - 5 + 60) % 60);

  const togglePeriod = () => {
    setPeriod((p) => {
      const newP = p === 'AM' ? 'PM' : 'AM';
      // Adjust hour
      setHour((h) => {
        if (newP === 'PM' && h < 12) return h + 12;
        if (newP === 'AM' && h >= 12) return h - 12;
        return h;
      });
      return newP;
    });
  };

  const handleApply = () => {
    const newTime = value.set({ hour, minute });
    onChange(newTime);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm modal-backdrop-enter"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-[300px] rounded-2xl shadow-2xl modal-content-enter p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(20px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top shine */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--card-shine)] to-transparent" />

          <h3 className="text-[15px] font-semibold text-center mb-5" style={{ color: 'var(--text)' }}>Set Time</h3>

          {/* Spinners */}
          <div className="flex items-center justify-center gap-3">
            {/* Hour */}
            <div className="flex flex-col items-center gap-1.5">
              <button onClick={incrementHour} className="glass-btn p-1.5" style={{ padding: '4px 8px' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center font-mono-time text-[28px] font-semibold"
                style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text)' }}
              >
                {displayHour.toString().padStart(2, '0')}
              </div>
              <button onClick={decrementHour} className="glass-btn p-1.5" style={{ padding: '4px 8px' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Separator */}
            <span className="font-mono-time text-[28px] font-bold mt-[-4px]" style={{ color: 'var(--accent)' }}>:</span>

            {/* Minute */}
            <div className="flex flex-col items-center gap-1.5">
              <button onClick={incrementMinute} className="glass-btn p-1.5" style={{ padding: '4px 8px' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center font-mono-time text-[28px] font-semibold"
                style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text)' }}
              >
                {minute.toString().padStart(2, '0')}
              </div>
              <button onClick={decrementMinute} className="glass-btn p-1.5" style={{ padding: '4px 8px' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* AM/PM (only in 12h mode) */}
            {format === '12h' && (
              <div className="flex flex-col items-center gap-1.5 ml-1">
                <button
                  onClick={togglePeriod}
                  className="w-14 h-16 rounded-xl flex items-center justify-center font-mono-time text-[16px] font-semibold transition-all mt-[26px]"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    color: 'white',
                    border: '1px solid transparent',
                    boxShadow: '0 4px 16px var(--accent-glow)',
                  }}
                >
                  {period}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-5 pt-3" style={{ borderTop: '1px solid var(--glass-border)' }}>
            <button onClick={onClose} className="glass-btn text-[12px]" style={{ padding: '6px 14px', color: 'var(--text-muted)' }}>
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="glass-btn text-[12px]"
              style={{
                padding: '6px 18px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                color: 'white',
                border: '1px solid transparent',
                boxShadow: '0 4px 16px var(--accent-glow)',
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
