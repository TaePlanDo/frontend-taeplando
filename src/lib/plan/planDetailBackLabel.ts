export function planDetailBackLabel(backTo: string): string {
  const path = backTo.split("?")[0] ?? backTo;
  if (path === "/plans/new") {
    return "Wróć do generowania";
  }
  return "Wróć do listy";
}
