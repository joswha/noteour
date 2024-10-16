import * as vscode from 'vscode';
import * as fs from 'fs';
import { scanWorkspaceForNotes, getOutputPath } from '../utils/fileUtils';
import { saveNotesToFile, loadNotesFromFile } from '../utils/noteUtils';
import { showNotesInWebview } from '../webview/webviewProvider';
import { handleError } from '../utils/errorUtils';
import { AuditNotesViewProvider } from '../auditNotesViewProvider';

export async function collectNotes(context: vscode.ExtensionContext, auditNotesViewProvider: AuditNotesViewProvider) {
    const outputPath = getOutputPath();
    
    if (fs.existsSync(outputPath)) {
        auditNotesViewProvider.setCompleted();
        const notesByFile = await loadNotesFromFile();
        await showNotesInWebview(context, notesByFile, outputPath);
        return;
    }

    try {
        auditNotesViewProvider.resetProgress();
        const notesByFile = await scanWorkspaceForNotes((progress, total) => {
            auditNotesViewProvider.updateProgress(progress, total);
        });
        await saveNotesToFile(notesByFile);
        await showNotesInWebview(context, notesByFile, outputPath);
        auditNotesViewProvider.setCompleted();
    } catch (error) {
        handleError('Error collecting notes', error);
        auditNotesViewProvider.resetProgress();
    }
}
