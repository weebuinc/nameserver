import { Database } from 'lib/types';
import { db } from 'api/providers';

type Prompt = Database.Table.Prompt;

export const promptRepo = {
  get<T = any>(key: string) {
    const sql = `SELECT * FROM prompts WHERE key = $key`;
    const prompt = db.prepare<Partial<Prompt>>(sql).get({ key }) as Prompt;
    if (prompt) {
      return JSON.parse(prompt.data) as T;
    }
  },
  list() {
    const sql = `SELECT * FROM prompts`;
    return db.prepare<Array<Prompt>>(sql).all() as Array<Prompt>;
  },
  put<D>(key: string, data: D) {
    const sql = `REPLACE INTO prompts (key, data) VALUES($key, $data)`;
    db.prepare<Prompt>(sql).run({ key, data: JSON.stringify(data, null, 2) });
  }
};
