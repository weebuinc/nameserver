export namespace Database {
  export type TableKey = 'prompts' | 'records' | 'servers' | 'versions';
  export namespace Constants {
    export const tables: Array<TableKey> = ['prompts', 'records', 'servers', 'versions'];
  }
  export namespace Table {
    export interface NameServer {
      address: string;
      priority: number;
    }
    export interface Prompt {
      key: string;
      data: string;
    }
    export type RecordType = 'A' | 'AAAA';
    export interface Record {
      address: string;
      name: string;
      type: RecordType;
    }
    export interface Version {
      tag: string;
      description: string;
      script: string;
    }
  }
}
