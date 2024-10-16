import * as vscode from 'vscode';
import { collectNotes } from './commands/collectNotes';
import { openAuditNotes } from './commands/openAuditNotes';
import { AuditNotesViewProvider } from './auditNotesViewProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "Collect Audit Notes" is being activated.');

    const auditNotesViewProvider = new AuditNotesViewProvider();
    vscode.window.registerTreeDataProvider('auditNotesView', auditNotesViewProvider);

    let collectNotesDisposable = vscode.commands.registerCommand('extension.collectNotes', () => collectNotes(context, auditNotesViewProvider));
    let openAuditNotesDisposable = vscode.commands.registerCommand('extension.openAuditNotes', () => openAuditNotes(context));

    context.subscriptions.push(collectNotesDisposable, openAuditNotesDisposable);
}

export function deactivate() {
    console.log('Extension "Collect Audit Notes" has been deactivated.');
}
