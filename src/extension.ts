import * as vscode from "vscode";
import { getProvider, getExtensionConfig } from "./lib/extensionConfig";
import { buildCommitPrompt } from "./lib/prompt";

async function getStagedDiff(): Promise<string> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    throw new Error("No workspace folder open.");
  }

  const workspacePath = workspaceFolders[0]!.uri.fsPath;

  // Use VS Code's built-in terminal API to run git diff --staged
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);

  const { stdout } = await execAsync("git diff --staged", {
    cwd: workspacePath,
  });

  if (!stdout.trim()) {
    throw new Error(
      "No staged changes found. Stage your changes first with git add."
    );
  }

  return stdout;
}

export function activate(context: vscode.ExtensionContext) {
  console.log("Commit AI extension activated.");

  const disposable = vscode.commands.registerCommand(
    "commit-ai.generate",
    async () => {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Commit AI",
          cancellable: false,
        },
        async (progress) => {
          try {
            progress.report({ message: "Reading staged changes..." });
            const diff = await getStagedDiff();

            progress.report({ message: "Generating commit messages..." });
            const { count } = getExtensionConfig();
            const provider = getProvider();
            const messages = await provider.generateMessages(
              buildCommitPrompt(diff, count)
            );

            // Phase 1: show results as quick pick items
            const selected = await vscode.window.showQuickPick(messages, {
              placeHolder: "Select a commit message",
              title: "Commit AI — Generated Messages",
            });

            if (!selected) {
              return;
            }

            // Copy to clipboard
            await vscode.env.clipboard.writeText(selected);
            vscode.window.showInformationMessage(
              `Copied to clipboard: "${selected}"`
            );
          } catch (err) {
            vscode.window.showErrorMessage(
              `Commit AI: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        }
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}