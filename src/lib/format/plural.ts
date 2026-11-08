const pluralRules = new Intl.PluralRules("pl-PL", { type: "cardinal" });

function formatCount(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  const rule = pluralRules.select(count);
  const word = rule === "one" ? one : rule === "few" ? few : many;
  return `${count} ${word}`;
}

export function formatGroupCount(count: number): string {
  return formatCount(count, "grupa", "grupy", "grup");
}

export function formatExerciseCount(count: number): string {
  return formatCount(count, "ćwiczenie", "ćwiczenia", "ćwiczeń");
}

export function formatPlanCount(count: number): string {
  return formatCount(count, "plan", "plany", "planów");
}

export function formatParticipantCount(count: number): string {
  return formatCount(count, "osoba", "osoby", "osób");
}
