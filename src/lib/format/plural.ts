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
