import * as vscode from 'vscode';
import { scanWorkspaceForNotes } from '../utils/fileUtils';
import { saveNotesToFile } from '../utils/noteUtils';
import { showNotesInWebview } from '../webview/webviewProvider';
import { handleError } from '../utils/errorUtils';

export async function collectNotes(context: vscode.ExtensionContext) {
    try {
        const notesByFile = await scanWorkspaceForNotes();
        const outputPath = await saveNotesToFile(notesByFile);
        await showNotesInWebview(context, notesByFile, outputPath);
    } catch (error) {
        handleError('Error collecting notes', error);
    }
}
