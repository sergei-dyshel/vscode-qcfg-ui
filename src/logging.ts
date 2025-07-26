import { AnsiColor } from "@sergei-dyshel/node/ansi-color";
import {
  ConsoleAppender,
  LogFormat,
  RootLogger,
  configureLogging,
} from "@sergei-dyshel/node/logging";

export const logger = RootLogger.get();

export function setupLogging() {
  configureLogging({
    handler: {
      formatter: {
        template: [
          AnsiColor.blue("qcfg-ui"),
          LogFormat.level,
          LogFormat.instance,
          LogFormat.message,
        ],
        format: {
          level: {
            warning: { colorizeLevel: AnsiColor.yellow },
            error: { colorizeLevel: AnsiColor.red },
          },
        },
      },
      // overriding console.stdout to stderr causes all messages to appear red
      // in DevTools
      appenders: [new ConsoleAppender({ default: true })],
    },
  });
}
