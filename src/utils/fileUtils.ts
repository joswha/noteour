import * as vscode from 'vscode';
import * as path from 'path';
import { Note, NotesByFile } from '../types';

export async function scanWorkspaceForNotes(
    statusCallback: (status: number, total: number) => void
): Promise<NotesByFile> {
    const config = vscode.workspace.getConfiguration('noteour');
    
    // Get comma-separated strings and convert to arrays
    const fileExtStr = config.get<string>('fileExtensions', 'sol');
    const noteTypesStr = config.get<string>('noteTypes', 'TODO,@audit');

    const fileExtensions = fileExtStr.split(',').map(ext => ext.trim()).filter(Boolean);
    const noteTypes = noteTypesStr.split(',').map(type => type.trim()).filter(Boolean);

    // Escape special characters in note types and create a regex pattern
    const noteTypesPattern = noteTypes.map(type => type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const noteTypesRegex = new RegExp(`(${noteTypesPattern})`, 'i');
    
    const globPattern = `**/*.{${fileExtensions.join(',')}}`;

    const notesByFile: NotesByFile = {};

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder found');
    }

    const files = await vscode.workspace.findFiles(globPattern, '**/node_modules/**');
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        statusCallback(i + 1, totalFiles);

        const document = await vscode.workspace.openTextDocument(file);
        const text = document.getText();
        const lines = text.split('\n');

        let inBlockComment = false;

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Check for block comment start
            if (trimmedLine.startsWith('/*')) {
                inBlockComment = true;
            }

            // Check if we're in a comment (block or line)
            if (inBlockComment || trimmedLine.startsWith('//')) {
                if (noteTypesRegex.test(trimmedLine)) {
                    // Extract the note content, removing comment symbols
                    const noteContent = trimmedLine.replace(/^\/\*+|\*+\/|\/\/|\*/g, '').trim();
                    const note: Note = {
                        line: index + 1,
                        content: noteContent,
                        type: 'note',
                        checked: false
                    };

                    const fileUri = file.toString();
                    const filePath = file.fsPath;

                    if (!notesByFile[filePath]) {
                        notesByFile[filePath] = { fileUri, notes: [] };
                    }

                    notesByFile[filePath].notes.push(note);
                }
            }

            // Check for block comment end
            if (trimmedLine.endsWith('*/')) {
                inBlockComment = false;
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
