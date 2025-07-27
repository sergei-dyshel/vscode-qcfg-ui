import {
  Commands,
  ExtensionContext,
  ExtensionUpdateChecker,
  ProposedApi,
} from "@sergei-dyshel/vscode";
import { window } from "vscode";
import { logger, setupLogging } from "./logging";
import { activate as activeWorkspaceHistory } from "./workspace-history";

export async function activate(context: ExtensionContext) {
  setupLogging();
  ExtensionContext.set(context);
  await detectProposedApiAllowlist();

  logger.info("Extension activating");
  await activeWorkspaceHistory(context);
  Commands.register();

  if (!ExtensionContext.inDevelopmentMode())
    await ExtensionUpdateChecker.register();
}

async function detectProposedApiAllowlist() {
  const disposable = await ProposedApi.detectAllowlist(() =>
    window.registerQuickDiffProvider("a", {}, "a", "b"),
  );
  if (disposable) disposable.dispose();
}
