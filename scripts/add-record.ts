import iq from 'inquirer';
import validator from 'validator';

import { Database } from 'lib/types';
import { getBasename } from 'api/utils';
import { promptRepo, recordRepo } from 'api/repos';

type Record = Database.Table.Record;
const key = getBasename(__filename);

async function run() {
  try {
    const prev = promptRepo.get<Record>(key) || ({} as Record);
    const record = await iq.prompt<Record>([
      {
        name: 'name',
        type: 'input',
        message: `enter the ip name of the record:`,
        default: prev.name,
        filter(value: string, ans) {
          ans.type = 'A';
          return value;
        }
      },
      {
        name: 'address',
        type: 'input',
        message: `enter the ip address of the record:`,
        default: prev.address,
        validate(value: string) {
          return validator.isIP(value, '4');
        }
      }
    ]);

    promptRepo.put(key, record);
    recordRepo.put(record);
  } catch (err) {
    console.error(err);
  }
}

run();
