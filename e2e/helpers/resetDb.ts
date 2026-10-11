import { seedDatabase } from "./backend";
import { psql } from "./compose";

/**
 * Restore the e2e DB to the seeded baseline (truncate app tables, keep alembic_version).
 * Call from a test, beforeEach, or beforeAll when you need a clean slate.
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
  seedDatabase();
}
