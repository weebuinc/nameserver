import type { AddressInfo } from 'net';
import http, { IncomingMessage, ServerResponse } from 'http';
import https from 'https';
import type { Answer, Question } from 'dns-packet';

import { iface } from 'api/providers';

import { getBinaryPacket, sendBinaryPacket, sendStatus } from './utils';

interface SslParams {
  ca?: string;
  cert: string;
  key: string;
  secureProtocol?: 'TLSv1_1_method' | 'TLSv1_2_method' | 'TLSv1_3_method' | string;
}
interface Dependencies {
  host?: string;
  port?: number;
  ssl?: SslParams;
  onBind?: (info: AddressInfo) => any;
  onQuery: (query: Question, info?: AddressInfo) => Promise<Answer>;
}

export function createHttpServer(deps: Dependencies) {
  const { ssl } = deps;

  async function handle(req: IncomingMessage, res: ServerResponse) {
    const { onQuery } = deps;
    const body = await getBinaryPacket(req);

    if (req.method === 'POST') {
      const info = req.socket.address() as AddressInfo;
      body.answers = (await Promise.all(body.questions.map(query => onQuery(query, info)))).filter(
        a => Boolean(a)
      );
      body.type = 'response';
      await sendBinaryPacket(body, res);
    } else {
      await sendStatus(501, res);
    }
  }

  const server = ssl
    ? https.createServer({ ...ssl, requestCert: false }, handle)
    : http.createServer(handle);
  server.on('tlsClientError', err => {
    console.warn('tlsClientError:', err);
  });

  function close() {
    return new Promise<void>((resolve, reject) => {
      server.closeAllConnections();
      server.close(err => (err ? reject(err) : resolve()));
    });
  }
  async function connect() {
    const {
      port = iface.getHttpPort(ssl ? 443 : 80),
      host = iface.getIp('v4'),
      onBind = () => {}
    } = deps;
    server.listen(port, host, () => onBind(server.address() as AddressInfo));
  }

  return {
    close,
    connect
  };
}
