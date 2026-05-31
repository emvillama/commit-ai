import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export interface HistoryEntry {
  timestamp: string;
  messages: string[];
}

export type WebviewMessage =
  | { command: "generate" }
  | { command: "commit"; message: string }
  | { command: "setScm"; message: string }
  | { command: "copy"; message: string }
  | { command: "clearHistory" };

export class CommitAIPanel {
  private static instance: CommitAIPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly context: vscode.ExtensionContext;
  private onMessageCallback: ((msg: WebviewMessage) => void) | undefined;

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext
  ) {
    this.panel = panel;
    this.context = context;

    this.panel.webview.onDidReceiveMessage((msg: WebviewMessage) => {
      this.onMessageCallback?.(msg);
    });

    this.panel.onDidDispose(() => {
      CommitAIPanel.instance = undefined;
    });

    this.panel.webview.html = this.getHtml();
  }

  static createOrShow(context: vscode.ExtensionContext): CommitAIPanel {
    if (CommitAIPanel.instance) {
      CommitAIPanel.instance.panel.reveal(vscode.ViewColumn.Beside);
      return CommitAIPanel.instance;
    }

    const panel = vscode.window.createWebviewPanel(
      "commitAI",
      "Commit AI",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    CommitAIPanel.instance = new CommitAIPanel(panel, context);
    return CommitAIPanel.instance;
  }

  onMessage(callback: (msg: WebviewMessage) => void) {
    this.onMessageCallback = callback;
  }

  sendMessages(messages: string[]) {
    void this.panel.webview.postMessage({ command: "setMessages", messages });
  }

  sendError(error: string) {
    void this.panel.webview.postMessage({ command: "setError", error });
  }

  sendLoading(loading: boolean) {
    void this.panel.webview.postMessage({ command: "setLoading", loading });
  }

  sendHistory(history: HistoryEntry[]) {
    void this.panel.webview.postMessage({ command: "setHistory", history });
  }

  // History helpers using globalState
  getHistory(): HistoryEntry[] {
    return this.context.globalState.get<HistoryEntry[]>("commitAI.history", []);
  }

  addHistory(messages: string[]) {
    const history = this.getHistory();
    history.unshift({ timestamp: new Date().toISOString(), messages });
    // Keep last 20 entries
    const trimmed = history.slice(0, 20);
    void this.context.globalState.update("commitAI.history", trimmed);
    this.sendHistory(trimmed);
  }

  clearHistory() {
    void this.context.globalState.update("commitAI.history", []);
    this.sendHistory([]);
  }

  private getHtml(): string {
    const htmlPath = path.join(
      this.context.extensionPath,
      "src",
      "webview",
      "panel.html"
    );
    return fs.readFileSync(htmlPath, "utf-8");
  }
}