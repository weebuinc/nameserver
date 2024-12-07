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

interface Recursion {
  id: number;
  answer: BaseAnswer<'A' | 'CNAME', string>;
  count: number;
  timeout: NodeJS.Timeout;
  resolve: (ans: Answer) => any;
}
interface Resolution {
  resolve: (ans: Answer) => any;
  reject: (err: Error) => any;
  timeout: NodeJS.Timeout;
  recursion: Recursion;
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

      if (
        answer?.type === 'CNAME' &&
        (res.recursion ? res.recursion.count < maxRecursionDepth : true)
      ) {
        // NOTE: add a recursion if missing, signifying this is the first recurssion
        const recursion: Recursion =
          res.recursion ||
          ({
            id: packet.id,
            answer,
            count: 0,
            timeout: res.timeout,
            resolve: res.resolve
          } satisfies Recursion);
        if (res.recursion) {
          // NOTE: occurs when this is a recursive query
          clearTimeout(res.timeout);
          resolutions.delete(packet.id);
          res.resolve(answer);
        }
        recursion.count++;
        query(answer.data, 'A', 'IN', getId(), recursion);
      } else {
        clearTimeout(res.timeout);
        resolutions.delete(packet.id);
        res.resolve(answer);
        const { recursion } = res;
        if (recursion) {
          clearTimeout(recursion.id);

          // NOTE: ensure that original answer type is an A record
          recursion.answer.type = 'A';
          // NOTE: replace the original data (which is a domain string) with the latest answer which is a resolved IP address
          recursion.answer.data = answer.data;

          resolutions.delete(recursion.id);

          // NOTE: return the modified original answer to the async call
          recursion.resolve(recursion.answer);
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
    recursion = null
  ) {
    const { timeout = 1000 } = deps;
    return new Promise<Answer>((resolve, reject) => {
      resolutions.set(id, {
        resolve,
        reject,
        recursion,
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
