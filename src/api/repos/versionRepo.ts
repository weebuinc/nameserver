import { Database } from 'lib/types';
import { db } from 'api/providers';

type Version = Database.Table.Version;

export const versionRepo = {
  list() {
    const sql = `SELECT * FROM versions`;
    return db.prepare<Array<Version>>(sql).all() as Array<Version>;
  }
};
