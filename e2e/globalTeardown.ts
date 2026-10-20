import { stopE2ePostgres } from "./helpers/compose";

function globalTeardown(): void {
  stopE2ePostgres(true);
}

export default globalTeardown;
