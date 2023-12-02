import { Database } from 'lib/types';

type Version = Database.Table.Version;

export const versions: Array<Version> = [
  {
    tag: '1.0.0',
    description: `Initial table setup`,
    script: `
    CREATE TABLE prompts (key TEXT PRIMARY KEY, data BLOB);
    CREATE TABLE records (name TEXT, type TEXT, address TEXT);
    CREATE UNIQUE INDEX records_un ON records (name,type);
    CREATE INDEX records_name_idx ON records (name);
    CREATE INDEX records_type_idx ON records (type);
    CREATE TABLE servers (address TEXT PRIMARY KEY, priority INTEGER);
    CREATE INDEX servers_address ON servers (address);
    `
  },
  {
    tag: '1.1.0',
    description: `Unique index for servers table priority field`,
    script: `
    CREATE UNIQUE INDEX IF NOT EXISTS servers_priority ON servers (priority);
    `
  }
];
