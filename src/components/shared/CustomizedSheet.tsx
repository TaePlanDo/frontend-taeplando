import { useEffect, type ReactNode } from "react";

import { SHEET_WIDTH, useSheetOffset } from "@/components/shared/SheetOffset";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { cn } from "cn";

type CustomizedSheetProps = {
  trigger?: ReactNode;
  title: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: ReactNode;
};

export function CustomizedSheet({
  trigger,
  title,
  open,
  onOpenChange,
  className,
  children,
}: CustomizedSheetProps) {
  const isDesktop = useIsDesktop();
  const { setOffset } = useSheetOffset();

  useEffect(() => {
    setOffset(open && isDesktop ? SHEET_WIDTH : 0);
    return () => setOffset(0);
  }, [open, isDesktop, setOffset]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={!isDesktop}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent
        side="left"
        overlayClassName="lg:hidden"
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        style={{ width: `min(100%, ${SHEET_WIDTH}px)` }}
        className={cn("gap-0 overflow-hidden p-0", className)}
      >
        <SheetHeader className="shrink-0 border-b border-border px-6 py-4 text-left">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 pt-4 pb-4">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
