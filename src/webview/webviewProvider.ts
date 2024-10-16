import * as vscode from 'vscode';
import { getWebviewContent } from './webviewContent';
import { updateCheckbox, openFile } from '../utils/noteUtils';
import { NotesByFile } from '../types';

export async function showNotesInWebview(
    context: vscode.ExtensionContext,
    notesByFile: NotesByFile,
    outputPath: string
) {
    const panel = vscode.window.createWebviewPanel(
        'auditNotes',
        'Audit Notes',
        vscode.ViewColumn.Beside,
        { enableScripts: true }
    );

    panel.webview.html = getWebviewContent(notesByFile);

    panel.webview.onDidReceiveMessage(
        message => handleWebviewMessage(message, notesByFile, outputPath, panel),
        undefined,
        context.subscriptions
    );
}

async function handleWebviewMessage(
    message: any,
    notesByFile: NotesByFile,
    outputPath: string,
    panel: vscode.WebviewPanel
) {
    switch (message.command) {
        case 'openFile':
            await openFile(message.file, message.line);
            break;
        case 'updateCheckbox':
            await updateCheckbox(message, notesByFile, outputPath);
            panel.webview.html = getWebviewContent(notesByFile);
            break;
    }
}
