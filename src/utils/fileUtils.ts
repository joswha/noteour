import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Note, NotesByFile } from '../types';

export async function scanWorkspaceForNotes(
    progressCallback: (progress: number, total: number) => void
): Promise<NotesByFile> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder found');
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const notesByFile: NotesByFile = {};

    const files = await vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx,sol}', '**/node_modules/**');
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        progressCallback(i + 1, totalFiles);

        const document = await vscode.workspace.openTextDocument(file);
        const text = document.getText();
        const lines = text.split('\n');

        lines.forEach((line, index) => {
            let noteType: Note['type'] | null = null;

            if (/@note|@audit-info|@audit/.test(line)) {
                noteType = 'note';
            } else if (/TODO/i.test(line)) {
                noteType = 'todo';
            }

            if (noteType) {
                const noteContent = line.trim();
                const note: Note = {
                    line: index + 1,
                    content: noteContent,
                    type: noteType,
                    checked: false
                };

                const filePath = file.fsPath;
                const fileUri = vscode.Uri.file(filePath).toString();

                if (!notesByFile[filePath]) {
                    notesByFile[filePath] = { fileUri, notes: [] };
                }

                notesByFile[filePath].notes.push(note);
            }
        });
    }

    return notesByFile;
}

export function getOutputPath(): string {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder found');
    }
    return path.join(workspaceFolders[0].uri.fsPath, 'audit-notes.md');
}
