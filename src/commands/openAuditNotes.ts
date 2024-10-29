import * as vscode from 'vscode';
import { loadNotesFromFile } from '../utils/noteUtils';
import { showNotesInWebview } from '../webview/webviewProvider';
import { getOutputPath } from '../utils/fileUtils';
import { handleError } from '../utils/errorUtils';

export async function openAuditNotes(context: vscode.ExtensionContext, currentPanel: vscode.WebviewPanel | undefined): Promise<vscode.WebviewPanel | undefined> {
    try {
        const notesByFile = await loadNotesFromFile();
        currentPanel = await showNotesInWebview(context, notesByFile, getOutputPath(), currentPanel);
        return currentPanel;
    } catch (error) {
        handleError('Error opening audit notes', error);
        return undefined;
    }
}
