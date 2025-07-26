import { ExtensionContext } from "@sergei-dyshel/vscode";
import { logger, setupLogging } from "./logging";

export function activate(context: ExtensionContext) {
  setupLogging();
  ExtensionContext.set(context);
  logger.info("Extension activating");
}
