import iq from 'inquirer';

import { Database } from 'lib/types';
import { serverRepo } from 'api/repos';

type Server = Database.Table.NameServer;

async function run() {
  try {
    const { address } = await iq.prompt<Server>([
      {
        name: 'address',
        type: 'list',
        choices: serverRepo.list().map(s => s.address),
        message: `enter the ip address of the server you would like to drop:`
      }
    ]);

    serverRepo.dropByAddress(address);
  } catch (err) {
    console.error(err);
  }
}

run();
