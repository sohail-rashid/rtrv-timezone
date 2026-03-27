import { DateTime } from 'luxon';
import { COMMON_TIMEZONES } from '../types';

/**
 * Detect the user's local IANA timezone and return a TimezoneEntry-like object
 */
export function detectUserTimezone(): { id: string; iana: string; label: string; city?: string } {
  try {
    const iana = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!iana) throw new Error('No timezone detected');

    // Try to find a nice label from our known list
    const known = COMMON_TIMEZONES.find((tz) => tz.iana === iana);
    if (known) {
      const city = known.label.replace(/\s*\(.*\)/, ''); // strip parenthetical
      return { id: `local-${iana.toLowerCase().replace(/\//g, '-')}`, iana, label: `${known.label} (You)`, city };
    }

    // Fallback: derive a label from the IANA string
    const city = iana.split('/').pop()?.replace(/_/g, ' ') || iana;
    return { id: `local-${iana.toLowerCase().replace(/\//g, '-')}`, iana, label: `${city} (You)`, city };
  } catch {
    // Fallback to ET
    return { id: 'et', iana: 'America/New_York', label: 'Eastern Time', city: 'New York' };
  }
}

/**
 * Get the current time in a specific timezone
 */
export function getCurrentTimeInZone(iana: string): DateTime {
  return DateTime.now().setZone(iana);
}

/**
 * Convert a DateTime to another timezone
 */
export function convertToZone(dt: DateTime, iana: string): DateTime {
  return dt.setZone(iana);
}

/**
 * Get the UTC offset string for a timezone at a given time (e.g., "GMT-5")
 */
export function getOffsetString(iana: string, dt?: DateTime): string {
  const time = dt ? dt.setZone(iana) : DateTime.now().setZone(iana);
  const offset = time.offset;
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset >= 0 ? '+' : '-';
  if (minutes === 0) {
    return `GMT${sign}${hours}`;
  }
  return `GMT${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Get the offset of a timezone relative to another timezone (e.g., "+5:30h", "−3h", "same time")
 */
export function getRelativeOffset(targetIana: string, primaryIana: string, dt?: DateTime): string {
  const now = dt || DateTime.now();
  const targetOffset = now.setZone(targetIana).offset;
  const primaryOffset = now.setZone(primaryIana).offset;
  const diff = targetOffset - primaryOffset;

  if (diff === 0) return 'same time';

  const sign = diff > 0 ? '+' : '−';
  const absDiff = Math.abs(diff);
  const hours = Math.floor(absDiff / 60);
  const minutes = absDiff % 60;

  if (minutes === 0) {
    return `${sign}${hours}h`;
  }
  return `${sign}${hours}:${minutes.toString().padStart(2, '0')}h`;
}

/**
 * Get the timezone abbreviation (e.g., "EST", "EDT", "PST", "PDT")
 */
export function getTimezoneAbbreviation(iana: string, dt?: DateTime): string {
  const time = dt ? dt.setZone(iana) : DateTime.now().setZone(iana);
  return time.toFormat('ZZZZ') || time.toFormat('ZZ');
}

/**
 * Check if a timezone is currently observing DST
 */
export function isDST(iana: string, dt?: DateTime): boolean {
  const time = dt ? dt.setZone(iana) : DateTime.now().setZone(iana);
  return time.isInDST;
}

/**
 * Get the formatted current time for display
 */
export function formatTime(dt: DateTime, format: '12h' | '24h' = '12h'): string {
  return format === '12h' ? dt.toFormat('h:mm a') : dt.toFormat('HH:mm');
}

/**
 * Get the formatted date for display
 */
export function formatDate(dt: DateTime, format: 'short' | 'long' = 'short'): string {
  return format === 'short' ? dt.toFormat('EEE, MMM d') : dt.toFormat('EEEE, MMMM d, yyyy');
}

/**
 * Generate an array of hour slots for the time grid
 */
export function generateTimeSlots(
  anchorTime: DateTime,
  primaryZone: string,
  targetZone: string,
  hourRange: 12 | 24 | 48,
  resolution: 30 | 60
): { time: DateTime; isToday: boolean; isTomorrow: boolean; isYesterday: boolean; isBusinessHour: boolean; isNightHour: boolean }[] {
  const slots: ReturnType<typeof generateTimeSlots> = [];
  const startTime = anchorTime.setZone(primaryZone).startOf('hour').minus({ hours: Math.floor(hourRange / 2) });
  const slotCount = (hourRange * 60) / resolution;

  for (let i = 0; i < slotCount; i++) {
    const slotTime = startTime.plus({ minutes: i * resolution }).setZone(targetZone);
    const today = DateTime.now().setZone(targetZone).startOf('day');
    const slotDay = slotTime.startOf('day');

    const hour = slotTime.hour;
    const isBusinessHour = hour >= 9 && hour < 17;
    const isNightHour = hour < 7 || hour >= 22;

    slots.push({
      time: slotTime,
      isToday: slotDay.equals(today),
      isTomorrow: slotDay.equals(today.plus({ days: 1 })),
      isYesterday: slotDay.equals(today.minus({ days: 1 })),
      isBusinessHour,
      isNightHour,
    });
  }

  return slots;
}

/**
 * Get a full datetime tooltip string
 */
export function getTooltipText(dt: DateTime, zoneName: string): string {
  const abbr = getTimezoneAbbreviation(dt.zoneName || 'UTC', dt);
  return `${dt.toFormat('EEE, MMM d, yyyy h:mm a')} ${abbr} (${zoneName})`;
}

/**
 * Search timezones by query
 */
export function searchTimezones(
  query: string,
  timezones: { iana: string; label: string; keywords: string[] }[]
): { iana: string; label: string; keywords: string[] }[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  return timezones.filter((tz) => {
    if (tz.iana.toLowerCase().includes(lowerQuery)) return true;
    if (tz.label.toLowerCase().includes(lowerQuery)) return true;
    return tz.keywords.some((kw) => kw.includes(lowerQuery));
  }).slice(0, 10);
}

/**
 * Generate a unique ID for a new timezone entry
 */
export function generateTimezoneId(iana: string): string {
  const random = Math.random().toString(36).substring(2, 8);
  return `${iana.toLowerCase().replace(/\//g, '-')}-${Date.now()}-${random}`;
}

/**
 * Validate if a string is a valid IANA timezone
 */
export function isValidTimezone(iana: string): boolean {
  try {
    const dt = DateTime.now().setZone(iana);
    return dt.isValid;
  } catch {
    return false;
  }
}

/**
 * Get all available IANA timezones (using Luxon's Info)
 */
export function getAllTimezones(): string[] {
  // Luxon doesn't expose all zones directly, so we use a curated list
  // This could be expanded by using the Intl API
  try {
    // Modern browsers support supportedValuesOf
    if ('supportedValuesOf' in Intl) {
      return (Intl as { supportedValuesOf: (key: string) => string[] }).supportedValuesOf('timeZone');
    }
    return [];
  } catch {
    // Fallback to empty array if the API isn't available
    return [];
  }
}

/**
 * Export a summary of times across all zones
 */
export function exportTimeSummary(
  anchorTime: DateTime,
  timezones: { iana: string; label: string }[]
): string {
  const lines = ['🌍 World Clock Planner - Time Comparison', ''];
  
  const anchorFormatted = anchorTime.toFormat('EEEE, MMMM d, yyyy');
  lines.push(`Reference Date: ${anchorFormatted}`);
  lines.push('');
  lines.push('Time across zones:');
  lines.push('─'.repeat(40));
  
  for (const tz of timezones) {
    const time = anchorTime.setZone(tz.iana);
    const abbr = getTimezoneAbbreviation(tz.iana, time);
    const offset = getOffsetString(tz.iana, time);
    const formattedTime = time.toFormat('h:mm a');
    const formattedDate = time.toFormat('EEE, MMM d');
    const dst = isDST(tz.iana, time) ? ' (DST)' : '';
    
    lines.push(`${tz.label}: ${formattedTime} ${abbr} (${offset})${dst}`);
    lines.push(`  ${formattedDate}`);
  }
  
  lines.push('');
  lines.push('Generated by World Clock Planner');
  
  return lines.join('\n');
}

/**
 * Get country flag emoji from IANA timezone
 */
export function getCountryFlag(iana: string): string {
  const flagMap: Record<string, string> = {
    // Americas
    'America/New_York': '🇺🇸',
    'America/Los_Angeles': '🇺🇸',
    'America/Chicago': '🇺🇸',
    'America/Denver': '🇺🇸',
    'America/Phoenix': '🇺🇸',
    'America/Anchorage': '🇺🇸',
    'Pacific/Honolulu': '🇺🇸',
    'America/Toronto': '🇨🇦',
    'America/Vancouver': '🇨🇦',
    'America/Montreal': '🇨🇦',
    'America/Mexico_City': '🇲🇽',
    'America/Sao_Paulo': '🇧🇷',
    'America/Argentina/Buenos_Aires': '🇦🇷',
    // Europe
    'Europe/London': '🇬🇧',
    'Europe/Paris': '🇫🇷',
    'Europe/Berlin': '🇩🇪',
    'Europe/Amsterdam': '🇳🇱',
    'Europe/Madrid': '🇪🇸',
    'Europe/Rome': '🇮🇹',
    'Europe/Moscow': '🇷🇺',
    'Europe/Dublin': '🇮🇪',
    'Europe/Zurich': '🇨🇭',
    'Europe/Stockholm': '🇸🇪',
    'Europe/Warsaw': '🇵🇱',
    // Asia
    'Asia/Tokyo': '🇯🇵',
    'Asia/Seoul': '🇰🇷',
    'Asia/Shanghai': '🇨🇳',
    'Asia/Hong_Kong': '🇭🇰',
    'Asia/Singapore': '🇸🇬',
    'Asia/Kolkata': '🇮🇳',
    'Asia/Dubai': '🇦🇪',
    'Asia/Bangkok': '🇹🇭',
    'Asia/Jakarta': '🇮🇩',
    'Asia/Manila': '🇵🇭',
    'Asia/Taipei': '🇹🇼',
    // Oceania
    'Australia/Sydney': '🇦🇺',
    'Australia/Melbourne': '🇦🇺',
    'Australia/Perth': '🇦🇺',
    'Pacific/Auckland': '🇳🇿',
    // Africa
    'Africa/Johannesburg': '🇿🇦',
    'Africa/Cairo': '🇪🇬',
    'Africa/Lagos': '🇳🇬',
    // Others
    'UTC': '🌐',
  };
  
  return flagMap[iana] || '🌍';
}
