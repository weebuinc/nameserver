import { inspect } from 'util';
import { Answer } from 'dns-packet';
import { wait, withCatch } from '@weebuinc/web-kit';

import { getBasename } from 'api/utils';
import { serverRepo } from 'api/repos';
import { createNameService, createUdpClient, createUdpServer } from 'api/services';

const key = getBasename(__filename);

async function run() {
  let active = true;
  process.on('SIGINT', () => {
    active = false;
  });

  const ns = createNameService();
  const clients = serverRepo.list().map(s => createUdpClient({ address: s.address }));
  const server = createUdpServer({
    onBind({ address, port, family }) {
      console.info(`listening on ${family} ${address}:${port}`);
    },
    onError(error) {
      console.error(error);
    },
    async onQuery(question, info) {
      const ans = ns.query(question.name);
      if (ans) {
        console.log(
          `providing answer for ${info.address}:${info.port}\n`,
          inspect(ans, false, 5, true)
        );
      } else {
        for (const client of clients) {
          const { result, error } = await withCatch<Error, Answer>(() =>
            client.query(question.name, question.type, question.class)
          );
          error && console.warn(error);
          if (result) {
            console.log(
              `providing answer for ${info.address}:${info.port}\n`,
              inspect(result, false, 5, true)
            );
            return result;
          }
        }
        console.log(
          `unable to provide answer for ${info.address}:${info.port}\n`,
          inspect(question, false, 5, true)
        );
      }
      return ans;
    }
  });

  try {
    await server.connect();
    while (active) {
      await wait(1000);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await Promise.all(clients.map(c => c.close()));
    await server.close();
  }
}

run();
