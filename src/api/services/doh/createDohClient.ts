import { Question } from 'dns-packet';
import { Dependencies } from './types';
import { endpoints } from './consts';
import { getAnswer, getEncodedPacket } from './utils';

export function createDohClient(deps: Dependencies) {
  const { endpoint } = deps;
  const url = endpoints[endpoint];
  const method = 'POST';
  const headers = { accept: 'application/dns-message', 'content-type': 'application/dns-message' };

  const query = async (question: Question) => {
    const body = getEncodedPacket(question);
    const res = await fetch(url, { method, headers, body });
    if (res.ok) {
      const bytes = new Uint8Array(await res.arrayBuffer());
      const buffer = Buffer.from(bytes);
      return getAnswer(buffer);
    } else {
      console.warn(`[DoH] fetch error:`, res.status);
    }
    return null;
  };

  return { endpoint, url, headers, query };
}
