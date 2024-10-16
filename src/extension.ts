import * as vscode from 'vscode';
import * as fs from 'fs';
import { collectNotes } from './commands/collectNotes';
import { openAuditNotes } from './commands/openAuditNotes';
import { AuditNotesViewProvider } from './auditNotesViewProvider';
import { getOutputPath } from './utils/fileUtils';

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

    let setNoteTypesDisposable = vscode.commands.registerCommand('extension.setNoteTypes', async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'Enter note types to search for (comma-separated)',
            placeHolder: 'TODO,@audit'
        });

        if (input) {
            const types = input.split(',').map(type => type.trim());
            const config = vscode.workspace.getConfiguration('auditNotes');
            await config.update('noteTypes', types, vscode.ConfigurationTarget.Global);
            auditNotesViewProvider.updateNoteTypes(types);
        }
    });

    let clearNotesDisposable = vscode.commands.registerCommand('extension.clearNotes', async () => {
        const outputPath = getOutputPath();
        if (fs.existsSync(outputPath)) {
            const answer = await vscode.window.showWarningMessage(
                'Are you sure you want to delete all collected notes?',
                'Yes', 'No'
            );
            if (answer === 'Yes') {
                fs.unlinkSync(outputPath);
                vscode.window.showInformationMessage('Audit notes have been cleared.');
                auditNotesViewProvider.resetProgress();
            }
        } else {
            vscode.window.showInformationMessage('No audit notes file found.');
        }
    });

    context.subscriptions.push(collectNotesDisposable, openAuditNotesDisposable, setFileExtensionsDisposable, setNoteTypesDisposable, clearNotesDisposable);
}

export function deactivate() {
    console.log('Extension "Collect Audit Notes" has been deactivated.');
}
