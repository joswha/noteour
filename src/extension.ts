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
    let setFileExtensionsDisposable = vscode.commands.registerCommand('extension.setFileExtensions', async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'Enter file extensions to scan (comma-separated)',
            placeHolder: 'js,ts,jsx,tsx,sol'
        });

        if (input) {
            const extensions = input.split(',').map(ext => ext.trim());
            const config = vscode.workspace.getConfiguration('auditNotes');
            await config.update('fileExtensions', extensions, vscode.ConfigurationTarget.Global);
            auditNotesViewProvider.updateFileExtensions(extensions);
        }
    });

    context.subscriptions.push(collectNotesDisposable, openAuditNotesDisposable, setFileExtensionsDisposable);
}

export function deactivate() {
    console.log('Extension "Collect Audit Notes" has been deactivated.');
}
