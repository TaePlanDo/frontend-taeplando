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
  unavailableMessage?: string;
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
  unavailableMessage,
  className,
  labelClassName,
}: CatalogMultiSelectProps) {
  const selected = selectedIds.map(
    (id) =>
      items.find((item) => String(item.id) === id) ?? {
        id,
        name: `Niedostępny element (${id})`,
      },
  );
  const available = items.filter(
    (item) => !selectedIds.includes(String(item.id)),
  );

  return (
    <div className={className}>
      <div className="flex flex-col gap-1">
        <CustomizedSelect
          label={label}
          labelClassName={labelClassName}
          value=""
          placeholder={
            unavailableMessage
              ? unavailableMessage
              : isLoading
                ? "Ładowanie…"
                : available.length === 0
                  ? "Wszystkie elementy z listy są już dodane"
                  : placeholder
          }
          options={available.map((item) => ({
            value: String(item.id),
            label: item.name,
          }))}
          disabled={
            disabled ||
            isLoading ||
            Boolean(unavailableMessage) ||
            available.length === 0
          }
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
              selectedIds.filter((selectedId) => selectedId !== String(id)),
            )
          }
        />
      </div>
    </div>
  );
}
