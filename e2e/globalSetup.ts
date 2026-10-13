import { migrateDatabase } from "./helpers/backend";
import { startE2ePostgres } from "./helpers/compose";

async function globalSetup(): Promise<void> {
  startE2ePostgres();
  migrateDatabase();
}

export default globalSetup;
