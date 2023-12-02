import { Database } from 'lib/types';
import { db } from 'api/providers';

type Server = Database.Table.NameServer;
type S = Partial<Server>;

export const serverRepo = {
  dropByAddress(address: string) {
    const sql = `DELETE FROM servers WHERE address = $address`;
    return db.prepare<S>(sql).run({ address });
  },
  getByAddress(address: string) {
    const sql = `SELECT * FROM servers WHERE address = $address`;
    return db.prepare<S>(sql).get({ address });
  },
  list() {
    const sql = `SELECT * FROM servers ORDER BY priority ASC`;
    return db.prepare<Array<Server>>(sql).all() as Array<Server>;
  },
  put(server: Server) {
    const sql = `REPLACE INTO servers (address, priority) VALUES ($address, $priority)`;
    return db.prepare<Server>(sql).run(server);
  }
};
