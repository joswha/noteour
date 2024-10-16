import * as vscode from 'vscode';
import { collectNotes } from './commands/collectNotes';
import { openAuditNotes } from './commands/openAuditNotes';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "Collect Audit Notes" is being activated.');

    let collectNotesDisposable = vscode.commands.registerCommand('extension.collectNotes', () => collectNotes(context));
    let openAuditNotesDisposable = vscode.commands.registerCommand('extension.openAuditNotes', () => openAuditNotes(context));

    context.subscriptions.push(collectNotesDisposable, openAuditNotesDisposable);
}

export function deactivate() {
    console.log('Extension "Collect Audit Notes" has been deactivated.');
}
