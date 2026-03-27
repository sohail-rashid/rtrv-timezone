import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { exportTimeSummary } from '../utils/timezone';
import { DateTime } from 'luxon';

interface HeaderProps {
  onAddTimezone: () => void;
}

export function Header({ onAddTimezone }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { state } = useApp();
  const { addToast } = useToast();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const handleCopySummary = async () => {
    if (state.timezones.length === 0) {
      addToast('No timezones to export', 'warning');
      return;
    }
    const anchorTime = DateTime.fromISO(state.anchorTime);
    const summary = exportTimeSummary(anchorTime, state.timezones);
    try {
      await navigator.clipboard.writeText(summary);
      addToast('Time summary copied to clipboard', 'success');
    } catch {
      addToast('Failed to copy to clipboard', 'error');
    }
  };

  const getThemeIcon = () => {
    if (theme === 'light') return '☀️';
    if (theme === 'dark') return '🌙';
    return '💻';
  };

  const getThemeLabel = () => {
    if (theme === 'light') return 'Light';
    if (theme === 'dark') return 'Dark';
    return 'Auto';
  };

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ borderColor: 'var(--header-border)', backgroundColor: 'var(--header-bg)' }}>
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[14px] flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, var(--accent), var(--accent2))`, boxShadow: `0 4px 16px var(--accent-glow)` }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5"/>
                <ellipse cx="12" cy="12" rx="3.5" ry="9" stroke="white" strokeWidth="1.5"/>
                <path d="M3 12h18" stroke="white" strokeWidth="1.5"/>
                <path d="M5 7h14M5 17h14" stroke="white" strokeWidth="1" strokeOpacity="0.6"/>
                <circle cx="12" cy="12" r="2" fill="white"/>
                <path d="M12 12V7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 12l4 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Rtrv Timezone</div>
              <div className="text-[11px] font-normal uppercase tracking-[0.5px]" style={{ color: 'var(--text-muted)' }}>World Clock Planner</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={cycleTheme}
              className="glass-btn"
              title={`Theme: ${getThemeLabel()} (click to cycle)`}
            >
              <span>{getThemeIcon()}</span>
              <span className="hidden sm:inline">{getThemeLabel()}</span>
            </button>

            {/* Copy Summary Button */}
            <button
              onClick={handleCopySummary}
              className="glass-btn"
              title="Copy time summary to clipboard"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span className="hidden sm:inline">Copy</span>
            </button>

            {/* Add Timezone Button */}
            <button
              onClick={onAddTimezone}
              className="glass-btn glass-btn-primary"
            >
              <span>＋</span>
              <span className="hidden sm:inline">Add Zone</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
