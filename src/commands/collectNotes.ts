import * as vscode from 'vscode';
import { scanWorkspaceForNotes, getOutputPath } from '../utils/fileUtils';
import { saveNotesToFile } from '../utils/noteUtils';
import { showNotesInWebview } from '../webview/webviewProvider';
import { handleError } from '../utils/errorUtils';
import { AuditNotesViewProvider } from '../auditNotesViewProvider';

export async function collectNotes(context: vscode.ExtensionContext, auditNotesViewProvider: AuditNotesViewProvider, currentPanel: vscode.WebviewPanel | undefined): Promise<vscode.WebviewPanel | undefined> {
    const outputPath = getOutputPath();
    
    try {
        auditNotesViewProvider.resetStatus();
        const notesByFile = await scanWorkspaceForNotes((status, total) => {
            auditNotesViewProvider.updateStatus(status, total);
        });

        const notesFound = Object.keys(notesByFile).length > 0;

        if (notesFound) {
            await saveNotesToFile(notesByFile);
            currentPanel = await showNotesInWebview(context, notesByFile, outputPath, currentPanel);
        }

        auditNotesViewProvider.setCompleted(notesFound);

        if (notesFound) {
            vscode.window.showInformationMessage('Notes collection completed.');
        } else {
            vscode.window.showInformationMessage('No notes found in the workspace.');
        }

        return currentPanel;
    } catch (error) {
        handleError('Error collecting notes', error);
        auditNotesViewProvider.resetStatus();
        return undefined;
    }
}
