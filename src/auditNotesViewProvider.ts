import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getOutputPath } from './utils/fileUtils';

export class AuditNoteItem extends vscode.TreeItem {
  constructor(
    public label: string,
    public value: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly contextValue?: string
  ) {
    super(label, collapsibleState);
    this.description = value;
    this.contextValue = contextValue;
    if (contextValue === 'editable') {
      this.command = {
        command: 'auditNotes.editValue',
        title: 'Edit',
        arguments: [this]
      };
    } else if (contextValue === 'button') {
      this.command = {
        command: this.getCommandForLabel(label),
        title: label
      };
    }
  }

  private getCommandForLabel(label: string): string {
    switch (label) {
      case 'Collect Notes':
        return 'extension.collectNotes';
      case 'Open Audit Notes':
        return 'extension.openAuditNotes';
      case 'Clear Notes':
        return 'extension.clearNotes';
      default:
        return '';
    }
  }
}

export class AuditNotesViewProvider implements vscode.TreeDataProvider<AuditNoteItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<AuditNoteItem | undefined | null | void> = new vscode.EventEmitter<AuditNoteItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<AuditNoteItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private fileExtensionsItem: AuditNoteItem;
  private noteTypesItem: AuditNoteItem;
  private statusItem: AuditNoteItem;

  constructor() {
    const outputPath = getOutputPath();
    const initialStatus = fs.existsSync(outputPath) ? 'Completed' : 'Not Started';
    this.statusItem = new AuditNoteItem(`Status: ${initialStatus}`, '', vscode.TreeItemCollapsibleState.None);
    
    const config = vscode.workspace.getConfiguration('auditNotes');
    const fileExtensions = config.get('fileExtensions', ['js', 'ts', 'jsx', 'tsx', 'sol']);
    this.fileExtensionsItem = new AuditNoteItem('File Extensions', fileExtensions.join(', '), vscode.TreeItemCollapsibleState.None, 'editable');
    
    const noteTypes = config.get('noteTypes', ['TODO', '@audit']);
    this.noteTypesItem = new AuditNoteItem('Note Types', noteTypes.join(', '), vscode.TreeItemCollapsibleState.None, 'editable');
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
        this.fileExtensionsItem,
        this.noteTypesItem,
        this.statusItem,
        new AuditNoteItem('Collect Notes', '', vscode.TreeItemCollapsibleState.None, 'button'),
        new AuditNoteItem('Open Audit Notes', '', vscode.TreeItemCollapsibleState.None, 'button'),
        new AuditNoteItem('Clear Notes', '', vscode.TreeItemCollapsibleState.None, 'button')
      ]);
    }
  }

  updateStatus(status: number, total: number): void {
    this.statusItem.label = `Status: ${status}/${total} files scanned`;
    this.refresh();
  }

  setCompleted(notesFound: boolean): void {
    if (notesFound) {
      this.statusItem.label = 'Status: Completed';
    } else {
      this.statusItem.label = 'Status: No notes found';
    }
    this.refresh();
  }

  resetStatus(): void {
    this.statusItem.label = 'Status: Not Started';
    this.refresh();
  }

  updateFileExtensions(extensions: string[]): void {
    this.fileExtensionsItem.value = extensions.join(', ');
    this.fileExtensionsItem.description = extensions.join(', ');
    this.refresh();
    vscode.commands.executeCommand('extension.collectNotes');
  }

  updateNoteTypes(types: string[]): void {
    this.noteTypesItem.value = types.join(', ');
    this.noteTypesItem.description = types.join(', ');
    this.refresh();
    vscode.commands.executeCommand('extension.collectNotes');
  }
}
