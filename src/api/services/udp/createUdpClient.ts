import { createSocket } from 'dgram';
import {
  decode,
  encode,
  Question,
  RECURSION_DESIRED,
  Answer,
  RecordType,
  RecordClass
} from 'dns-packet';

interface Resolution {
  resolve: (ans: Answer) => any;
  reject: (err: Error) => any;
  timeout: NodeJS.Timeout;
}
interface Dependencies {
  address: string;
  timeout?: number;
}
export function createUdpClient(deps: Dependencies) {
  const { address } = deps;
  const state = { id: 1 };
  const resolutions = new Map<number, Resolution>();
  const socket = createSocket('udp4');
  socket.on('message', msg => {
    const packet = decode(msg);
    if (resolutions.has(packet.id)) {
      const { resolve, timeout } = resolutions.get(packet.id);
      clearTimeout(timeout);
      resolutions.delete(packet.id);
      resolve(packet.answers[0]);
    }
  });
  process.on('exit', () => new Promise<void>(resolve => socket.close(resolve)));

  function close() {
    resolutions.forEach((res, id, map) => {
      clearTimeout(res.timeout);
      res.reject(new Error('client shutdown'));
      map.delete(id);
    });
    return new Promise<void>(resolve => socket.close(resolve));
  }

  function getId() {
    return state.id++;
  }

  function query(name: string, type: RecordType = 'A', cls: RecordClass = 'IN', id = getId()) {
    const { timeout = 1000 } = deps;
    return new Promise<Answer>((resolve, reject) => {
      resolutions.set(id, {
        resolve,
        reject,
        timeout: setTimeout(() => {
          resolutions.delete(id);
          reject(new Error('dns resolution query timedout!'));
        }, timeout)
      });
      const question = { name, type, class: cls } satisfies Question;
      const buf = encode({
        id,
        type: 'query',
        flags: RECURSION_DESIRED,
        questions: [question]
      });
      socket.send(buf, 0, buf.length, 53, address);
    });
  }

  return { address, close, query };
}
