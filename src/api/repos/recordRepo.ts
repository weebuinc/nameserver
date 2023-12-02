import { Database } from 'lib/types';
import { db } from 'api/providers';

type Record = Database.Table.Record;
type R = Partial<Record>;
type Type = Database.Table.RecordType;

export const recordRepo = {
  dropByNameAndType(name: string, type: Type) {
    const sql = `DELETE FROM records WHERE name = $name AND type = $type`;
    return db.prepare<R>(sql).run({ name, type });
  },
  getByNameAndType(name: string, type: Type) {
    const sql = `SELECT * FROM records WHERE name = $name AND type = $type`;
    return db.prepare<R>(sql).get({ name, type }) as Record;
  },
  list() {
    const sql = `SELECT * FROM records`;
    return db.prepare<Array<Record>>(sql).all() as Array<Record>;
  },
  put(record: Record) {
    const sql = `REPLACE INTO records (name, type, address) VALUES ($name, $type, $address)`;
    return db.prepare<Record>(sql).run(record);
  }
};
