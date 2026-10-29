import { CustomizedSelect } from "@/components/shared/CustomizedSelect";

import { SelectedAttributeBadges } from "./SelectedAttributeBadges";

type CatalogItem = {
  id: string | number;
  name: string;
};

type CatalogMultiSelectProps = {
  label: string;
  placeholder?: string;
  items: CatalogItem[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  labelClassName?: string;
};

export function CatalogMultiSelect({
  label,
  placeholder = "Wybierz z listy…",
  items,
  selectedIds,
  onSelectedIdsChange,
  disabled,
  isLoading,
  className,
  labelClassName,
}: CatalogMultiSelectProps) {
  const selected = items.filter((item) =>
    selectedIds.includes(String(item.id)),
  );
  const available = items.filter(
    (item) => !selectedIds.includes(String(item.id)),
  );

  return (
    <div className={className}>
      <div className="flex flex-col gap-1">
        <CustomizedSelect
          key={`${label}-${selectedIds.join("-")}`}
          label={label}
          labelClassName={labelClassName}
          placeholder={
            isLoading
              ? "Ładowanie…"
              : available.length === 0
                ? "Wszystkie elementy z listy są już dodane"
                : placeholder
          }
          options={available.map((item) => ({
            value: String(item.id),
            label: item.name,
          }))}
          disabled={disabled || isLoading || available.length === 0}
          onValueChange={(id) => {
            if (!selectedIds.includes(id)) {
              onSelectedIdsChange([...selectedIds, id]);
            }
          }}
        />
        <SelectedAttributeBadges
          items={selected}
          onRemove={(id) =>
            onSelectedIdsChange(
              selectedIds.filter((selectedId) => selectedId !== id),
            )
          }
        />
      </div>
    </div>
  );
}
