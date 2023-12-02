import { Answer } from 'dns-packet';
import { recordRepo } from 'api/repos';
export function createNameService() {
  function query(name: string): Answer {
    const record = recordRepo.getByNameAndType(name, 'A');
    if (record) {
      return {
        name,
        type: 'A',
        ttl: 3600,
        class: 'IN',
        flush: false,
        data: record.address
      } satisfies Answer;
    }
  }

  return { query };
}
