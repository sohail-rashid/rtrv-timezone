import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onAddTimezone: () => void;
}

export function Header({ onAddTimezone }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
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
            <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#6c8fff] to-[#ff6fd8] flex items-center justify-center shadow-lg shadow-[rgba(108,143,255,0.35)]">
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
