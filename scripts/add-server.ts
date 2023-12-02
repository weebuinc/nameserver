import iq from 'inquirer';
import validator from 'validator';

import { Database } from 'lib/types';
import { getBasename } from 'api/utils';
import { promptRepo, serverRepo } from 'api/repos';

type Server = Database.Table.NameServer;
const key = getBasename(__filename);

async function run() {
  try {
    const prev = promptRepo.get<Server>(key) || ({} as Server);
    const server = await iq.prompt<Server>([
      {
        name: 'address',
        type: 'input',
        message: `enter the ip address of the forwarding server:`,
        default: prev.address,
        validate(value: string) {
          return validator.isIP(value, '4');
        }
      },
      {
        name: 'priority',
        type: 'number',
        message: `enter the priority of the forwarding server:`,
        default: prev.priority || 0,
        validate(value: number) {
          return value >= 0;
        }
      }
    ]);

    promptRepo.put(key, server);
    serverRepo.put(server);
  } catch (err) {
    console.error(err);
  }
}

run();
