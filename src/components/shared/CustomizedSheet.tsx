import { useEffect, type ReactNode } from "react";

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

  useEffect(() => {
    if (!open || !isDesktop) {
      document.documentElement.style.removeProperty("--filter-sheet-offset");
      return;
    }
    document.documentElement.style.setProperty(
      "--filter-sheet-offset",
      "420px",
    );
    return () => {
      document.documentElement.style.removeProperty("--filter-sheet-offset");
    };
  }, [open, isDesktop]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={!isDesktop}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent
        side="left"
        overlayClassName="lg:hidden"
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        className={cn(
          "w-[min(100%,420px)] gap-0 overflow-hidden p-0 sm:max-w-[420px]",
          className,
        )}
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
