import * as vscode from 'vscode';
import * as path from 'path';
import { Note, NotesByFile } from '../types';

export async function scanWorkspaceForNotes(
    progressCallback: (progress: number, total: number) => void
): Promise<NotesByFile> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder found');
    }

    const config = vscode.workspace.getConfiguration('auditNotes');
    const fileExtensions = config.get('fileExtensions', ['js', 'ts', 'jsx', 'tsx', 'sol']);
    const noteTypes = config.get('noteTypes', ['TODO', '@audit']);
    const noteTypesRegex = new RegExp(noteTypes.map(type => `\\b${type}\\b`).join('|'), 'i');
    const globPattern = `**/*.{${fileExtensions.join(',')}}`;

    const notesByFile: NotesByFile = {};

    const files = await vscode.workspace.findFiles(globPattern, '**/node_modules/**');
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        progressCallback(i + 1, totalFiles);

        const document = await vscode.workspace.openTextDocument(file);
        const text = document.getText();
        const lines = text.split('\n');

        lines.forEach((line, index) => {
            if (noteTypesRegex.test(line)) {
                const noteContent = line.trim();
                const note: Note = {
                    line: index + 1,
                    content: noteContent,
                    type: 'note',
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
