
import { Schema, Dialect } from './types';

export const DEFAULT_SCHEMAS: Schema[] = [
  {
    id: 'ml-ops',
    name: 'Neural Experiment Tracking',
    description: 'Schema for tracking deep learning model training, metrics, and hyperparameter tuning.',
    tables: [
      {
        name: 'experiments',
        columns: [
          { name: 'id', type: 'UUID', description: 'Primary key' },
          { name: 'name', type: 'VARCHAR', description: 'Experiment name' },
          { name: 'created_at', type: 'TIMESTAMP', description: 'Creation time' }
        ]
      },
      {
        name: 'runs',
        columns: [
          { name: 'id', type: 'UUID', description: 'Run identifier' },
          { name: 'experiment_id', type: 'UUID', description: 'FK to experiments' },
          { name: 'status', type: 'VARCHAR', description: 'running, failed, finished' },
          { name: 'duration_seconds', type: 'INTEGER', description: 'Train time' }
        ]
      },
      {
        name: 'metrics',
        columns: [
          { name: 'run_id', type: 'UUID', description: 'FK to runs' },
          { name: 'step', type: 'INTEGER', description: 'Epoch or step index' },
          { name: 'loss', type: 'FLOAT', description: 'Loss value' },
          { name: 'accuracy', type: 'FLOAT', description: 'Accuracy value' }
        ]
      }
    ]
  },
  {
    id: 'iot-mesh',
    name: 'Smart City Sensor Mesh',
    description: 'High-velocity telemetry data from urban IoT infrastructure.',
    tables: [
      {
        name: 'sensors',
        columns: [
          { name: 'sensor_id', type: 'SERIAL', description: 'Unique ID' },
          { name: 'type', type: 'VARCHAR', description: 'Air, Traffic, Noise' },
          { name: 'latitude', type: 'DECIMAL', description: 'Geo location' },
          { name: 'longitude', type: 'DECIMAL', description: 'Geo location' }
        ]
      },
      {
        name: 'readings',
        columns: [
          { name: 'sensor_id', type: 'INTEGER', description: 'FK' },
          { name: 'timestamp', type: 'TIMESTAMP', description: 'Event time' },
          { name: 'value', type: 'DOUBLE', description: 'Measurement' },
          { name: 'unit', type: 'VARCHAR', description: 'ppm, db, kmh' }
        ]
      }
    ]
  },
  {
    id: 'fin-tech',
    name: 'NeoBank Transaction Core',
    description: 'Banking ledger and user account management systems.',
    tables: [
      {
        name: 'accounts',
        columns: [
          { name: 'acc_no', type: 'VARCHAR', description: 'IBAN/Account' },
          { name: 'user_id', type: 'INTEGER', description: 'Owner' },
          { name: 'balance', type: 'DECIMAL(15,2)', description: 'Current funds' },
          { name: 'currency', type: 'CHAR(3)', description: 'USD, EUR, GBP' }
        ]
      },
      {
        name: 'transactions',
        columns: [
          { name: 'id', type: 'BIGINT', description: 'PK' },
          { name: 'from_acc', type: 'VARCHAR', description: 'Sender' },
          { name: 'to_acc', type: 'VARCHAR', description: 'Receiver' },
          { name: 'amount', type: 'DECIMAL', description: 'Sum' },
          { name: 'category', type: 'VARCHAR', description: 'Food, Tech, Rent' }
        ]
      }
    ]
  }
];

export const SQL_DIALECTS = [
  Dialect.POSTGRES,
  Dialect.BIGQUERY,
  Dialect.SNOWFLAKE,
  Dialect.CLICKHOUSE,
  Dialect.MYSQL
];
