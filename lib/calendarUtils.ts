export type CalendarDay = {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dateString: string; // YYYY-MM-DD
};

export function getMonthDays(year: number, month: number): CalendarDay[] {
  const today = new Date();
  const todayStr = formatDateStr(today);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay(); // 0=Sun

  const days: CalendarDay[] = [];

  // Previous month padding
  const prevMonthLast = new Date(year, month, 0);
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLast.getDate() - i);
    days.push({
      date: d,
      day: d.getDate(),
      isCurrentMonth: false,
      isToday: formatDateStr(d) === todayStr,
      dateString: formatDateStr(d),
    });
  }

  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({
      date: d,
      day: i,
      isCurrentMonth: true,
      isToday: formatDateStr(d) === todayStr,
      dateString: formatDateStr(d),
    });
  }

  // Next month padding (fill to 42 cells = 6 rows)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({
      date: d,
      day: d.getDate(),
      isCurrentMonth: false,
      isToday: formatDateStr(d) === todayStr,
      dateString: formatDateStr(d),
    });
  }

  return days;
}

export function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getMonthLabel(year: number, month: number): string {
  return `${year}年${month + 1}月`;
}

export function getWeekDays(): string[] {
  return ['日', '一', '二', '三', '四', '五', '六'];
}
