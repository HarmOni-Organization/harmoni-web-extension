const PREFIX = '[HarmOni Web Extension]';

export const logger = {
  log: (message: string, ...args: any[]) => {
    console.log(`${PREFIX} ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`${PREFIX} ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`${PREFIX} ${message}`, ...args);
  },
  info: (message: string, ...args: any[]) => {
    console.info(`${PREFIX} ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    console.debug(`${PREFIX} ${message}`, ...args);
  },
};
