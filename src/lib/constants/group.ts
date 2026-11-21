export const GROUP_LIMITS = {
  MIN_AGE: 1,
  MAX_AGE: 99,
  MAX_HOURS: 12,
} as const;

export const DEFAULT_GROUP_DURATION = {
  HOURS: 1,
  MINUTES: 0,
} as const;

export const GROUP_SCHEMA_LIMITS = {
  MIN_PERCENTAGE: 1,
  TOTAL_PERCENTAGE: 100,
} as const;
