import { Badge } from "@/components/ui/badge";
import { cn } from "cn";
import { formatSignedMinutes } from "@/lib/format/time";

import { deltaMinutesBadgeClass } from "./planDeltaTone";

type DeltaMinutesBadgeProps = {
  deltaMinutes: number;
  className?: string;
};

export function DeltaMinutesBadge({
  deltaMinutes,
  className,
}: DeltaMinutesBadgeProps) {
  if (deltaMinutes === 0) {
    return null;
  }

  return (
    <Badge
      variant="ghost"
      className={cn(
        "shrink-0 font-medium",
        deltaMinutesBadgeClass(deltaMinutes),
        className,
      )}
    >
      {formatSignedMinutes(deltaMinutes)}
    </Badge>
  );
}
