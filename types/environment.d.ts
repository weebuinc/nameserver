declare module 'process' {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        DATABASE_PATH: string;
        NETWORK_IFACE: string;
      }
    }
  }
}
