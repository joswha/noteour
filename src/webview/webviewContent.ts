import * as path from 'path';
import { NotesByFile } from '../types';

export function getWebviewContent(notesByFile: NotesByFile): string {
    let content = '<h1>Audit Notes</h1>';

    for (const [filePath, fileData] of Object.entries(notesByFile)) {
        const fileName = path.basename(filePath);
        const fileUri = fileData.fileUri;

        content += `<h2>File: <a href="#" class="open-file" data-file="${fileUri}">${fileName}</a></h2>`;

        fileData.notes.forEach(note => {
            const isChecked = note.checked ? 'checked' : '';
            const noteContent = note.content;

            if (note.type === 'todo') {
                content += `
                    <p>
                        <input type="checkbox" class="todo-checkbox" data-file="${filePath}" data-line="${note.line}" data-content="${encodeURIComponent(noteContent)}" ${isChecked}>
                        <a href="#" class="open-file" data-file="${fileUri}" data-line="${note.line}">Line ${note.line}</a>: ${noteContent}
                    </p>`;
            } else {
                content += `
                    <p>
                        <a href="#" class="open-file" data-file="${fileUri}" data-line="${note.line}">Line ${note.line}</a>: ${noteContent}
                    </p>`;
            }
        });
    }

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Audit Notes</title>
        </head>
        <body>
            ${content}
            <script>
                const vscode = acquireVsCodeApi();

                document.querySelectorAll('.open-file').forEach(element => {
                    element.addEventListener('click', (event) => {
                        event.preventDefault();
                        const file = event.currentTarget.getAttribute('data-file');
                        const line = event.currentTarget.getAttribute('data-line');
                        vscode.postMessage({
                            command: 'openFile',
                            file,
                            line: line ? parseInt(line, 10) : undefined
                        });
                    });
                });

                document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
                    checkbox.addEventListener('change', (event) => {
                        const isChecked = event.target.checked;
                        const file = checkbox.getAttribute('data-file');
                        const line = parseInt(checkbox.getAttribute('data-line'), 10);
                        const content = decodeURIComponent(checkbox.getAttribute('data-content'));
                        vscode.postMessage({
                            command: 'updateCheckbox',
                            file,
                            line,
                            content,
                            checked: isChecked
                        });
                    });
                });
            </script>
        </body>
        </html>
    `;
}
