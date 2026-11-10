type Filters = Record<string, unknown>;

export type Bounds = { min: number; max: number };

export type CatalogItem = { id: string | number; name: string };

export type FilterCatalogs = Record<string, CatalogItem[]>;

export type FilterDimension<F extends Filters> = {
  key: string;
  label?: string;
  fields: {
    key: keyof F & string;
    kind: "string" | "int" | "stringCsv" | "intCsv";
  }[];
  range?: Bounds;
  chip: (filters: F, catalogs: FilterCatalogs) => string;
};

export type ListSearchState<F> = { filters: F; page: number };

export function parsePositiveInt(raw: string | null) {
  const value = Number(raw);
  return raw && Number.isInteger(value) && value >= 0 ? value : undefined;
}

function parseCsv(raw: string | null) {
  return (raw ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function fieldsOf<F extends Filters>(dimensions: FilterDimension<F>[]) {
  return dimensions.flatMap((dimension) => dimension.fields);
}

export function normalizeFilters<F extends Filters>(
  filters: F,
  dimensions: FilterDimension<F>[],
): F {
  const next: Filters = {};

  for (const { fields, range } of dimensions) {
    if (range) {
      const [minKey, maxKey] = fields.map((field) => field.key);
      const pick = (key: string) => {
        const value = filters[key];
        return typeof value === "number" &&
          Number.isInteger(value) &&
          value >= range.min &&
          value <= range.max
          ? value
          : undefined;
      };
      const min = pick(minKey);
      const max = pick(maxKey);
      const isDefault = min === range.min && max === range.max;
      const isInverted = min != null && max != null && min > max;
      if (!isDefault && !isInverted) {
        if (min != null) next[minKey] = min;
        if (max != null) next[maxKey] = max;
      }
      continue;
    }

    for (const { key, kind } of fields) {
      const value = filters[key];
      if (kind === "string") {
        const text = typeof value === "string" ? value.trim() : "";
        if (text) next[key] = text;
      } else if (Array.isArray(value) && value.length) {
        next[key] = [...new Set(value)];
      }
    }
  }

  return next as F;
}

export function appendFilters<F extends Filters>(
  params: URLSearchParams,
  filters: F,
  dimensions: FilterDimension<F>[],
) {
  const normalized: Filters = normalizeFilters(filters, dimensions);
  for (const { key } of fieldsOf(dimensions)) {
    if (normalized[key] != null) params.set(key, String(normalized[key]));
  }
}

function parseFilters<F extends Filters>(
  params: URLSearchParams,
  dimensions: FilterDimension<F>[],
): F {
  const parsed: Filters = {};
  for (const { key, kind } of fieldsOf(dimensions)) {
    const raw = params.get(key);
    if (kind === "int") parsed[key] = parsePositiveInt(raw);
    else if (kind === "intCsv")
      parsed[key] = parseCsv(raw).map(Number).filter(Number.isInteger);
    else if (kind === "stringCsv") parsed[key] = parseCsv(raw);
    else parsed[key] = raw;
  }
  return normalizeFilters(parsed as F, dimensions);
}

export function parseListSearchParams<F extends Filters>(
  params: URLSearchParams,
  dimensions: FilterDimension<F>[],
): ListSearchState<F> {
  return {
    page: Math.max(1, parsePositiveInt(params.get("page")) ?? 1),
    filters: parseFilters(params, dimensions),
  };
}

export function toListSearchParams<F extends Filters>(
  { filters, page }: ListSearchState<F>,
  dimensions: FilterDimension<F>[],
) {
  const params = new URLSearchParams();
  appendFilters(params, filters, dimensions);
  if (page > 1) params.set("page", String(page));
  return params;
}

export function replaceListSearchParams<F extends Filters>(
  current: URLSearchParams,
  state: ListSearchState<F>,
  dimensions: FilterDimension<F>[],
) {
  const next = new URLSearchParams(current);
  for (const { key } of fieldsOf(dimensions)) next.delete(key);
  next.delete("page");
  toListSearchParams(state, dimensions).forEach((value, key) =>
    next.set(key, value),
  );
  return next;
}

export function namesFor(
  ids: Array<string | number> | undefined,
  catalog: CatalogItem[],
) {
  return (ids ?? [])
    .map(
      (id) =>
        catalog.find((item) => String(item.id) === String(id))?.name ?? id,
    )
    .join(", ");
}

export function activeDimensions<F extends Filters>(
  filters: F,
  dimensions: FilterDimension<F>[],
) {
  return dimensions.filter(({ fields }) =>
    fields.some(({ key }) => {
      const value = filters[key];
      return Array.isArray(value)
        ? value.length > 0
        : value != null && value !== "";
    }),
  );
}

export function activeChips<F extends Filters>(
  filters: F,
  dimensions: FilterDimension<F>[],
  catalogs: FilterCatalogs,
) {
  return activeDimensions(filters, dimensions).map((dimension) => ({
    id: dimension.key,
    name: dimension.chip(filters, catalogs),
  }));
}

export function withoutDimension<F extends Filters>(
  filters: F,
  dimensionKey: string,
  dimensions: FilterDimension<F>[],
): F {
  const keys: string[] =
    dimensions
      .find((dimension) => dimension.key === dimensionKey)
      ?.fields.map((field) => field.key) ?? [];
  return Object.fromEntries(
    Object.entries(filters).filter(([key]) => !keys.includes(key)),
  ) as F;
}
