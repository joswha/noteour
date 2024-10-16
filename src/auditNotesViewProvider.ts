import * as vscode from 'vscode';
import * as fs from 'fs';
import { getOutputPath } from './utils/fileUtils';

export class AuditNotesViewProvider implements vscode.TreeDataProvider<AuditNoteItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<AuditNoteItem | undefined | null | void> = new vscode.EventEmitter<AuditNoteItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<AuditNoteItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private progressItem: AuditNoteItem | undefined;

  constructor() {
    const outputPath = getOutputPath();
    const initialStatus = fs.existsSync(outputPath) ? 'Completed' : 'Idle';
    this.progressItem = new AuditNoteItem(`Progress: ${initialStatus}`, '', vscode.TreeItemCollapsibleState.None);
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: AuditNoteItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: AuditNoteItem): Thenable<AuditNoteItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      return Promise.resolve([
        this.progressItem!,
        new AuditNoteItem('Collect Notes', 'extension.collectNotes', vscode.TreeItemCollapsibleState.None),
        new AuditNoteItem('Open Audit Notes', 'extension.openAuditNotes', vscode.TreeItemCollapsibleState.None)
      ]);
    }
  }

  updateProgress(progress: number, total: number): void {
    this.progressItem!.label = `Progress: ${progress}/${total} files scanned`;
    this.refresh();
  }

  setCompleted(): void {
    this.progressItem!.label = 'Progress: Completed';
    this.refresh();
  }

  resetProgress(): void {
    this.progressItem!.label = 'Progress: Idle';
    this.refresh();
  }
}

class AuditNoteItem extends vscode.TreeItem {
  constructor(
    public label: string,
    public readonly commandId: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    if (commandId) {
      this.command = {
        command: this.commandId,
        title: this.label
      };
    }
  }
}
