// Core types for the World Clock Planner

export interface TimezoneEntry {
  id: string;
  iana: string;
  label: string;
  city?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  hourRange: 12 | 24 | 48;
  resolution: 30 | 60;
  showBusinessHours: boolean;
  primaryZoneId: string;
  timeFormat: '12h' | '24h';
}

export interface AppState {
  timezones: TimezoneEntry[];
  settings: AppSettings;
  anchorTime: string; // ISO string
}

export const DEFAULT_TIMEZONES: TimezoneEntry[] = [
  { id: 'et', iana: 'America/New_York', label: 'Eastern Time', city: 'New York' },
  { id: 'ct', iana: 'America/Chicago', label: 'Central Time', city: 'Chicago' },
  { id: 'mt', iana: 'America/Denver', label: 'Mountain Time', city: 'Denver' },
  { id: 'pt', iana: 'America/Los_Angeles', label: 'Pacific Time', city: 'Los Angeles' },
];

export const PRESET_TIMEZONES: TimezoneEntry[] = [
  { id: 'et', iana: 'America/New_York', label: 'Eastern Time', city: 'New York' },
  { id: 'ct', iana: 'America/Chicago', label: 'Central Time', city: 'Chicago' },
  { id: 'mt', iana: 'America/Denver', label: 'Mountain Time', city: 'Denver' },
  { id: 'pt', iana: 'America/Los_Angeles', label: 'Pacific Time', city: 'Los Angeles' },
  { id: 'utc', iana: 'UTC', label: 'UTC', city: 'UTC' },
  { id: 'london', iana: 'Europe/London', label: 'London', city: 'London' },
  { id: 'india', iana: 'Asia/Kolkata', label: 'India Standard Time', city: 'Mumbai' },
  { id: 'tokyo', iana: 'Asia/Tokyo', label: 'Japan Standard Time', city: 'Tokyo' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  hourRange: 24,
  resolution: 60,
  showBusinessHours: true,
  primaryZoneId: 'et',
  timeFormat: '12h',
};

// Common IANA timezones for search
export const COMMON_TIMEZONES: { iana: string; label: string; keywords: string[] }[] = [
  { iana: 'America/New_York', label: 'New York (ET)', keywords: ['eastern', 'est', 'edt', 'new york', 'nyc', 'et'] },
  { iana: 'America/Chicago', label: 'Chicago (CT)', keywords: ['central', 'cst', 'cdt', 'chicago', 'ct'] },
  { iana: 'America/Denver', label: 'Denver (MT)', keywords: ['mountain', 'mst', 'mdt', 'denver', 'mt'] },
  { iana: 'America/Los_Angeles', label: 'Los Angeles (PT)', keywords: ['pacific', 'pst', 'pdt', 'los angeles', 'la', 'pt'] },
  { iana: 'America/Phoenix', label: 'Phoenix (AZ)', keywords: ['phoenix', 'arizona', 'az'] },
  { iana: 'America/Anchorage', label: 'Anchorage (AK)', keywords: ['alaska', 'anchorage', 'ak'] },
  { iana: 'Pacific/Honolulu', label: 'Honolulu (HI)', keywords: ['hawaii', 'honolulu', 'hi'] },
  { iana: 'America/Toronto', label: 'Toronto', keywords: ['toronto', 'canada', 'ontario'] },
  { iana: 'America/Vancouver', label: 'Vancouver', keywords: ['vancouver', 'bc', 'british columbia'] },
  { iana: 'Europe/London', label: 'London (UK)', keywords: ['london', 'uk', 'gmt', 'bst', 'britain'] },
  { iana: 'Europe/Paris', label: 'Paris', keywords: ['paris', 'france', 'cet', 'cest'] },
  { iana: 'Europe/Berlin', label: 'Berlin', keywords: ['berlin', 'germany', 'cet', 'cest'] },
  { iana: 'Europe/Amsterdam', label: 'Amsterdam', keywords: ['amsterdam', 'netherlands', 'holland'] },
  { iana: 'Europe/Madrid', label: 'Madrid', keywords: ['madrid', 'spain'] },
  { iana: 'Europe/Rome', label: 'Rome', keywords: ['rome', 'italy'] },
  { iana: 'Europe/Moscow', label: 'Moscow', keywords: ['moscow', 'russia', 'msk'] },
  { iana: 'Asia/Dubai', label: 'Dubai (UAE)', keywords: ['dubai', 'uae', 'emirates'] },
  { iana: 'Asia/Kolkata', label: 'Mumbai (IST)', keywords: ['india', 'mumbai', 'ist', 'delhi', 'bangalore', 'kolkata'] },
  { iana: 'Asia/Singapore', label: 'Singapore', keywords: ['singapore', 'sg'] },
  { iana: 'Asia/Hong_Kong', label: 'Hong Kong', keywords: ['hong kong', 'hk'] },
  { iana: 'Asia/Shanghai', label: 'Shanghai (China)', keywords: ['china', 'shanghai', 'beijing', 'cst'] },
  { iana: 'Asia/Tokyo', label: 'Tokyo (Japan)', keywords: ['japan', 'tokyo', 'jst'] },
  { iana: 'Asia/Seoul', label: 'Seoul (Korea)', keywords: ['korea', 'seoul', 'kst'] },
  { iana: 'Australia/Sydney', label: 'Sydney', keywords: ['sydney', 'australia', 'aest', 'aedt'] },
  { iana: 'Australia/Melbourne', label: 'Melbourne', keywords: ['melbourne', 'australia'] },
  { iana: 'Australia/Perth', label: 'Perth', keywords: ['perth', 'australia', 'awst'] },
  { iana: 'Pacific/Auckland', label: 'Auckland (NZ)', keywords: ['auckland', 'new zealand', 'nz', 'nzst', 'nzdt'] },
  { iana: 'UTC', label: 'UTC', keywords: ['utc', 'coordinated', 'universal'] },
  { iana: 'America/Sao_Paulo', label: 'São Paulo', keywords: ['sao paulo', 'brazil', 'brasil'] },
  { iana: 'America/Mexico_City', label: 'Mexico City', keywords: ['mexico', 'cdmx'] },
  { iana: 'Africa/Johannesburg', label: 'Johannesburg', keywords: ['johannesburg', 'south africa', 'sast'] },
  { iana: 'Africa/Cairo', label: 'Cairo', keywords: ['cairo', 'egypt'] },
  { iana: 'Asia/Bangkok', label: 'Bangkok', keywords: ['bangkok', 'thailand'] },
  { iana: 'Asia/Jakarta', label: 'Jakarta', keywords: ['jakarta', 'indonesia'] },
];
