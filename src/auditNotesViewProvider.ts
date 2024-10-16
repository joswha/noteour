import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getOutputPath } from './utils/fileUtils';

export class AuditNotesViewProvider implements vscode.TreeDataProvider<AuditNoteItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<AuditNoteItem | undefined | null | void> = new vscode.EventEmitter<AuditNoteItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<AuditNoteItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private progressItem: AuditNoteItem;
  private fileExtensionsItem: AuditNoteItem;
  private noteTypesItem: AuditNoteItem;

  constructor() {
    const outputPath = getOutputPath();
    const initialStatus = fs.existsSync(outputPath) ? 'Completed' : 'Idle';
    this.progressItem = new AuditNoteItem(`Progress: ${initialStatus}`, '', vscode.TreeItemCollapsibleState.None);
    
    const config = vscode.workspace.getConfiguration('auditNotes');
    const fileExtensions = config.get('fileExtensions', ['js', 'ts', 'jsx', 'tsx', 'sol']);
    this.fileExtensionsItem = new AuditNoteItem(`File Extensions: ${fileExtensions.join(', ')}`, 'extension.setFileExtensions', vscode.TreeItemCollapsibleState.None);
    
    const noteTypes = config.get('noteTypes', ['TODO', '@audit']);
    this.noteTypesItem = new AuditNoteItem(`Note Types: ${noteTypes.join(', ')}`, 'extension.setNoteTypes', vscode.TreeItemCollapsibleState.None);
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
      const collectIconPath = path.join(__filename, '..', '..', 'resources', 'collect.svg');
      const openIconPath = path.join(__filename, '..', '..', 'resources', 'open.svg');
      const clearIconPath = path.join(__filename, '..', '..', 'resources', 'clear.svg');
      
      return Promise.resolve([
        this.fileExtensionsItem,
        this.noteTypesItem,
        this.progressItem,
        new AuditNoteItem('Collect Notes', 'extension.collectNotes', vscode.TreeItemCollapsibleState.None, 'button', collectIconPath),
        new AuditNoteItem('Open Audit Notes', 'extension.openAuditNotes', vscode.TreeItemCollapsibleState.None, 'button', openIconPath),
        new AuditNoteItem('Clear Notes', 'extension.clearNotes', vscode.TreeItemCollapsibleState.None, 'button', clearIconPath)
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

  updateFileExtensions(extensions: string[]): void {
    this.fileExtensionsItem.label = `File Extensions: ${extensions.join(', ')}`;
    this.refresh();
  }

  updateNoteTypes(types: string[]): void {
    this.noteTypesItem.label = `Note Types: ${types.join(', ')}`;
    this.refresh();
  }
}

class AuditNoteItem extends vscode.TreeItem {
  constructor(
    public label: string,
    public readonly commandId: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly contextValue?: string,
    public readonly iconPath?: string | vscode.ThemeIcon
  ) {
    super(label, collapsibleState);
    if (commandId) {
      this.command = {
        command: this.commandId,
        title: this.label
      };
    }
    this.contextValue = contextValue;
    this.iconPath = iconPath;
  }
}
