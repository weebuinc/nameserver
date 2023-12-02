import path from 'path';
import Sqlite3, { Database as SqlDatabase } from 'better-sqlite3';

import { Database } from 'lib/types';
import { versions } from './versions';

type P<T> = Partial<T>;
type Version = Database.Table.Version;

const { DATABASE_PATH } = process.env;

export const db: SqlDatabase = new Sqlite3(path.resolve(DATABASE_PATH), {
  fileMustExist: false
});

db.pragma('journal_mode = WAL');
db.exec(
  `CREATE TABLE IF NOT EXISTS versions (tag TEXT PRIMARY KEY, description TEXT, script TEXT)`
);

process.on('exit', () => db.close());

const insert = db.prepare<P<Version>>(
  `INSERT INTO versions (tag, description, script) VALUES (@tag, @description, @script)`
);
for (const { tag, description, script } of versions) {
  const version = db
    .prepare<P<Version>>(`SELECT * FROM versions WHERE tag = @tag`)
    .get({ tag }) as Version;

  if (!version) {
    try {
      db.exec(script);
      insert.run({ tag, description, script });
    } catch (err) {
      console.error(`unable to install following script`, { tag, description });
      console.error(err);
    }
  }
}
