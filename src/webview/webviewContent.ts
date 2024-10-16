import * as path from 'path';
import { NotesByFile } from '../types';

function truncateContent(content: string, maxLength: number = 50): string {
    if (content.length <= maxLength) {
        return content;
    }
    return content.slice(0, maxLength) + '...';
}

export function getWebviewContent(notesByFile: NotesByFile): string {
    let content = '<h1>Audit Notes</h1>';

    for (const [filePath, fileData] of Object.entries(notesByFile)) {
        const fileName = path.basename(filePath);
        const fileUri = fileData.fileUri;

        content += `<h2>File: <a href="#" class="open-file" data-file="${fileUri}">${fileName}</a></h2>`;

        fileData.notes.forEach(note => {
            const isChecked = note.checked ? 'checked' : '';
            const truncatedContent = truncateContent(note.content);
            const fullContent = note.content;
            const strikethrough = note.checked ? 'text-decoration: line-through;' : '';

            content += `
                <p>
                    <input type="checkbox" class="note-checkbox" data-file="${filePath}" data-line="${note.line}" data-content="${encodeURIComponent(fullContent)}" ${isChecked}>
                    <a href="#" class="open-file" data-file="${fileUri}" data-line="${note.line}" style="${strikethrough}">Line ${note.line}</a>: 
                    <span style="${strikethrough}">${truncatedContent}</span>
                    <span class="full-content" style="display: none;">${fullContent}</span>
                </p>`;
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

                document.querySelectorAll('.note-checkbox').forEach(checkbox => {
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
