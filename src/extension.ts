import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import { getProvider, getExtensionConfig } from "./lib/extensionConfig";
import { buildCommitPrompt } from "./lib/prompt";
import { CommitAIPanel } from "./webview/CommitAIPanel";

const execAsync = promisify(exec);

async function getStagedDiff(workspacePath: string): Promise<string> {
  try {
    const { stdout } = await execAsync("git diff --staged", {
      cwd: workspacePath,
    });

    if (!stdout.trim()) {
      throw new Error(
        "No staged changes found. Stage your changes first with git add."
      );
    }

    return stdout;
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes("not a git repository")) {
        throw new Error("This folder is not a git repository.");
      }
      throw err;
    }
    throw err;
  }
}

async function runCommit(
  workspacePath: string,
  message: string
): Promise<void> {
  await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
    cwd: workspacePath,
  });
}

async function setScmInput(message: string): Promise<void> {
  const gitExtension = vscode.extensions.getExtension("vscode.git");
  if (gitExtension) {
    const git = gitExtension.exports.getAPI(1);
    const repo = git.repositories[0];
    if (repo) {
      repo.inputBox.value = message;
      await vscode.commands.executeCommand("workbench.view.scm");
    }
  }
}

// QuickPick fallback
async function quickPickFallback(
  workspacePath: string
): Promise<void> {
  const { count } = getExtensionConfig();

  const messages = await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Commit AI: Generating messages...",
      cancellable: false,
    },
    async () => {
      const diff = await getStagedDiff(workspacePath);
      const provider = getProvider();
      return provider.generateMessages(buildCommitPrompt(diff, count));
    }
  );

  const REROLL = "$(refresh)  Re-roll suggestions";
  const selected = await vscode.window.showQuickPick([...messages, REROLL], {
    placeHolder: "Select a commit message",
    title: "Commit AI — Generated Messages",
  });

  if (!selected) return;
  if (selected === REROLL) {
    await quickPickFallback(workspacePath);
    return;
  }

  const action = await vscode.window.showQuickPick(
    ["Set as commit message", "Commit directly", "Copy to clipboard"],
    { placeHolder: "What do you want to do?", title: `"${selected}"` }
  );

  if (!action) return;

  if (action === "Set as commit message") {
    await setScmInput(selected);
    vscode.window.showInformationMessage("Commit message set in Source Control.");
  } else if (action === "Commit directly") {
    await runCommit(workspacePath, selected);
    vscode.window.showInformationMessage(`Committed: "${selected}"`);
  } else {
    await vscode.env.clipboard.writeText(selected);
    vscode.window.showInformationMessage(`Copied to clipboard: "${selected}"`);
  }
}

// Webview flow
async function webviewFlow(
  workspacePath: string,
  context: vscode.ExtensionContext
): Promise<void> {
  const panel = CommitAIPanel.createOrShow(context);

  // Send history on open
  panel.sendHistory(panel.getHistory());

  // Handle messages from webview
  panel.onMessage(async (msg) => {
    switch (msg.command) {
      case "generate": {
        panel.sendLoading(true);
        try {
          const { count } = getExtensionConfig();
          const diff = await getStagedDiff(workspacePath);
          const provider = getProvider();
          const messages = await provider.generateMessages(
            buildCommitPrompt(diff, count)
          );
          panel.sendMessages(messages);
          panel.addHistory(messages);
        } catch (err) {
          panel.sendError(
            err instanceof Error ? err.message : String(err)
          );
        }
        break;
      }
      case "setScm": {
        await setScmInput(msg.message);
        vscode.window.showInformationMessage(
          "Commit message set in Source Control."
        );
        break;
      }
      case "commit": {
        try {
          await runCommit(workspacePath, msg.message);
          vscode.window.showInformationMessage(
            `Committed: "${msg.message}"`
          );
        } catch (err) {
          vscode.window.showErrorMessage(
            `Commit AI: ${err instanceof Error ? err.message : String(err)}`
          );
        }
        break;
      }
      case "copy": {
        await vscode.env.clipboard.writeText(msg.message);
        vscode.window.showInformationMessage(
          `Copied to clipboard: "${msg.message}"`
        );
        break;
      }
      case "clearHistory": {
        panel.clearHistory();
        break;
      }
    }
  });
}

export function activate(context: vscode.ExtensionContext) {
  console.log("Commit AI extension activated.");

  const disposable = vscode.commands.registerCommand(
    "commit-ai.generate",
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage("Commit AI: No workspace folder open.");
        return;
      }

      const workspacePath = workspaceFolders[0]!.uri.fsPath;

      try {
        await webviewFlow(workspacePath, context);
      } catch (err) {
        // Fall back to QuickPick if webview fails
        vscode.window.showWarningMessage(
          "Commit AI: Webview failed, falling back to QuickPick."
        );
        try {
          await quickPickFallback(workspacePath);
        } catch (fallbackErr) {
          vscode.window.showErrorMessage(
            `Commit AI: ${fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)}`
          );
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}