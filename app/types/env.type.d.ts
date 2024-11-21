declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    CONTABILIUM_USER: string;
    CONTABILIUM_PASSWORD: string;
  }
}
