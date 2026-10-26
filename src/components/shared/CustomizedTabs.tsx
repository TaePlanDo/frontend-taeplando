import type { ReactNode } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabItem<T extends string> = { value: T; label: ReactNode };
type Props<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  tabs: TabItem<T>[];
  className?: string;
};

export function CustomizedTabs<T extends string>({
  value,
  onValueChange,
  tabs,
  className,
}: Props<T>) {
  return (
    <Tabs value={value} onValueChange={(next) => onValueChange(next as T)}>
      <TabsList className={className}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
