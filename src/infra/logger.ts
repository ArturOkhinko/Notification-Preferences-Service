type LogFields = Record<string, unknown>;

const write = (level: string, event: string, fields: LogFields): void => {
  console.log(
    JSON.stringify({
      level,
      event,
      timestamp: new Date().toISOString(),
      ...fields,
    }),
  );
};

export const logger = {
  info: (event: string, fields: LogFields = {}): void =>
    write('info', event, fields),
  error: (event: string, fields: LogFields = {}): void =>
    write('error', event, fields),
};
