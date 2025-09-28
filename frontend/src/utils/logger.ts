interface Logger {
  error: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

const createBrowserLogger = (): Logger => {
  const isDevelopment = import.meta.env.MODE !== 'production';

  return {
    error: (message: string, ...args: any[]) => {
      console.error(`[ERROR] ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      if (isDevelopment) {
        console.warn(`[WARN] ${message}`, ...args);
      }
    },
    info: (message: string, ...args: any[]) => {
      if (isDevelopment) {
        console.info(`[INFO] ${message}`, ...args);
      }
    },
    debug: (message: string, ...args: any[]) => {
      if (isDevelopment) {
        console.debug(`[DEBUG] ${message}`, ...args);
      }
    },
  };
};

export const logger = createBrowserLogger();
