export type Group = {
  id: string;
  name: string;
  min_age: number;
  max_age: number;
  duration_minutes: number;
  created_at: Date;
  updated_at: Date;
};

export type GroupWrite = {
  name: string;
  min_age: number;
  max_age: number;
  duration_minutes: number;
};
