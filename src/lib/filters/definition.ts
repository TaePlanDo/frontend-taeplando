type Filters = Record<string, unknown>;

export type Bounds = { min: number; max: number };

export type CatalogItem = { id: string | number; name: string };

export type FilterCatalogs = Record<string, CatalogItem[]>;

type KeysOfType<F extends Filters, T> = {
  [K in keyof F]-?: NonNullable<F[K]> extends T ? K : never;
}[keyof F] &
  string;

type Field<
  F extends Filters,
  K extends "string" | "int" | "stringCsv" | "intCsv",
> = {
  [Kind in K]: {
    key: KeysOfType<
      F,
      Kind extends "string"
        ? string
        : Kind extends "int"
          ? number
          : Kind extends "stringCsv"
            ? string[]
            : number[]
    >;
    kind: Kind;
  };
}[K];
type StringKey<F extends Filters> = {
  [K in keyof F]-?: NonNullable<F[K]> extends string ? K : never;
}[keyof F] &
  string;
type SwitchDimension<F extends Filters> = {
  [K in StringKey<F>]: {
    kind: "switch";
    label: string;
    fields: [{ key: K; kind: "string" }];
    value: NonNullable<F[K]>;
  };
}[StringKey<F>];

export type FilterDimension<F extends Filters> = {
  key: string;
  chip: (filters: F, catalogs: FilterCatalogs) => string;
} & (
  | { kind: "text"; fields: [Field<F, "string">] }
  | {
      kind: "range";
      label: string;
      fields: [Field<F, "int">, Field<F, "int">];
      range: Bounds;
    }
  | {
      kind: "catalog";
      label?: string;
      fields: [Field<F, "stringCsv" | "intCsv">];
    }
  | SwitchDimension<F>
);

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
  return dimensions.flatMap<{
    key: keyof F & string;
    kind: "string" | "int" | "stringCsv" | "intCsv";
  }>((dimension) => dimension.fields);
}

export function normalizeFilters<F extends Filters>(
  filters: F,
  dimensions: FilterDimension<F>[],
): F {
  const next: Filters = {};

  for (const dimension of dimensions) {
    const { fields } = dimension;
    if (dimension.kind === "range") {
      const { range } = dimension;
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

    if (dimension.kind === "switch") {
      const key = dimension.fields[0].key;
      if (filters[key] === dimension.value) next[key] = dimension.value;
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
  { filters, page }: ListSearchState<NoInfer<F>>,
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
  filters: NoInfer<F>,
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
  filters: NoInfer<F>,
  dimensions: FilterDimension<F>[],
  catalogs: FilterCatalogs,
) {
  return activeDimensions(filters, dimensions).map((dimension) => ({
    id: dimension.key,
    name: dimension.chip(filters, catalogs),
  }));
}

export function withoutDimension<F extends Filters>(
  filters: NoInfer<F>,
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
