import { migrateDatabase, seedSystemData } from "./helpers/backend";
import { startE2ePostgres } from "./helpers/compose";

function globalSetup(): void {
  startE2ePostgres();
  migrateDatabase();
  seedSystemData();
}

export default globalSetup;
