import { psql } from "./compose";

/**
 * Clear all app tables (keep alembic_version).
 * Re-create needed data via API helpers (e.g. createLocalTrainer), not backend seed.
 * Safe only against the taeplando-e2e Compose project.
 */
export async function resetDb(): Promise<void> {
  psql(`
DO $$
DECLARE
  stmt text;
BEGIN
  SELECT 'TRUNCATE TABLE ' || string_agg(format('%I.%I', schemaname, tablename), ', ')
    || ' RESTART IDENTITY CASCADE'
  INTO stmt
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename <> 'alembic_version';

  IF stmt IS NOT NULL THEN
    EXECUTE stmt;
  END IF;
END $$;
`);
}
