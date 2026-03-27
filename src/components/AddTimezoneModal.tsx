import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { COMMON_TIMEZONES, PRESET_TIMEZONES, type TimezoneEntry } from '../types';
import { searchTimezones, generateTimezoneId, getCurrentTimeInZone, formatTime, getCountryFlag, getOffsetString } from '../utils/timezone';

interface AddTimezoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTimezoneModal({ isOpen, onClose }: AddTimezoneModalProps) {
  const { addTimezone, state } = useApp();
  const { addToast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof COMMON_TIMEZONES>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      const found = searchTimezones(query, COMMON_TIMEZONES);
      setResults(found);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleAddTimezone = (iana: string, label: string) => {
    // Check if already added
    if (state.timezones.some((tz) => tz.iana === iana)) {
      addToast(`${label} is already added`, 'warning');
      onClose();
      return;
    }

    const newTz: TimezoneEntry = {
      id: generateTimezoneId(iana),
      iana,
      label,
    };
    addTimezone(newTz);
    addToast(`Added ${label}`, 'success');
    setQuery('');
    onClose();
  };

  const handlePresetClick = (preset: TimezoneEntry) => {
    if (state.timezones.some((tz) => tz.iana === preset.iana)) {
      addToast(`${preset.city || preset.label} is already added`, 'warning');
      return;
    }

    const newTz: TimezoneEntry = {
      id: generateTimezoneId(preset.iana),
      iana: preset.iana,
      label: preset.label,
      city: preset.city,
    };
    addTimezone(newTz);
    addToast(`Added ${preset.city || preset.label}`, 'success');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && results.length > 0) {
      handleAddTimezone(results[0].iana, results[0].label);
    }
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
          className="relative w-full max-w-lg rounded-2xl shadow-2xl modal-content-enter"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(20px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Add Timezone</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search city, timezone, or abbreviation..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6c8fff]/40 transition-all"
                style={{ border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'var(--text)' }}
              />
            </div>

            {/* Search Results */}
            {query.trim() && results.length === 0 && (
              <div className="mt-3 p-6 text-center rounded-xl" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass)' }}>
                <div className="text-2xl mb-2">🔍</div>
                <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>No timezones found</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Try searching by city name, country, or abbreviation (e.g. "PST", "London")</div>
              </div>
            )}
            {results.length > 0 && (
              <div className="mt-3 max-h-48 overflow-y-auto rounded-xl" style={{ border: '1px solid var(--glass-border)' }}>
                {results.map((tz, idx) => {
                  const isAdded = state.timezones.some((t) => t.iana === tz.iana);
                  const currentTime = getCurrentTimeInZone(tz.iana);
                  const flag = getCountryFlag(tz.iana);
                  const offset = getOffsetString(tz.iana);
                  return (
                    <button
                      key={tz.iana}
                      onClick={() => handleAddTimezone(tz.iana, tz.label)}
                      disabled={isAdded}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors hover:bg-[rgba(108,143,255,0.08)] ${
                        isAdded ? 'cursor-not-allowed opacity-60' : ''
                      }`}
                      style={{ 
                        background: isAdded ? 'var(--glass)' : 'transparent',
                        borderBottom: idx < results.length - 1 ? '1px solid var(--glass-border)' : 'none',
                        color: isAdded ? 'var(--text-muted)' : 'var(--text)'
                      }}
                    >
                      <span className="text-xl flex-shrink-0">{flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[14px] truncate">{tz.label}</div>
                        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{tz.iana} · {offset}</div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {isAdded ? (
                          <span className="text-[11px] font-medium px-2 py-1 rounded-full" style={{ background: 'var(--glass)', color: 'var(--text-muted)' }}>
                            Added
                          </span>
                        ) : (
                          <div className="font-mono-time text-[13px] font-medium" style={{ color: 'var(--accent)' }}>
                            {formatTime(currentTime, state.settings.timeFormat)}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Add Presets */}
          <div className="px-4 pb-4">
            <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Quick Add</div>
            <div className="flex flex-wrap gap-2">
              {PRESET_TIMEZONES.map((preset) => {
                const isAdded = state.timezones.some((t) => t.iana === preset.iana);
                const currentTime = getCurrentTimeInZone(preset.iana);
                const flag = getCountryFlag(preset.iana);
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset)}
                    disabled={isAdded}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${
                      isAdded ? 'cursor-not-allowed opacity-60' : 'hover:text-[#6c8fff] hover:border-[rgba(108,143,255,0.4)]'
                    }`}
                    style={{ 
                      background: 'var(--glass)', 
                      color: isAdded ? 'var(--text-muted)' : 'var(--text-secondary)',
                      border: '1px solid var(--glass-border)'
                    }}
                    title={`${preset.city || preset.label} — ${formatTime(currentTime, state.settings.timeFormat)}`}
                  >
                    <span className="text-[14px]">{flag}</span>
                    <span>{preset.city || preset.label}</span>
                    <span className="font-mono-time text-[11px]" style={{ color: 'var(--accent)', opacity: isAdded ? 0.5 : 1 }}>
                      {formatTime(currentTime, state.settings.timeFormat)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
