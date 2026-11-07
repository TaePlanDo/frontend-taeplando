export function deltaMinutesBadgeClass(deltaMinutes: number): string {
  if (deltaMinutes > 0) {
    return "bg-primary/15 text-primary";
  }
  if (deltaMinutes < 0) {
    return "bg-primary/15 text-destructive";
  }
  return "bg-muted text-muted-foreground";
}
