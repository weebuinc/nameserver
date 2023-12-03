import { createSocket, Socket, RemoteInfo } from 'dgram';
import { decode, encode, Answer, Question } from 'dns-packet';

import { iface } from 'api/providers';

type AddressInfo = ReturnType<Socket['address']>;
interface Dependencies {
  onBind?: (address: AddressInfo) => any;
  onError: (error: Error) => any;
  onQuery: (question: Question, info?: RemoteInfo) => Promise<Answer>;
  ipAddress?: string;
  port?: number;
}
export function createUdpServer(deps: Dependencies) {
  const {
    ipAddress = iface.getIp('v4'),
    port = iface.getPort(),
    onBind = () => {},
    onQuery,
    onError
  } = deps;
  const socket = createSocket('udp4');

  socket.on('error', onError);
  socket.on('listening', () => onBind(socket.address()));
  socket.on('message', async (msg, info) => {
    const packet = decode(msg);
    if (packet?.questions?.length > 0) {
      packet.answers = (
        await Promise.all(packet.questions.map(question => onQuery(question, info)))
      ).filter(a => Boolean(a));
    }
    packet.type = 'response';
    const buf = encode(packet);
    socket.send(buf, 0, buf.length, info.port, info.address);
  });

  function close() {
    return new Promise<void>(resolve => socket.close(resolve));
  }

  function connect() {
    return new Promise<void>(resolve => {
      socket.bind(port, ipAddress, resolve);
    });
  }

  return { close, connect };
}
