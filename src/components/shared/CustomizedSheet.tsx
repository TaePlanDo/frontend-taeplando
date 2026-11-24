import { useEffect, type ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { SHEET_WIDTH, useSheetOffset } from "@/hooks/useSheetOffset";
import { cn } from "cn";

type CustomizedSheetProps = {
  trigger?: ReactNode;
  title: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  desktopWidth?: number;
  modalOnDesktop?: boolean;
  children: ReactNode;
};

export function CustomizedSheet({
  trigger,
  title,
  open,
  onOpenChange,
  className,
  desktopWidth = SHEET_WIDTH,
  modalOnDesktop = false,
  children,
}: CustomizedSheetProps) {
  const isDesktop = useIsDesktop();
  const { setOffset } = useSheetOffset();

  useEffect(() => {
    setOffset(open && isDesktop && !modalOnDesktop ? desktopWidth : 0);
    return () => setOffset(0);
  }, [open, isDesktop, desktopWidth, modalOnDesktop, setOffset]);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      modal={!isDesktop || modalOnDesktop}
    >
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent
        side="left"
        overlayClassName={modalOnDesktop ? undefined : "lg:hidden"}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        style={{
          width: `min(100%, ${isDesktop ? desktopWidth : SHEET_WIDTH}px)`,
        }}
        className={cn("gap-0 overflow-hidden p-0 sm:max-w-none", className)}
      >
        <SheetHeader className="box-content h-16 shrink-0 justify-center border-b border-foreground/10 px-6 py-0 text-left">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 pt-4 pb-4">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
