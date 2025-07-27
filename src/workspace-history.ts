import { ModuleLogger } from "@sergei-dyshel/node/logging";
import { arrayRemove } from "@sergei-dyshel/typescript/array";
import {
  Commands,
  GenericQuickPick,
  getWindowTitle,
  getWorkspaceRoot,
  getWorkspaceRootName,
  Message,
  PersistentState,
  QuickPickButtons,
  RemoteEnv,
} from "@sergei-dyshel/vscode";
import { openFolder } from "@sergei-dyshel/vscode/builtin-commands";
import { listen } from "@sergei-dyshel/vscode/error-handling";
import { BuiltinIcon } from "@sergei-dyshel/vscode/icon";
import type { ExtensionContext } from "vscode";
import { workspace } from "vscode";

const logger = new ModuleLogger({ name: "workspace-history" });

interface HistoryEntry {
  /** Path to workspace file or single folder */
  root: string;

  /** Custom title if present in `workspace.title` */
  title?: string;

  /** Remove environment in which workspace is opened */
  remote?: RemoteEnv;
}

const persistentState = new PersistentState<HistoryEntry[]>(
  "workspaceHistory.v2",
  [],
);

const WINDOW_TITLE = "window.title";

const WORKSPACE_FILE_EXTENSION = ".code-workspace";

/** History with given entry, ignores title when comparing */
function filterOutEntry(history: HistoryEntry[], entry?: HistoryEntry) {
  if (!entry) return [...history];
  return history.filter(
    (otherEntry) =>
      otherEntry.root !== entry.root ||
      !RemoteEnv.equal(otherEntry.remote, entry.remote),
  );
}

/** History entry for current workspace/folder, or `undefined` for untitled */
function getCurrentEntry(): HistoryEntry | undefined {
  const root = getWorkspaceRoot();
  if (!root) return undefined;
  return {
    root,
    remote: RemoteEnv.current(),
    title: getWindowTitle(),
  };
}

async function openFromHistory(newWindow: boolean) {
  const history = persistentState.get();
  const removedItems: HistoryEntry[] = [];
  const filteredHistory = filterOutEntry(history, getCurrentEntry());

  const qp = new GenericQuickPick<HistoryEntry>((entry) => ({
    iconPath: (entry.root.endsWith(WORKSPACE_FILE_EXTENSION)
      ? BuiltinIcon.FOLDER_LIBRARY
      : BuiltinIcon.FOLDER
    ).themeIcon,
    label:
      (entry.title ?? getWorkspaceRootName(entry.root)) +
      (entry.remote ? ` (${entry.remote.name})` : ""),
    description: entry.root,
  }));
  qp.options.placeholder = newWindow
    ? "Open in NEW window"
    : "Open in SAME window";
  qp.addCommonItemButton(QuickPickButtons.REMOVE, (entry) => {
    logger.debug(`Removing ${entry.root} from folders/workspaces history`);
    arrayRemove(filteredHistory, entry);
    arrayRemove(history, entry);
    removedItems.push(entry);
    qp.items = filteredHistory;
  });
  qp.items = filteredHistory;

  const entry = await qp.select();
  if (removedItems.length !== 0) {
    const ok = await Message.askModal(
      "warn",
      `Do you really want to remove ${removedItems.length} items from history}`,
      "Yes",
    );
    if (ok) {
      await persistentState.update(history);
    }
  }

  if (entry) {
    const remote = entry.remote;
    await (remote
      ? openFolder(RemoteEnv.toRemoteUri(entry.root, remote), newWindow)
      : openFolder(entry.root, {
          forceNewWindow: newWindow,
          forceLocalWindow: true,
        }));
  }
}

async function updateHistory() {
  const curEntry = getCurrentEntry();
  if (!curEntry) return;

  logger.info("Pushing item to top of workspace history", curEntry);
  const history = filterOutEntry(persistentState.get(), curEntry);
  history.unshift(curEntry);
  await persistentState.update(history);
}

export async function activate(context: ExtensionContext) {
  context.subscriptions.push(
    listen(workspace.onDidChangeConfiguration, async (event) => {
      if (event.affectsConfiguration(WINDOW_TITLE)) {
        logger.info("Window title updated");
        await updateHistory();
      }
    }),
  );

  await updateHistory();
}

class WorkspaceHistoryCommands extends Commands.Basic {
  @Commands.Basic.command({
    command: "qcfg.openRecent.sameWindow",
    title: "qcfg: Open recent workspace (SAME window)",
  })
  openSameWindow() {
    return openFromHistory(false /* newWindow */);
  }

  @Commands.Basic.command({
    command: "qcfg.openRecent.newWindow",
    title: "qcfg: Open recent workspace (NEW window)",
  })
  openWindow() {
    return openFromHistory(true /* newWindow */);
  }
}

new WorkspaceHistoryCommands();
