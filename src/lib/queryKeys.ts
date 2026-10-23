export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  groups: {
    all: ["groups"] as const,
    lists: () => [...queryKeys.groups.all, "list"] as const,
  },
  trainingSegments: {
    all: ["training-segments"] as const,
    list: () => [...queryKeys.trainingSegments.all, "list"] as const,
  },
};
