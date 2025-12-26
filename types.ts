
export interface Column {
  name: string;
  type: string;
  description?: string;
}

export interface Table {
  name: string;
  columns: Column[];
}

export interface Schema {
  id: string;
  name: string;
  description: string;
  tables: Table[];
}

export interface HistoryItem {
  id: string;
  prompt: string;
  sql: string;
  timestamp: number;
  dialect: string;
  schemaId: string;
  reasoning?: string[];
}

export enum Dialect {
  POSTGRES = 'PostgreSQL',
  MYSQL = 'MySQL',
  SQLITE = 'SQLite',
  SNOWFLAKE = 'Snowflake',
  BIGQUERY = 'BigQuery',
  CLICKHOUSE = 'ClickHouse'
}
