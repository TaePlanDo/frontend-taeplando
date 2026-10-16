const numberFormat = new Intl.NumberFormat("pl-PL");

export function formatDuration(totalMinutes: number): string {
  const total = Math.max(0, Math.floor(totalMinutes));
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  if (hours === 0) {
    return `${numberFormat.format(minutes)} min`;
  }

  if (minutes === 0) {
    return `${numberFormat.format(hours)} h`;
  }

  return `${numberFormat.format(hours)} h ${numberFormat.format(minutes)} min`;
}
