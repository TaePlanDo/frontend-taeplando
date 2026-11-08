export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  groups: {
    all: ["groups"] as const,
    options: () => [...queryKeys.groups.all, "options"] as const,
    lists: () => [...queryKeys.groups.all, "list"] as const,
  },
  trainingSegments: {
    all: ["training-segments"] as const,
    list: () => [...queryKeys.trainingSegments.all, "list"] as const,
  },
  exercises: {
    all: ["exercises"] as const,
    lists: () => [...queryKeys.exercises.all, "list"] as const,
    catalogs: () => [...queryKeys.exercises.all, "catalogs"] as const,
  },
  equipment: {
    all: ["equipment"] as const,
    options: () => [...queryKeys.equipment.all, "options"] as const,
    lists: () => [...queryKeys.equipment.all, "list"] as const,
  },
  trainingTypes: {
    all: ["training-types"] as const,
    options: () => [...queryKeys.trainingTypes.all, "options"] as const,
  },
  plans: {
    all: ["plans"] as const,
    detail: (planId: string) =>
      [...queryKeys.plans.all, "detail", planId] as const,
  },
  planGeneration: {
    all: ["plan-generation"] as const,
    status: (jobId: string) =>
      [...queryKeys.planGeneration.all, "status", jobId] as const,
  },
};
