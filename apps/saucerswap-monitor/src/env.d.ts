declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SSM_API_URL?: string;
    }
  }
}

export {};
