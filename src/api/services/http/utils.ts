import type { IncomingMessage, ServerResponse } from 'http';
import { decode, encode, Packet } from 'dns-packet';

export function getBinaryPacket(req: IncomingMessage) {
  const chunks = [];
  return new Promise<Packet>((resolve, reject) => {
    req.on('data', chunk => chunks.push(chunk));
    req.once('end', () => resolve(decode(Buffer.concat(chunks))));
    req.once('error', reject);
  });
}

export function sendBinaryPacket(packet: Packet, res: ServerResponse) {
  const buffer = encode(packet);
  if (!res.headersSent) {
    res.setHeader('content-type', 'application/dns-message');
  }
  return new Promise<void>(resolve => {
    if (res.writable && !res.destroyed) {
      res.write(buffer, err => {
        err && console.error(err);
        sendStatus(err ? 501 : 200, res).then(resolve);
      });
    }
  });
}

export function sendStatus(code: number, res: ServerResponse) {
  if (!res.headersSent) {
    res.statusCode = code;
  }

  return new Promise<void>(resolve => {
    res.writable ? res.end(() => resolve()) : resolve();
  });
}
