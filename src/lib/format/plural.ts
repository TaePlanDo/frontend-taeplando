const pluralRules = new Intl.PluralRules("pl-PL", { type: "cardinal" });

function groupWord(count: number): string {
  const rule = pluralRules.select(count);

  if (rule === "one") {
    return "grupa";
  }

  if (rule === "few") {
    return "grupy";
  }

  return "grup";
}

export function formatGroupCount(count: number): string {
  return `${count} ${groupWord(count)}`;
}

function exerciseWord(count: number): string {
  const rule = pluralRules.select(count);

  if (rule === "one") {
    return "ćwiczenie";
  }

  if (rule === "few") {
    return "ćwiczenia";
  }

  return "ćwiczeń";
}

export function formatExerciseCount(count: number): string {
  return `${count} ${exerciseWord(count)}`;
}

function equipmentWord(count: number): string {
  const rule = pluralRules.select(count);

  if (rule === "one") {
    return "typ sprzętu";
  }

  if (rule === "few") {
    return "typy sprzętu";
  }

  return "typów sprzętu";
}

export function formatEquipmentCount(count: number): string {
  return `${count} ${equipmentWord(count)}`;
}
