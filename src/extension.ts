import * as vscode from 'vscode';
import * as fs from 'fs';
import { collectNotes } from './commands/collectNotes';
import { openAuditNotes } from './commands/openAuditNotes';
import { AuditNotesViewProvider, AuditNoteItem } from './auditNotesViewProvider';
import { getOutputPath } from './utils/fileUtils';

// Add this line to declare currentPanel
let currentPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "noteour" is being activated.');
    
    const auditNotesViewProvider = new AuditNotesViewProvider();
    vscode.window.registerTreeDataProvider('auditNotesView', auditNotesViewProvider);

    // Watch for settings changes
    vscode.workspace.onDidChangeConfiguration((event) => {
        if (
            event.affectsConfiguration('noteour.fileExtensions') ||
            event.affectsConfiguration('noteour.noteTypes')
        ) {
            collectNotes(context, auditNotesViewProvider, currentPanel);
        }
    });

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.collectNotes', async () => {
            currentPanel = await collectNotes(context, auditNotesViewProvider, currentPanel);
        }),
        vscode.commands.registerCommand('extension.openAuditNotes', async () => {
            currentPanel = await openAuditNotes(context, currentPanel);
        }),
        vscode.commands.registerCommand('extension.clearNotes', async () => {
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
                    if (currentPanel) {
                        currentPanel.dispose();
                        currentPanel = undefined;
                    }
                }
            } else {
                vscode.window.showInformationMessage('No audit notes file found.');
            }
        })
    );
}

export function deactivate() {
    console.log('Extension "Collect Audit Notes" has been deactivated.');
}
