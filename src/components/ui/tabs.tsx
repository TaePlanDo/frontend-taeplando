import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "cn";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-input/30 p-1",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-md px-3 py-1.5 text-sm text-foreground/60 transition-colors data-[state=active]:border data-[state=active]:border-primary data-[state=active]:bg-primary/15 data-[state=active]:text-primary",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger };
