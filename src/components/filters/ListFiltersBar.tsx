import { useEffect, useRef, useState, type ReactNode } from "react";

import { SelectedAttributeBadges } from "@/components/shared/SelectedAttributeBadges";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants/search";

type ListFiltersBarProps = {
  name?: string;
  onNameChange: (name: string) => void;
  placeholder: string;
  totalLabel: string;
  chips: { id: string; name: string }[];
  onClearDimension: (dimension: string) => void;
  children: ReactNode;
};

export function ListFiltersBar({
  name,
  onNameChange,
  placeholder,
  totalLabel,
  chips,
  onClearDimension,
  children,
}: ListFiltersBarProps) {
  const [searchValue, setSearchValue] = useState(name ?? "");
  const onNameChangeRef = useRef(onNameChange);
  onNameChangeRef.current = onNameChange;

  useEffect(() => {
    setSearchValue(name ?? "");
  }, [name]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = searchValue.trim();
      if (next !== (name?.trim() ?? "")) onNameChangeRef.current(next);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchValue, name]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-11 flex-1 rounded-xl"
        />
        <div className="flex shrink-0 items-center gap-2">
          {children}
          <Badge
            variant="ghost"
            className="hidden h-10 rounded-full border border-border bg-transparent px-6 text-sm font-medium text-foreground lg:flex"
          >
            {totalLabel}
          </Badge>
        </div>
      </div>
      <SelectedAttributeBadges items={chips} onRemove={onClearDimension} />
    </div>
  );
}
