import { createContext, useContext, useReducer, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { DateTime } from 'luxon';
import type { AppState, TimezoneEntry, AppSettings } from '../types';
import { loadState, saveState } from '../utils/storage';

type Action =
  | { type: 'ADD_TIMEZONE'; payload: TimezoneEntry }
  | { type: 'REMOVE_TIMEZONE'; payload: string }
  | { type: 'REORDER_TIMEZONES'; payload: TimezoneEntry[] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_ANCHOR_TIME'; payload: string }
  | { type: 'RESET_TO_NOW' }
  | { type: 'LOAD_STATE'; payload: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TIMEZONE':
      return {
        ...state,
        timezones: [...state.timezones, action.payload],
      };

    case 'REMOVE_TIMEZONE':
      return {
        ...state,
        timezones: state.timezones.filter((tz) => tz.id !== action.payload),
      };

    case 'REORDER_TIMEZONES':
      return {
        ...state,
        timezones: action.payload,
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'SET_ANCHOR_TIME': {
      const dt = DateTime.fromISO(action.payload);
      const res = state.settings.resolution;
      const snapped = dt.set({ minute: Math.floor(dt.minute / res) * res, second: 0, millisecond: 0 });
      return {
        ...state,
        anchorTime: snapped.toISO()!,
      };
    }

    case 'RESET_TO_NOW': {
      const now = DateTime.now();
      return {
        ...state,
        anchorTime: now.set({ second: 0, millisecond: 0 }).toISO()!,
      };
    }

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  addTimezone: (tz: TimezoneEntry) => void;
  removeTimezone: (id: string) => void;
  reorderTimezones: (timezones: TimezoneEntry[]) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setAnchorTime: (time: DateTime) => void;
  resetToNow: () => void;
  getPrimaryZone: () => TimezoneEntry;
}

const AppContext = createContext<AppContextType | null>(null);

function snapToResolution(dt: DateTime, resolution: number): DateTime {
  return dt.set({ minute: Math.floor(dt.minute / resolution) * resolution, second: 0, millisecond: 0 });
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, loadState());
  const isUserAnchorRef = useRef(false);

  // Persist state changes (except anchorTime)
  useEffect(() => {
    saveState({ timezones: state.timezones, settings: state.settings });
  }, [state.timezones, state.settings]);

  // Auto-set primary zone: if only one exists or current primary was removed
  useEffect(() => {
    if (state.timezones.length === 0) return;
    const primaryExists = state.timezones.some((tz) => tz.id === state.settings.primaryZoneId);
    if (!primaryExists || state.timezones.length === 1) {
      dispatch({ type: 'UPDATE_SETTINGS', payload: { primaryZoneId: state.timezones[0].id } });
    }
  }, [state.timezones, state.settings.primaryZoneId]);

  // Only auto-tick anchor time when the user hasn't manually adjusted it
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isUserAnchorRef.current) {
        dispatch({ type: 'SET_ANCHOR_TIME', payload: DateTime.now().toISO()! });
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const addTimezone = useCallback((tz: TimezoneEntry) => {
    dispatch({ type: 'ADD_TIMEZONE', payload: tz });
  }, []);

  const removeTimezone = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TIMEZONE', payload: id });
  }, []);

  const reorderTimezones = useCallback((timezones: TimezoneEntry[]) => {
    dispatch({ type: 'REORDER_TIMEZONES', payload: timezones });
  }, []);

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const setAnchorTime = useCallback((time: DateTime) => {
    isUserAnchorRef.current = true;
    const snapped = snapToResolution(time, state.settings.resolution);
    dispatch({ type: 'SET_ANCHOR_TIME', payload: snapped.toISO()! });
  }, [state.settings.resolution]);

  const resetToNow = useCallback(() => {
    isUserAnchorRef.current = false;
    dispatch({ type: 'RESET_TO_NOW' });
  }, []);

  const getPrimaryZone = useCallback((): TimezoneEntry => {
    const primary = state.timezones.find((tz) => tz.id === state.settings.primaryZoneId);
    return primary ?? state.timezones[0] ?? { id: 'utc', iana: 'UTC', label: 'UTC' };
  }, [state.timezones, state.settings.primaryZoneId]);

  return (
    <AppContext.Provider
      value={{
        state,
        addTimezone,
        removeTimezone,
        reorderTimezones,
        updateSettings,
        setAnchorTime,
        resetToNow,
        getPrimaryZone,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
