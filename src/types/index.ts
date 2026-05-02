// Core types for the World Clock Planner

export interface TimezoneEntry {
  id: string;
  iana: string;
  label: string;
  city?: string;
}

export interface AppSettings {
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
  // Central & South Asia
  { iana: 'Asia/Kabul', label: 'Kabul (AFT)', keywords: ['kabul', 'afghanistan', 'aft'] },
  { iana: 'Asia/Karachi', label: 'Karachi (PKT)', keywords: ['karachi', 'pakistan', 'pkt', 'pk'] },
  { iana: 'Asia/Dushanbe', label: 'Dushanbe (TJT)', keywords: ['dushanbe', 'tajikistan', 'tjt'] },
  { iana: 'Asia/Tashkent', label: 'Tashkent (UZT)', keywords: ['tashkent', 'uzbekistan', 'uzt'] },
  // Russia
  { iana: 'Europe/Kaliningrad', label: 'Kaliningrad (MSK-1)', keywords: ['kaliningrad', 'russia', 'russian'] },
  { iana: 'Europe/Moscow', label: 'Moscow (MSK)', keywords: ['moscow', 'russia', 'msk', 'russian'] },
  { iana: 'Europe/Samara', label: 'Samara (MSK+1)', keywords: ['samara', 'russia', 'russian'] },
  { iana: 'Asia/Yekaterinburg', label: 'Yekaterinburg (MSK+2)', keywords: ['yekaterinburg', 'ekb', 'russia', 'russian'] },
  { iana: 'Asia/Omsk', label: 'Omsk (MSK+3)', keywords: ['omsk', 'russia', 'russian'] },
  { iana: 'Asia/Krasnoyarsk', label: 'Krasnoyarsk (MSK+4)', keywords: ['krasnoyarsk', 'russia', 'russian'] },
  { iana: 'Asia/Novosibirsk', label: 'Novosibirsk (MSK+4)', keywords: ['novosibirsk', 'russia', 'russian'] },
  { iana: 'Asia/Irkutsk', label: 'Irkutsk (MSK+5)', keywords: ['irkutsk', 'russia', 'russian'] },
  { iana: 'Asia/Yakutsk', label: 'Yakutsk (MSK+6)', keywords: ['yakutsk', 'yakutia', 'russia', 'russian'] },
  { iana: 'Asia/Vladivostok', label: 'Vladivostok (MSK+7)', keywords: ['vladivostok', 'russia', 'russian'] },
  { iana: 'Asia/Sakhalin', label: 'Sakhalin (MSK+8)', keywords: ['sakhalin', 'sakhalov', 'russia', 'russian'] },
   { iana: 'Asia/Magadan', label: 'Magadan (MSK+9)', keywords: ['magadan', 'russia', 'russian'] },
   // Turkey & Eastern Europe
   { iana: 'Europe/Istanbul', label: 'Istanbul (TRT)', keywords: ['istanbul', 'turkey', 'trt', 'turkiye'] },
   { iana: 'Europe/Helsinki', label: 'Helsinki (EET)', keywords: ['helsinki', 'finland', 'eet', 'eest'] },
   { iana: 'Europe/Athens', label: 'Athens (EET)', keywords: ['athens', 'greece', 'athens', 'eet', 'eest'] },
   { iana: 'Europe/Brussels', label: 'Brussels (CET)', keywords: ['brussels', 'belgium', 'eu', 'cet', 'cest'] },
   { iana: 'Europe/Sofia', label: 'Sofia (EET)', keywords: ['sofia', 'bulgaria', 'eet', 'eest'] },
   // Middle East
   { iana: 'Asia/Tehran', label: 'Tehran (IRST)', keywords: ['tehran', 'iran', 'persian', 'irst'] },
   { iana: 'Asia/Amman', label: 'Amman (AST)', keywords: ['amman', 'jordan', 'ast'] },
   { iana: 'Asia/Beirut', label: 'Beirut (EET)', keywords: ['beirut', 'lebanon', 'eet', 'eest'] },
   { iana: 'Asia/Baghdad', label: 'Baghdad (AST)', keywords: ['baghdad', 'iraq', 'ast'] },
   { iana: 'Asia/Kuwait', label: 'Kuwait City (AST)', keywords: ['kuwait', 'kuwait city', 'ast'] },
   { iana: 'Asia/Damascus', label: 'Damascus (AST)', keywords: ['damascus', 'syria', 'ast'] },
   // South Asia (half-hour offsets)
   { iana: 'Asia/Colombo', label: 'Colombo (SLST)', keywords: ['colombo', 'sri lanka', 'slst'] },
   { iana: 'Asia/Dhaka', label: 'Dhaka (BST)', keywords: ['dhaka', 'bangladesh', 'bst'] },
   // Southeast Asia
   { iana: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (MYT)', keywords: ['kuala lumpur', 'malaysia', 'myt'] },
   { iana: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh City (ICT)', keywords: ['ho chi minh', 'vietnam', 'ict', 'saigon'] },
   { iana: 'Asia/Phnom_Penh', label: 'Phnom Penh (ICT)', keywords: ['phnom penh', 'cambodia', 'ict'] },
   // Americas
   { iana: 'America/Lima', label: 'Lima (PET)', keywords: ['lima', 'peru', 'pet'] },
   { iana: 'America/Bogota', label: 'Bogota (COT)', keywords: ['bogota', 'colombia', 'cot'] },
   { iana: 'America/Santiago', label: 'Santiago (CLT)', keywords: ['santiago', 'chile', 'clt', 'clst'] },
   { iana: 'America/Caracas', label: 'Caracas (VET)', keywords: ['caracas', 'venezuela', 'vet'] },
   { iana: 'America/Argentina/Cordoba', label: 'Cordoba (ART)', keywords: ['cordoba', 'argentina', 'art'] },
   // US secondary hubs
   { iana: 'America/Indiana/Indianapolis', label: 'Indianapolis (ET)', keywords: ['indianapolis', 'indiana', 'et', 'eastern'] },
   { iana: 'America/Puerto_Rico', label: 'San Juan (AST)', keywords: ['san juan', 'puerto rico', 'ast'] },
];
