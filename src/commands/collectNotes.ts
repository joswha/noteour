import * as vscode from 'vscode';
import * as fs from 'fs';
import { scanWorkspaceForNotes, getOutputPath } from '../utils/fileUtils';
import { saveNotesToFile, loadNotesFromFile, mergeNotes } from '../utils/noteUtils';
import { showNotesInWebview } from '../webview/webviewProvider';
import { handleError } from '../utils/errorUtils';
import { AuditNotesViewProvider } from '../auditNotesViewProvider';

export async function collectNotes(context: vscode.ExtensionContext, auditNotesViewProvider: AuditNotesViewProvider, currentPanel: vscode.WebviewPanel | undefined): Promise<vscode.WebviewPanel | undefined> {
    const outputPath = getOutputPath();
    
    try {
        auditNotesViewProvider.resetStatus();

        // Load existing notes with checked states
        let existingNotesByFile = {};
        if (fs.existsSync(outputPath)) {
            existingNotesByFile = await loadNotesFromFile();
        }

        // Scan for new notes
        const newNotesByFile = await scanWorkspaceForNotes((status, total) => {
            auditNotesViewProvider.updateStatus(status, total);
        });

        // Merge new notes with existing notes
        const combinedNotesByFile = mergeNotes(existingNotesByFile, newNotesByFile);

        const notesFound = Object.keys(combinedNotesByFile).length > 0;

        if (notesFound) {
            await saveNotesToFile(combinedNotesByFile);
            currentPanel = await showNotesInWebview(context, combinedNotesByFile, outputPath, currentPanel);
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
