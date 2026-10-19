export type Group = {
  id: string;
  name: string;
  min_age: number;
  max_age: number;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
};

export type GroupWrite = {
  name: string;
  min_age: number;
  max_age: number;
  duration_minutes: number;
};
