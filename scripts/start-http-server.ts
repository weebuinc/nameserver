import { inspect } from 'util';
import { Answer } from 'dns-packet';
import { wait, withCatch } from '@weebuinc/web-kit';

import { serverRepo } from 'api/repos';
import { createNameService, createUdpClient, createHttpServer } from 'api/services';
import { Endpoint as E, createDohClient } from 'api/services/doh';

const { result: endpoints } = withCatch(() => {
  const list = process.env.DOH_ENDPOINTS;
  const filters: Array<E> = ['cloudflare', 'google'];
  if (list) {
    return list
      .split(/\,|\;/)
      .map(e => e as E)
      .filter(e => filters.includes(e));
  }
  return [];
});
function getSsl() {
  const { SSL_CA, SSL_CERT, SSL_KEY, SSL_ENABLED, SSL_PROTOCOL } = process.env;
  const enabled = /^true$/i.test(SSL_ENABLED);
  if (enabled) {
    return { ca: SSL_CA, cert: SSL_CERT, key: SSL_KEY, secureProtocol: SSL_PROTOCOL };
  }
}

async function run() {
  let active = true;
  process.on('SIGINT', () => {
    active = false;
  });

  const ssl = getSsl();
  const ns = createNameService();

  console.info('doh endpoints:', ...endpoints);

  const dohClients = endpoints.map(endpoint => createDohClient({ endpoint }));
  const udpClients = serverRepo.list().map(s => createUdpClient({ address: s.address }));

  const server = createHttpServer({
    ssl,
    onBind(info) {
      console.info(`listening on ${info.family} ${info.address}:${info.port}`);
    },
    onQuery: async (question, info) => {
      const ans = ns.query(question.name);
      if (ans) {
        console.log(
          `providing answer for ${info.address}:${info.port}\n`,
          inspect(ans, false, 5, true)
        );
      } else {
        // use DNS over HTTPS first
        for (const client of dohClients) {
          const { result, error } = await withCatch<Error, Answer>(() => client.query(question));
          error && console.warn(error);
          if (result) {
            console.log(
              `[doh][${client.endpoint}][${client.url}] providing answer for ${info.address}:${info.port}\n`,
              inspect(result, false, 5, true)
            );
            return result;
          }
        }

        // use DNS over UDP next
        for (const client of udpClients) {
          const { result, error } = await withCatch<Error, Answer>(() =>
            client.query(question.name, question.type, question.class)
          );
          error && console.warn(error);
          if (result) {
            console.log(
              `[udp][${client.address}] providing answer for ${info.address}:${info.port}\n`,
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
    await Promise.all(udpClients.map(c => c.close()));
    await server.close();
  }
}

run();
