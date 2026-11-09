export type FieldKind = "string" | "int" | "stringCsv" | "intCsv";

export type FieldSpec = { key: string; kind: FieldKind };

export type Bounds = { min: number; max: number };

export type RangeSpec = { minKey: string; maxKey: string; bounds: Bounds };

export type FilterConfig = { fields: FieldSpec[]; ranges: RangeSpec[] };

export type Filters = Record<string, unknown>;

export function parsePositiveInt(raw: string | null): number | undefined {
  if (raw == null || raw === "") return undefined;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) return undefined;
  return value;
}

function parseStringCsv(raw: string | null): string[] | undefined {
  if (raw == null || raw.trim() === "") return undefined;
  const values = raw
    .split(",")
    .map((part) => part.trim())
    .filter((value) => value !== "");
  return values.length > 0 ? values : undefined;
}

function parseIntCsv(raw: string | null): number[] | undefined {
  if (raw == null || raw.trim() === "") return undefined;
  const values: number[] = [];
  for (const part of raw.split(",")) {
    const token = part.trim();
    if (!token) continue;
    const value = Number(token);
    if (Number.isInteger(value)) values.push(value);
  }
  return values.length > 0 ? values : undefined;
}

function isFullRange(
  min: number | undefined,
  max: number | undefined,
  bounds: Bounds,
): boolean {
  return min === bounds.min && max === bounds.max;
}

function isValidBound(value: number | undefined, bounds: Bounds): boolean {
  return (
    value != null &&
    Number.isInteger(value) &&
    value >= bounds.min &&
    value <= bounds.max
  );
}

function normalizeRange(
  min: number | undefined,
  max: number | undefined,
  bounds: Bounds,
): { min?: number; max?: number } {
  const normalizedMin = isValidBound(min, bounds) ? min : undefined;
  const normalizedMax = isValidBound(max, bounds) ? max : undefined;

  if (
    normalizedMin != null &&
    normalizedMax != null &&
    normalizedMin > normalizedMax
  ) {
    return {};
  }

  return { min: normalizedMin, max: normalizedMax };
}

function uniqueValues<T>(values: T[]): T[] {
  return [...new Set(values)];
}

/** Drop empties and full default ranges so URL/API stay lean. */
export function normalizeFilters(
  filters: Filters,
  config: FilterConfig,
): Filters {
  const next: Filters = {};

  for (const field of config.fields) {
    if (field.kind === "string") {
      const value = (filters[field.key] as string | undefined)?.trim();
      if (value) next[field.key] = value;
    }
  }

  for (const range of config.ranges) {
    const normalized = normalizeRange(
      filters[range.minKey] as number | undefined,
      filters[range.maxKey] as number | undefined,
      range.bounds,
    );
    if (!isFullRange(normalized.min, normalized.max, range.bounds)) {
      if (normalized.min != null) next[range.minKey] = normalized.min;
      if (normalized.max != null) next[range.maxKey] = normalized.max;
    }
  }

  for (const field of config.fields) {
    if (field.kind === "stringCsv" || field.kind === "intCsv") {
      const value = filters[field.key];
      if (Array.isArray(value) && value.length) {
        next[field.key] = uniqueValues(value);
      }
    }
  }

  return next;
}

export function appendFilters(
  params: URLSearchParams,
  filters: Filters,
  config: FilterConfig,
): void {
  const normalized = normalizeFilters(filters, config);

  for (const field of config.fields) {
    if (field.kind === "string") {
      const value = normalized[field.key];
      if (value) params.set(field.key, value as string);
    } else if (field.kind === "int") {
      const value = normalized[field.key];
      if (value != null) params.set(field.key, String(value));
    } else {
      const value = normalized[field.key];
      if (Array.isArray(value) && value.length) {
        params.set(field.key, value.join(","));
      }
    }
  }
}

export function parseFilters(
  params: URLSearchParams,
  config: FilterConfig,
): Filters {
  const parsed: Filters = {};

  for (const field of config.fields) {
    if (field.kind === "string") {
      const value = params.get(field.key)?.trim() || undefined;
      if (value) parsed[field.key] = value;
    } else if (field.kind === "int") {
      const value = parsePositiveInt(params.get(field.key));
      if (value != null) parsed[field.key] = value;
    } else if (field.kind === "stringCsv") {
      const value = parseStringCsv(params.get(field.key));
      if (value) parsed[field.key] = value;
    } else {
      const value = parseIntCsv(params.get(field.key));
      if (value) parsed[field.key] = value;
    }
  }

  return normalizeFilters(parsed, config);
}

export function filterParamKeys(config: FilterConfig): string[] {
  return config.fields.map(({ key }) => key);
}
