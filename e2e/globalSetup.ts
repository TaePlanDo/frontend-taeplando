import { migrateDatabase, seedSystemData } from "./helpers/backend";
import { startE2ePostgres } from "./helpers/compose";
import { apiOrigin } from "./env";

type OpenApiDocument = {
  paths?: Record<
    string,
    {
      get?: {
        responses?: Record<
          string,
          { content?: Record<string, { schema?: { $ref?: string } }> }
        >;
      };
    }
  >;
};

async function assertTrainingGroupsContract(): Promise<void> {
  const response = await fetch(`${apiOrigin}/openapi.json`);
  if (!response.ok) {
    throw new Error(
      `Unable to load the backend OpenAPI document (${response.status})`,
    );
  }

  const openApi = (await response.json()) as OpenApiDocument;
  const schema =
    openApi.paths?.["/training-groups"]?.get?.responses?.["200"]?.content?.[
      "application/json"
    ]?.schema;

  if (!schema?.$ref?.includes("PaginatedResponse")) {
    throw new Error(
      "Training-groups E2E requires backend main with the paginated GET /training-groups response. " +
        "Use a backend checkout on main, or pass it with --backend-dir=<path>.",
    );
  }
}

async function globalSetup(): Promise<void> {
  startE2ePostgres();
  migrateDatabase();
  seedSystemData();
  await assertTrainingGroupsContract();
}

export default globalSetup;
