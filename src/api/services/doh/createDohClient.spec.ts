import dns from 'dns/promises';
import { Answer, BaseAnswer } from 'dns-packet';

import { Endpoint } from './types';
import { createDohClient } from './createDohClient';

interface Test {
  domain: string;
  endpoint: Endpoint;
}
describe(`createDohClient unit tests`, () => {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  const domains = ['amazon.com', 'apple.com', 'yahoo.com'];
  const endpoints: Array<Endpoint> = ['cloudflare', 'google'];
  const tests: Array<Test> = [];

  for (const endpoint of endpoints) {
    for (const domain of domains) {
      tests.push({ domain, endpoint });
    }
  }

  async function checkAnswer(ans: Answer): Promise<void>;
  async function checkAnswer(ans: BaseAnswer<any, string>) {
    expect(ans).toBeTruthy();
    const addresses = await dns.resolve4(ans.name);
    expect(addresses).toContain(ans.data);
  }

  it.each(tests)(`query $domain with $endpoint`, async ({ domain, endpoint }) => {
    const doh = createDohClient({ endpoint });
    const ans = await doh.query({ name: domain, class: 'IN', type: 'A' });
    await checkAnswer(ans);
  });
});
