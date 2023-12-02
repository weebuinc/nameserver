import { inspect } from 'util';
import iq from 'inquirer';
import validator from 'validator';

import { getBasename } from 'api/utils';
import { promptRepo, serverRepo } from 'api/repos';
import { createNameService, createUdpClient } from 'api/services';

const key = getBasename(__filename);

interface Prompt {
  address: string;
  name: string;
}
async function run() {
  try {
    const prev = promptRepo.get<Prompt>(key) || ({} as Prompt);
    const answers = await iq.prompt<Prompt>([
      {
        name: 'address',
        type: 'list',
        message: `choose a forwarding nameserver:`,
        choices: serverRepo.list().map(s => s.address),
        default: prev.address
      },
      {
        name: 'name',
        type: 'string',
        message: `enter the domain that needs to be resolved:`,
        default: prev.name,
        validate(value: string) {
          return validator.isURL(value, {
            allow_protocol_relative_urls: true,
            require_protocol: false,
            require_host: true
          });
        }
      }
    ]);

    promptRepo.put(key, answers);
    const { address, name } = answers;
    const timeout = 1000;

    const ns = createNameService();
    const udp = createUdpClient({ address, timeout });

    try {
      const ans = ns.query(name) || (await udp.query(name));
      console.info(inspect(ans, false, 100, true));
    } catch (err) {
      throw err;
    } finally {
      await udp.close();
    }
  } catch (err) {
    console.error(err);
  }
}

run();
