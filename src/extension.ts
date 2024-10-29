import * as vscode from 'vscode';
import * as fs from 'fs';
import { collectNotes } from './commands/collectNotes';
import { openAuditNotes } from './commands/openAuditNotes';
import { AuditNotesViewProvider, AuditNoteItem } from './auditNotesViewProvider';
import { getOutputPath } from './utils/fileUtils';

// Add this line to declare currentPanel
let currentPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "Collect Audit Notes" is being activated.');

    const auditNotesViewProvider = new AuditNotesViewProvider();
    vscode.window.registerTreeDataProvider('auditNotesView', auditNotesViewProvider);

    let collectNotesDisposable = vscode.commands.registerCommand('extension.collectNotes', async () => {
        currentPanel = await collectNotes(context, auditNotesViewProvider, currentPanel);
    });

    let openAuditNotesDisposable = vscode.commands.registerCommand('extension.openAuditNotes', async () => {
        currentPanel = await openAuditNotes(context, currentPanel);
    });

    let setFileExtensionsDisposable = vscode.commands.registerCommand('extension.setFileExtensions', async () => {
        const config = vscode.workspace.getConfiguration('auditNotes');
        const currentExtensions = config.get('fileExtensions', []);
        const input = await vscode.window.showInputBox({
            prompt: 'Enter file extensions to scan (comma-separated)',
            placeHolder: 'js,ts,jsx,tsx,sol',
            value: currentExtensions.join(',')
        });

        if (input !== undefined) {
            const extensions = input.split(',').map(ext => ext.trim()).filter(ext => ext !== '');
            await config.update('fileExtensions', extensions, vscode.ConfigurationTarget.Global);
            auditNotesViewProvider.updateFileExtensions(extensions);
            vscode.window.showInformationMessage(`File extensions updated to: ${extensions.join(', ')}`);
        }
    });

    let setNoteTypesDisposable = vscode.commands.registerCommand('extension.setNoteTypes', async () => {
        const config = vscode.workspace.getConfiguration('auditNotes');
        const currentTypes = config.get('noteTypes', []);
        const input = await vscode.window.showInputBox({
            prompt: 'Enter note types to search for (comma-separated)',
            placeHolder: 'TODO,@audit',
            value: currentTypes.join(',')
        });

        if (input !== undefined) {
            const types = input.split(',').map(type => type.trim()).filter(type => type !== '');
            await config.update('noteTypes', types, vscode.ConfigurationTarget.Global);
            auditNotesViewProvider.updateNoteTypes(types);
            vscode.window.showInformationMessage(`Note types updated to: ${types.join(', ')}`);
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
                auditNotesViewProvider.resetStatus();
                
                // Close the existing webview if it's open
                if (currentPanel) {
                    currentPanel.dispose();
                    currentPanel = undefined;
                }
            }
        } else {
            vscode.window.showInformationMessage('No audit notes file found.');
        }
    });

    context.subscriptions.push(
        vscode.commands.registerCommand('auditNotes.editValue', async (item: AuditNoteItem) => {
            const newValue = await vscode.window.showInputBox({
                prompt: `Edit ${item.label}`,
                value: item.value
            });

            if (newValue !== undefined) {
                const config = vscode.workspace.getConfiguration('auditNotes');
                const newArray = newValue.split(',').map(v => v.trim()).filter(v => v !== '');

                if (item.label === 'File Extensions') {
                    await config.update('fileExtensions', newArray, vscode.ConfigurationTarget.Global);
                    auditNotesViewProvider.updateFileExtensions(newArray);
                } else if (item.label === 'Note Types') {
                    await config.update('noteTypes', newArray, vscode.ConfigurationTarget.Global);
                    auditNotesViewProvider.updateNoteTypes(newArray);
                }
            }
        })
    );

    context.subscriptions.push(
        collectNotesDisposable,
        openAuditNotesDisposable,
        setFileExtensionsDisposable,
        setNoteTypesDisposable,
        clearNotesDisposable
    );
}

export function deactivate() {
    console.log('Extension "Collect Audit Notes" has been deactivated.');
}
