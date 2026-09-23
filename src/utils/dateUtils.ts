import { DayOfWeek, DAYS_OF_WEEK } from '../types';

export interface DayInfo {
  dayOfWeek: DayOfWeek;
  dateStr: string; // YYYY-MM-DD
  displayDate: string; // "Sep 22"
  fullDisplay: string; // "Monday, Sep 22"
  isToday: boolean;
}

export function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

export function formatTimeRange(start24: string, end24: string): string {
  return `${formatTime12h(start24)} – ${formatTime12h(end24)}`;
}

export function toDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMondayOfCurrentWeek(referenceDate: Date = new Date()): Date {
  const d = new Date(referenceDate);
  const day = d.getDay();
  // day: 0 is Sunday, 1 is Monday ... 6 is Saturday
  // Diff to Monday:
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDays(mondayDate: Date): DayInfo[] {
  const todayStr = toDateStr(new Date());

  return DAYS_OF_WEEK.map((dayOfWeek, idx) => {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + idx);
    const dateStr = toDateStr(d);
    const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const fullDisplay = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return {
      dayOfWeek,
      dateStr,
      displayDate,
      fullDisplay,
      isToday: dateStr === todayStr,
    };
  });
}
