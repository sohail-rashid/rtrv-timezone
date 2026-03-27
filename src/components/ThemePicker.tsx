import { useTheme } from '../context/ThemeContext';
import { COLOR_THEMES } from '../utils/themes';

interface ThemePickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemePicker({ isOpen, onClose }: ThemePickerProps) {
  const { colorTheme, setColorTheme, resolvedTheme } = useTheme();

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
          className="relative w-full max-w-sm rounded-2xl shadow-2xl modal-content-enter"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(20px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Color Theme</h2>
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

          {/* Theme List */}
          <div className="p-3 space-y-1">
            {COLOR_THEMES.map((theme) => {
              const isActive = theme.id === colorTheme;
              const dotColor = resolvedTheme === 'dark' ? theme.preview.dark : theme.preview.light;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    setColorTheme(theme.id);
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all"
                  style={{
                    background: isActive ? 'var(--accent-glow)' : 'transparent',
                    color: 'var(--text)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--glass)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {/* Color preview */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{
                        background: theme.light.accent,
                        border: isActive ? `2px solid ${dotColor}` : '2px solid transparent',
                        boxShadow: isActive ? `0 0 12px ${dotColor}40` : 'none',
                      }}
                    />
                    <div
                      className="w-6 h-6 rounded-full -ml-2"
                      style={{
                        background: theme.dark.accent,
                        border: isActive ? `2px solid ${dotColor}` : '2px solid transparent',
                        boxShadow: isActive ? `0 0 12px ${dotColor}40` : 'none',
                      }}
                    />
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium">{theme.emoji} {theme.name}</div>
                    <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {theme.light.accent} / {theme.dark.accent}
                    </div>
                  </div>

                  {/* Checkmark */}
                  {isActive && (
                    <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
