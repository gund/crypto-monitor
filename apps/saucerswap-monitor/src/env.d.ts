declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SSM_API_URL?: string;
      SSM_API_HEADERS?: string;
    }
  }
}

export {};
