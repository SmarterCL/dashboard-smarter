/** Genera los días del mes y metadatos de layout para el grid de calendario */
export function generateDaysOfMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return {
    days,
    firstDayOfWeek: firstDay.getDay(), // 0 = Sunday, 1 = Monday, etc.
    daysInMonth,
  }
}
