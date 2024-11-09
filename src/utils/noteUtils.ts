import * as fs from 'fs';
import { Note, NotesByFile } from '../types';
import { getOutputPath } from './fileUtils';
import * as vscode from 'vscode';

export async function saveNotesToFile(notesByFile: NotesByFile): Promise<string> {
    const outputPath = getOutputPath();
    const content = generateMarkdownContent(notesByFile);
    fs.writeFileSync(outputPath, content, 'utf8');
    return outputPath;
}

export async function loadNotesFromFile(): Promise<NotesByFile> {
    const outputPath = getOutputPath();
    const content = fs.readFileSync(outputPath, 'utf8');
    return parseAuditNotes(content);
}

export function generateMarkdownContent(notesByFile: NotesByFile): string {
  let markdownContent = '# Audit Notes\n\n';

  for (const [filePath, fileData] of Object.entries(notesByFile)) {
    const relativePath = vscode.workspace.asRelativePath(filePath);
    const vscodePath = vscode.Uri.file(filePath).toString();
    markdownContent += `## File: [${relativePath}](${vscodePath})\n\n`;

    fileData.notes.forEach((note) => {
      const lineLink = `${vscodePath}#${note.line}`;
      const checkbox = note.checked ? 'x' : ' ';
      markdownContent += `- [${checkbox}] [Line ${note.line}](${lineLink}): ${note.content}\n\n`;
    });
  }

  return markdownContent;
}

function parseAuditNotes(content: string): NotesByFile {
  const notesByFile: NotesByFile = {};
  const lines = content.split('\n');
  let currentFile = '';

  for (const line of lines) {
    if (line.startsWith('## File:')) {
      const match = line.match(/\[(.+?)\]\((.+?)\)/);
      if (match) {
        const fileUri = match[2];
        const filePath = vscode.Uri.parse(fileUri).fsPath;
        currentFile = filePath;
        notesByFile[currentFile] = { fileUri, notes: [] };
      }
    } else if (line.startsWith('- ')) {
      const match = line.match(/- \[([ xX])\] \[Line (\d+)\]\((.+?)\): (.+)/);
      if (match && currentFile) {
        const note: Note = {
          line: parseInt(match[2], 10),
          content: match[4],
          type: 'note',
          checked: match[1].toLowerCase() === 'x',
        };
        notesByFile[currentFile].notes.push(note);
      }
    }
  }

  return notesByFile;
}

export async function updateCheckbox(message: any, notesByFile: NotesByFile, outputPath: string): Promise<void> {
    const { file, line, checked, content } = message;
    const fileData = notesByFile[file];
    if (fileData) {
        const note = fileData.notes.find(n => n.line === line && n.content === content);
        if (note) {
            note.checked = checked;

            const updatedMarkdownContent = generateMarkdownContent(notesByFile);

            try {
                fs.writeFileSync(outputPath, updatedMarkdownContent, 'utf8');
                console.log(`Audit notes updated and saved to ${outputPath}`);
            } catch (writeError) {
                throw new Error(`Failed to update audit notes markdown file: ${writeError}`);
            }
        }
    }
}

export async function openFile(file: string, line?: number): Promise<void> {
    const document = await vscode.workspace.openTextDocument(vscode.Uri.parse(file));
    const editor = await vscode.window.showTextDocument(document);
    if (line) {
        const position = new vscode.Position(line - 1, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position));
    }
}

export function mergeNotes(
  existingNotesByFile: NotesByFile,
  newNotesByFile: NotesByFile
): NotesByFile {
  const mergedNotesByFile: NotesByFile = {};

  for (const [filePath, newFileData] of Object.entries(newNotesByFile)) {
    const existingFileData = existingNotesByFile[filePath];
    const mergedNotes: Note[] = [];

    for (const newNote of newFileData.notes) {
      const matchingNote = existingFileData?.notes.find(
        (note) =>
          note.line === newNote.line && note.content === newNote.content
      );
      if (matchingNote) {
        newNote.checked = matchingNote.checked;
      }
      mergedNotes.push(newNote);
    }

    mergedNotesByFile[filePath] = {
      fileUri: newFileData.fileUri,
      notes: mergedNotes,
    };
  }

  return mergedNotesByFile;
}
