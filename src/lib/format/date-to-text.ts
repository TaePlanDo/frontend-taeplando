const relativeTime = new Intl.RelativeTimeFormat("pl-PL", {
  numeric: "always",
});

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatRelativeTime(
  date: Date | string,
  now: Date = new Date(),
): string {
  const target = toDate(date);
  const elapsedSeconds = Math.max(
    0,
    Math.floor((now.getTime() - target.getTime()) / 1000),
  );

  if (elapsedSeconds < MINUTE) {
    return "mniej niż minutę temu";
  }

  if (elapsedSeconds < HOUR) {
    return relativeTime.format(-Math.round(elapsedSeconds / MINUTE), "minute");
  }

  if (elapsedSeconds < DAY) {
    return relativeTime.format(-Math.round(elapsedSeconds / HOUR), "hour");
  }

  if (elapsedSeconds < MONTH) {
    return relativeTime.format(-Math.round(elapsedSeconds / DAY), "day");
  }

  if (elapsedSeconds < YEAR) {
    return relativeTime.format(-Math.round(elapsedSeconds / MONTH), "month");
  }

  return relativeTime.format(-Math.round(elapsedSeconds / YEAR), "year");
}

export function formatGroupActivity(
  createdAt: string,
  updatedAt: string,
  now: Date = new Date(),
): string {
  const created = toDate(createdAt);
  const updated = toDate(updatedAt);

  const action =
    created.getTime() === updated.getTime() ? "Utworzono" : "Edytowano";

  return `${action} ${formatRelativeTime(updated, now)}`;
}
