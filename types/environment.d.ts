declare module 'process' {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        DATABASE_PATH: string;
        NETWORK_IFACE: string;
        BIND_HOST: string;
        BIND_PORT: string;
        SSL_ENABLED: string;
        SSL_CA: string;
        SSL_CERT: string;
        SSL_KEY: string;
      }
    }
  }
}
