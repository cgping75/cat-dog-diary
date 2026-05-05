export function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const VACCINE_INTERVAL_DAYS = 365;
export const DEWORM_INTERVAL_DAYS = 90;
export const CHECKUP_INTERVAL_DAYS = 365;
export const DENTAL_INTERVAL_DAYS = 180;
export const BATH_INTERVAL_DAYS = 14;
export const GROOMING_INTERVAL_DAYS = 60;
export const NAIL_INTERVAL_DAYS = 30;
