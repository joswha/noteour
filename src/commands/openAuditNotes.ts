import * as vscode from 'vscode';
import { loadNotesFromFile } from '../utils/noteUtils';
import { showNotesInWebview } from '../webview/webviewProvider';
import { getOutputPath } from '../utils/fileUtils';
import { handleError } from '../utils/errorUtils';

export async function openAuditNotes(context: vscode.ExtensionContext) {
    try {
        const notesByFile = await loadNotesFromFile();
        await showNotesInWebview(context, notesByFile, getOutputPath());
    } catch (error) {
        handleError('Error opening audit notes', error);
    }
}
