import * as vscode from 'vscode';
import { getWebviewContent } from './webviewContent';
import { updateCheckbox, openFile } from '../utils/noteUtils';
import { NotesByFile } from '../types';

let currentPanel: vscode.WebviewPanel | undefined = undefined;

export async function showNotesInWebview(
    context: vscode.ExtensionContext,
    notesByFile: NotesByFile,
    outputPath: string,
    currentPanel: vscode.WebviewPanel | undefined
): Promise<vscode.WebviewPanel> {
    if (currentPanel) {
        currentPanel.dispose();
    }

    currentPanel = vscode.window.createWebviewPanel(
        'auditNotes',
        'Audit Notes',
        vscode.ViewColumn.Beside,
        { enableScripts: true }
    );

    currentPanel.webview.html = getWebviewContent(notesByFile);

    currentPanel.webview.onDidReceiveMessage(
        message => handleWebviewMessage(message, notesByFile, outputPath, currentPanel!),
        undefined,
        context.subscriptions
    );

    currentPanel.onDidDispose(
        () => {
            currentPanel = undefined;
        },
        null,
        context.subscriptions
    );

    return currentPanel;
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
