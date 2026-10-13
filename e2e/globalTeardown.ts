import { stopE2ePostgres } from "./helpers/compose";

async function globalTeardown(): Promise<void> {
  stopE2ePostgres(true);
}

export default globalTeardown;
