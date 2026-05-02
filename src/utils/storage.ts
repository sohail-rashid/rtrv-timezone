import type { AppState } from '../types';
import { DEFAULT_TIMEZONES, DEFAULT_SETTINGS } from '../types';
import { DateTime } from 'luxon';
import { detectUserTimezone } from './timezone';

const STORAGE_KEY = 'world-clock-planner-state';

export function getDefaultState(): AppState {
  const localTz = detectUserTimezone();

  // Build default list: user's local zone first, then the standard defaults (deduped)
  const defaults = [localTz, ...DEFAULT_TIMEZONES.filter((tz) => tz.iana !== localTz.iana)];

  return {
    timezones: defaults,
    settings: {
      ...DEFAULT_SETTINGS,
      primaryZoneId: localTz.id, // user's detected zone is primary
    },
    anchorTime: DateTime.now().toISO()!,
  };
}

export function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AppState>;
      return {
        timezones: parsed.timezones ?? DEFAULT_TIMEZONES,
        settings: {
          ...DEFAULT_SETTINGS,
          ...parsed.settings,
        },
        anchorTime: DateTime.now().toISO()!, // Always start with current time
      };
    }
  } catch (e) {
    console.warn('Failed to load state from localStorage:', e);
  }
  return getDefaultState();
}

export function saveState(state: Partial<AppState>): void {
  try {
    const current = loadState();
    const newState = {
      ...current,
      ...state,
      // Don't persist anchorTime
      anchorTime: undefined,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  } catch (e) {
    console.warn('Failed to save state to localStorage:', e);
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear state from localStorage:', e);
  }
}
