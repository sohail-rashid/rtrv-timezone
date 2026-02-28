import { DateTime } from 'luxon';
import {
  getCurrentTimeInZone,
  convertToZone,
  getOffsetString,
  getTimezoneAbbreviation,
  isDST,
  formatTime,
  formatDate,
  generateTimeSlots,
  searchTimezones,
  generateTimezoneId,
  isValidTimezone,
  exportTimeSummary,
} from '../utils/timezone';
import { COMMON_TIMEZONES } from '../types';

/**
 * Simple test harness for timezone utilities
 * Run with: npx tsx src/tests/timezone.test.ts
 */

let failCount = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failCount++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`\n🧪 ${name}`);
  } catch (error) {
    console.error(`\n❌ ${name} threw an error:`, error);
    failCount++;
  }
}

// Test getCurrentTimeInZone
test('getCurrentTimeInZone returns correct timezone', () => {
  const nyTime = getCurrentTimeInZone('America/New_York');
  assert(nyTime.zoneName === 'America/New_York', 'Zone should be America/New_York');
  assert(nyTime.isValid, 'DateTime should be valid');
});

// Test convertToZone
test('convertToZone converts correctly', () => {
  const utcTime = DateTime.utc(2026, 2, 28, 12, 0, 0);
  const nyTime = convertToZone(utcTime, 'America/New_York');
  // In February, NY is EST (UTC-5)
  assert(nyTime.hour === 7, `Expected hour 7 (UTC-5), got ${nyTime.hour}`);
});

// Test getOffsetString
test('getOffsetString formats correctly', () => {
  // Create a specific time in winter (EST, not DST)
  const winterTime = DateTime.fromObject({ year: 2026, month: 1, day: 15 }, { zone: 'America/New_York' });
  const offset = getOffsetString('America/New_York', winterTime);
  assert(offset === 'GMT-5', `Expected GMT-5 for EST, got ${offset}`);

  // Test with UTC
  const utcOffset = getOffsetString('UTC');
  assert(utcOffset === 'GMT+0', `Expected GMT+0 for UTC, got ${utcOffset}`);
});

// Test getTimezoneAbbreviation
test('getTimezoneAbbreviation returns abbreviation', () => {
  const winterTime = DateTime.fromObject({ year: 2026, month: 1, day: 15 }, { zone: 'America/New_York' });
  const abbr = getTimezoneAbbreviation('America/New_York', winterTime);
  assert(abbr === 'EST', `Expected EST, got ${abbr}`);
});

// Test isDST
test('isDST detects daylight saving time correctly', () => {
  // Winter - no DST
  const winterTime = DateTime.fromObject({ year: 2026, month: 1, day: 15 }, { zone: 'America/New_York' });
  assert(!isDST('America/New_York', winterTime), 'January should not be DST');

  // Summer - DST
  const summerTime = DateTime.fromObject({ year: 2026, month: 7, day: 15 }, { zone: 'America/New_York' });
  assert(isDST('America/New_York', summerTime), 'July should be DST');

  // UTC never has DST
  assert(!isDST('UTC'), 'UTC should never have DST');
});

// Test formatTime
test('formatTime formats correctly in 12h and 24h', () => {
  const time = DateTime.fromObject({ hour: 14, minute: 30 });
  assert(formatTime(time, '12h') === '2:30 PM', `Expected 2:30 PM, got ${formatTime(time, '12h')}`);
  assert(formatTime(time, '24h') === '14:30', `Expected 14:30, got ${formatTime(time, '24h')}`);
});

// Test formatDate
test('formatDate formats correctly', () => {
  const date = DateTime.fromObject({ year: 2026, month: 2, day: 28 });
  const short = formatDate(date, 'short');
  assert(short.includes('Feb') && short.includes('28'), `Short date should contain Feb and 28, got ${short}`);
});

// Test generateTimeSlots
test('generateTimeSlots generates correct number of slots', () => {
  const anchor = DateTime.fromObject({ year: 2026, month: 2, day: 28, hour: 12 });
  
  // 24 hours with 60-minute resolution = 24 slots
  const slots60 = generateTimeSlots(anchor, 'UTC', 'UTC', 24, 60);
  assert(slots60.length === 24, `Expected 24 slots for 24h/60min, got ${slots60.length}`);

  // 24 hours with 30-minute resolution = 48 slots
  const slots30 = generateTimeSlots(anchor, 'UTC', 'UTC', 24, 30);
  assert(slots30.length === 48, `Expected 48 slots for 24h/30min, got ${slots30.length}`);

  // 12 hours with 60-minute resolution = 12 slots
  const slots12 = generateTimeSlots(anchor, 'UTC', 'UTC', 12, 60);
  assert(slots12.length === 12, `Expected 12 slots for 12h/60min, got ${slots12.length}`);
});

// Test cross-midnight behavior
test('generateTimeSlots handles cross-midnight correctly', () => {
  const anchor = DateTime.fromObject({ year: 2026, month: 2, day: 28, hour: 23 }, { zone: 'UTC' });
  const slots = generateTimeSlots(anchor, 'UTC', 'UTC', 12, 60);
  
  // Should have slots crossing midnight
  const hasBeforeMidnight = slots.some(s => s.time.day === 28);
  const hasAfterMidnight = slots.some(s => s.time.day === 1); // March 1
  
  assert(hasBeforeMidnight, 'Should have slots before midnight');
  assert(hasAfterMidnight, 'Should have slots after midnight');
});

// Test timezone conversion in slots
test('generateTimeSlots converts timezones correctly', () => {
  const anchor = DateTime.fromObject({ year: 2026, month: 2, day: 28, hour: 12 }, { zone: 'UTC' });
  const utcSlots = generateTimeSlots(anchor, 'UTC', 'UTC', 24, 60);
  const nySlots = generateTimeSlots(anchor, 'UTC', 'America/New_York', 24, 60);
  
  // UTC slot and NY slot should differ by 5 hours (EST)
  assert(utcSlots[0].time.zoneName === 'UTC', 'UTC slots should have UTC zoneName');
  assert(nySlots[0].time.zoneName === 'America/New_York', 'NY slots should have America/New_York zoneName');
  
  // Verify the hour difference (NY is UTC-5 in February)
  const diff = utcSlots[0].time.diff(nySlots[0].time.setZone('UTC'), 'hours').hours;
  assert(Math.abs(diff) < 0.01, 'Time conversion should be accurate');
});

// Test searchTimezones
test('searchTimezones finds timezones correctly', () => {
  const results1 = searchTimezones('tokyo', COMMON_TIMEZONES);
  assert(results1.length > 0, 'Should find Tokyo');
  assert(results1[0].iana === 'Asia/Tokyo', 'First result should be Asia/Tokyo');

  const results2 = searchTimezones('est', COMMON_TIMEZONES);
  assert(results2.some(r => r.iana === 'America/New_York'), 'EST should match New York');

  const results3 = searchTimezones('xyz123', COMMON_TIMEZONES);
  assert(results3.length === 0, 'Should not find non-existent timezone');
});

// Test generateTimezoneId
test('generateTimezoneId generates unique IDs', () => {
  const id1 = generateTimezoneId('America/New_York');
  const id2 = generateTimezoneId('America/New_York');
  
  assert(id1.includes('america-new_york'), 'ID should include formatted IANA name');
  assert(id1 !== id2, 'IDs should be unique due to timestamp');
});

// Test isValidTimezone
test('isValidTimezone validates correctly', () => {
  assert(isValidTimezone('America/New_York'), 'America/New_York should be valid');
  assert(isValidTimezone('UTC'), 'UTC should be valid');
  assert(!isValidTimezone('Invalid/Timezone'), 'Invalid/Timezone should not be valid');
  assert(!isValidTimezone(''), 'Empty string should not be valid');
});

// Test exportTimeSummary
test('exportTimeSummary generates readable summary', () => {
  const anchor = DateTime.fromObject({ year: 2026, month: 2, day: 28, hour: 12 }, { zone: 'UTC' });
  const timezones = [
    { iana: 'UTC', label: 'UTC' },
    { iana: 'America/New_York', label: 'New York' },
  ];
  
  const summary = exportTimeSummary(anchor, timezones);
  
  assert(summary.includes('World Clock Planner'), 'Should include app name');
  assert(summary.includes('UTC'), 'Should include UTC');
  assert(summary.includes('New York'), 'Should include New York');
  assert(summary.includes('February'), 'Should include date');
});

// DST transition test
test('Handles DST transition dates correctly', () => {
  // 2026 DST in US starts March 8 at 2:00 AM
  const beforeDST = DateTime.fromObject({ year: 2026, month: 3, day: 8, hour: 1, minute: 30 }, { zone: 'America/New_York' });
  const afterDST = DateTime.fromObject({ year: 2026, month: 3, day: 8, hour: 3, minute: 30 }, { zone: 'America/New_York' });
  
  assert(!isDST('America/New_York', beforeDST), 'Before DST transition should not be DST');
  assert(isDST('America/New_York', afterDST), 'After DST transition should be DST');
  
  // Offset should change
  const offsetBefore = getOffsetString('America/New_York', beforeDST);
  const offsetAfter = getOffsetString('America/New_York', afterDST);
  
  assert(offsetBefore === 'GMT-5', `Before DST should be GMT-5, got ${offsetBefore}`);
  assert(offsetAfter === 'GMT-4', `After DST should be GMT-4, got ${offsetAfter}`);
});

// Business hours detection
test('generateTimeSlots correctly identifies business and night hours', () => {
  const anchor = DateTime.fromObject({ year: 2026, month: 2, day: 28, hour: 12 }, { zone: 'UTC' });
  const slots = generateTimeSlots(anchor, 'UTC', 'UTC', 24, 60);
  
  // Find a 10 AM slot (business hours)
  const businessSlot = slots.find(s => s.time.hour === 10);
  assert(businessSlot?.isBusinessHour === true, '10 AM should be business hours');
  assert(businessSlot?.isNightHour === false, '10 AM should not be night hours');
  
  // Find a 3 AM slot (night hours)
  const nightSlot = slots.find(s => s.time.hour === 3);
  assert(nightSlot?.isNightHour === true, '3 AM should be night hours');
  assert(nightSlot?.isBusinessHour === false, '3 AM should not be business hours');
});

if (failCount === 0) {
  console.log('\n✅ All tests passed!');
} else {
  console.log(`\n❌ ${failCount} test(s) failed!`);
}
