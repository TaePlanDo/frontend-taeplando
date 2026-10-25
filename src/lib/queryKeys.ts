export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  groups: {
    all: ["groups"] as const,
    lists: () => [...queryKeys.groups.all, "list"] as const,
  },
  exercises: {
    all: ["exercises"] as const,
    lists: () => [...queryKeys.exercises.all, "list"] as const,
    catalogs: () => [...queryKeys.exercises.all, "catalogs"] as const,
  },
};
