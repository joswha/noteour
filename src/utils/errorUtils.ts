import * as vscode from 'vscode';

export function handleError(message: string, error: unknown) {
    console.error(message, error);
    if (error instanceof Error) {
        vscode.window.showErrorMessage(`${message}: ${error.message}`);
    } else {
        vscode.window.showErrorMessage(`${message}. Check the console for more details.`);
    }
}
