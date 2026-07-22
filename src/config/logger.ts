import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

const loggerOptions = isProd
  ? {
      level: "info",
    }
  : {
      level: "debug",
      transport: {
        target: "pino-pretty",
        options: { colorize: true },
      },
    };

export const logger = pino(loggerOptions);
