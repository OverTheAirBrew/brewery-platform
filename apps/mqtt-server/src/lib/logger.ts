'use strict';

import pino from 'pino';
import pretty from 'pino-pretty';

const prettyOptions = {
  levelFirst: true, // show level
  ignore: 'pid,hostname,name', // params to ignore in the output
  translateTime: true, // show time string instead of timestamp
};

export const initLogger = (options: { level?: string; pretty?: boolean }) => {
  return pino(
    {
      name: 'aedes',
      level: options.level || 'warn',
    },
    pretty(prettyOptions),
  );
};
