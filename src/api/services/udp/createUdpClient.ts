import { createSocket } from 'dgram';
import {
  BaseAnswer,
  decode,
  encode,
  Question,
  RECURSION_DESIRED,
  Answer,
  RecordType,
  RecordClass
} from 'dns-packet';

import { isIP } from 'validator';

interface Resolution {
  resolve: (ans: Answer) => any;
  reject: (err: Error) => any;
  timeout: NodeJS.Timeout;
  recursions: number;
  originalId: number;
}
interface Dependencies {
  address: string;
  timeout?: number;
}

const maxRecursionDepth = parseInt(process.env.MAX_RECURSION_DEPTH || '10', 10);
export function createUdpClient(deps: Dependencies) {
  const { address } = deps;
  const state = { id: 1 };
  const resolutions = new Map<number, Resolution>();
  const socket = createSocket('udp4');
  socket.on('message', msg => {
    const packet = decode(msg);
    if (resolutions.has(packet.id)) {
      const answer = packet.answers[0] as BaseAnswer<'A' | 'CNAME', string>;
      const res = resolutions.get(packet.id);

      if (answer?.type === 'CNAME' && res.recursions < maxRecursionDepth) {
        const originalId = res.originalId || packet.id;
        if (res.originalId) {
          // OCCURS when this is a recursive query
          clearTimeout(res.timeout);
          resolutions.delete(packet.id);
          res.resolve(answer);
        }
        query(answer.data, 'A', 'IN', getId(), res.recursions + 1, originalId);
      } else {
        clearTimeout(res.timeout);
        resolutions.delete(packet.id);
        res.resolve(answer);
        if (res.originalId && resolutions.has(res.originalId)) {
          const orig = resolutions.get(res.originalId);
          clearTimeout(orig.timeout);
          resolutions.delete(res.originalId);
          orig.resolve(answer);
        }
      }
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

  function query(
    name: string,
    type: RecordType = 'A',
    cls: RecordClass = 'IN',
    id = getId(),
    recursions = 0,
    originalId = null
  ) {
    const { timeout = 1000 } = deps;
    return new Promise<Answer>((resolve, reject) => {
      resolutions.set(id, {
        resolve,
        reject,
        recursions,
        originalId,
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
