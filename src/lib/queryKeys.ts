export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  groups: {
    all: ["groups"] as const,
    lists: () => [...queryKeys.groups.all, "list"] as const,
    list: (page: number, pageSize: number) =>
      [...queryKeys.groups.lists(), { page, pageSize }] as const,
    details: () => [...queryKeys.groups.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.groups.details(), id] as const,
  },
};
