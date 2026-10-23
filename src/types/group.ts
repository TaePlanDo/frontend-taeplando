export type GroupSchemaItem = {
  segment_id: number;
  segment_code: string;
  segment_name: string;
  percentage: number;
  position: number;
};

export type GroupSchemaWriteItem = {
  segment_id: number;
  percentage: number;
};

export type GroupSchemaWrite = {
  items: GroupSchemaWriteItem[];
};

export type Group = {
  id: string;
  name: string;
  min_age: number;
  max_age: number;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
  schema: GroupSchemaItem[];
};

export type GroupWrite = {
  name: string;
  min_age: number;
  max_age: number;
  duration_minutes: number;
};
