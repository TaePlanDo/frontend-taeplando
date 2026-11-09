export type CatalogItem = { id: string | number; name: string };

export type FilterCatalogs = Record<string, CatalogItem[]>;

export type ActiveFilterChip = { key: string; label: string };

export type DimensionSpec<Filters> = {
  key: string;
  fields: Array<keyof Filters & string>;
  active?: (filters: Filters) => boolean;
  label: (filters: Filters, catalogs: FilterCatalogs) => string;
};

export function namesFor(
  ids: Array<string | number> | undefined,
  catalog: CatalogItem[],
): string {
  return (ids ?? [])
    .map(
      (id) =>
        catalog.find((item) => String(item.id) === String(id))?.name ??
        String(id),
    )
    .join(", ");
}

function hasValues(value: unknown): boolean {
  return Array.isArray(value)
    ? value.length > 0
    : value != null && value !== "";
}

function withoutFields<Filters extends object>(
  filters: Filters,
  fields: Array<keyof Filters & string>,
): Filters {
  const excluded = new Set<string>(fields);
  return Object.fromEntries(
    Object.entries(filters).filter(([key]) => !excluded.has(key)),
  ) as Filters;
}

function isActive<Filters extends object>(
  dimension: DimensionSpec<Filters>,
  filters: Filters,
): boolean {
  if (dimension.active) return dimension.active(filters);
  return dimension.fields.some((field) => hasValues(filters[field]));
}

export function withoutFilterDimension<Filters extends object>(
  filters: Filters,
  dimensions: DimensionSpec<Filters>[],
  key: string,
): Filters {
  const dimension = dimensions.find((entry) => entry.key === key);
  return dimension ? withoutFields(filters, dimension.fields) : filters;
}

export function countActiveFilters<Filters extends object>(
  filters: Filters,
  dimensions: DimensionSpec<Filters>[],
  options?: { exclude?: string[] },
): number {
  const excluded = new Set(options?.exclude ?? []);
  return dimensions.filter(
    (dimension) => !excluded.has(dimension.key) && isActive(dimension, filters),
  ).length;
}

export function buildActiveFilterChips<Filters extends object>(
  filters: Filters,
  dimensions: DimensionSpec<Filters>[],
  catalogs: FilterCatalogs,
): ActiveFilterChip[] {
  return dimensions
    .filter((dimension) => isActive(dimension, filters))
    .map((dimension) => ({
      key: dimension.key,
      label: dimension.label(filters, catalogs),
    }));
}
