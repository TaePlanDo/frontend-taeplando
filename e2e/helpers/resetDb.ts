import { psql } from "./compose";

/**
 * Clear test-created app data while preserving global exercise catalogs.
 * Re-create users and domain data via API helpers (e.g. createLocalTrainer).
 * Safe only against the taeplando-e2e Compose project.
 */
export function resetDb(): void {
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
    AND tablename NOT IN (
      'alembic_version',
      'training_segments',
      'training_types'
    );

  IF stmt IS NOT NULL THEN
    EXECUTE stmt;
  END IF;
END $$;
`);
}
