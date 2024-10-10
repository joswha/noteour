import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface Note {
    line: number;
    content: string;
    type: 'note' | 'audit' | 'todo';
    checked?: boolean;
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "Collect Audit Notes" is being activated.');

    let disposable = vscode.commands.registerCommand('extension.collectNotes', async () => {
        console.log('Collect Notes command executed.');
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        console.log(`Workspace root path: ${rootPath}`);

        const notesByFile: { [file: string]: { fileUri: string; notes: Note[] } } = {};

        // Read existing checkbox states from audit-notes.md
        const outputPath = path.join(rootPath, 'audit-notes.md');
        let existingCheckboxStates: { [key: string]: boolean } = {};

        if (fs.existsSync(outputPath)) {
            const existingContent = fs.readFileSync(outputPath, 'utf8');
            const lines = existingContent.split('\n');

            let currentFilePath = '';
            for (let line of lines) {
                const fileMatch = line.match(/^## File: \[(.+?)\]\(.+?\)/);
                if (fileMatch) {
                    const relativePath = fileMatch[1];
                    currentFilePath = path.resolve(rootPath, relativePath);
                    continue;
                }

                const todoMatch = line.match(/^- \[([ xX])\] (.+)/);
                if (todoMatch && currentFilePath) {
                    const checked = todoMatch[1].toLowerCase() === 'x';
                    const content = todoMatch[2].trim();
                    const key = `${currentFilePath}:${content}`;
                    existingCheckboxStates[key] = checked;
                }
            }
        }

        // Scan through all files in the workspace
        try {
            const files = await vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx,sol}', '**/node_modules/**');
            console.log(`Number of files found: ${files.length}`);
            if (files.length === 0) {
                vscode.window.showInformationMessage('No compatible files found in the workspace.');
                return;
            }

            for (const file of files) {
                try {
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

                            // Retrieve existing checkbox state
                            if (noteType === 'todo') {
                                const key = `${filePath}:${noteContent}`;
                                note.checked = existingCheckboxStates[key] || false;
                            }

                            notesByFile[filePath].notes.push(note);
                        }
                    });
                } catch (fileError) {
                    console.error(`Error reading file ${file.fsPath}:`, fileError);
                    if (fileError instanceof Error) {
                        vscode.window.showErrorMessage(`Error reading file ${file.fsPath}: ${fileError.message}`);
                    } else {
                        vscode.window.showErrorMessage(`Error reading file ${file.fsPath}.`);
                    }
                }
            }
        } catch (workspaceError) {
            console.error('Error finding files in workspace:', workspaceError);
            if (workspaceError instanceof Error) {
                vscode.window.showErrorMessage(`Error scanning files in the workspace: ${workspaceError.message}`);
            } else {
                vscode.window.showErrorMessage('Error scanning files in the workspace. Check the console for more details.');
            }
            return;
        }

        const totalNotes = Object.values(notesByFile).reduce((sum, fileData) => sum + fileData.notes.length, 0);
        console.log(`Number of notes found: ${totalNotes}`);
        if (totalNotes === 0) {
            vscode.window.showInformationMessage('No @note, @audit-info, @audit, or TODO tags found.');
            return;
        }

        // Generate markdown content
        function generateMarkdownContent() {
            let markdownContent = '# Audit Notes\n\n';

            for (const [filePath, fileData] of Object.entries(notesByFile)) {
                const relativePath = path.relative(rootPath, filePath);
                // Create a link on the file name
                markdownContent += `## File: [${relativePath}](${relativePath})\n\n`;

                fileData.notes.forEach(note => {
                    const noteContent = note.content;

                    if (note.type === 'todo') {
                        const checkbox = note.checked ? 'x' : ' ';
                        markdownContent += `- [${checkbox}] ${noteContent}\n\n`;
                    } else {
                        markdownContent += `- ${noteContent}\n\n`;
                    }
                });
            }

            return markdownContent;
        }

        const markdownContent = generateMarkdownContent();

        // Save the markdown file to the root of the workspace
        try {
            fs.writeFileSync(outputPath, markdownContent, 'utf8');
            vscode.window.showInformationMessage(`Audit notes collected and saved to ${outputPath}`);
            console.log(`Audit notes saved to ${outputPath}`);
        } catch (writeError) {
            console.error('Error writing markdown file:', writeError);
            if (writeError instanceof Error) {
                vscode.window.showErrorMessage(`Failed to write audit notes markdown file: ${writeError.message}`);
            } else {
                vscode.window.showErrorMessage('Failed to write audit notes markdown file. Check the console for more details.');
            }
        }

        // Show the results in a UI panel (Webview)
        try {
            console.log('Attempting to create webview panel.');
            const panel = vscode.window.createWebviewPanel(
                'auditNotes',
                'Audit Notes',
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true
                }
            );

            console.log('Webview panel created.');

            // Set the HTML content for the panel
            panel.webview.html = getWebviewContent(notesByFile);

            console.log('Webview content set.');

            // Handle messages from the webview
            panel.webview.onDidReceiveMessage(
                async (message) => {
                    if (message.command === 'openFile') {
                        const fileUri = vscode.Uri.parse(message.file);
                        console.log('Attempting to open file at URI:', fileUri.toString());
                        try {
                            const document = await vscode.workspace.openTextDocument(fileUri);
                            console.log('Document opened:', document.uri.toString());
                            const editor = await vscode.window.showTextDocument(document, { preview: false });
                            console.log('Editor opened.');
                            if (message.line) {
                                const position = new vscode.Position(message.line - 1, 0);
                                editor.selection = new vscode.Selection(position, position);
                                editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
                                console.log('Navigated to line:', message.line);
                            }
                        } catch (error) {
                            console.error('Error opening file:', error);
                            if (error instanceof Error) {
                                vscode.window.showErrorMessage(`Failed to open file: ${error.message}`);
                            } else {
                                vscode.window.showErrorMessage('Failed to open file: Unknown error.');
                            }
                        }
                    } else if (message.command === 'updateCheckbox') {
                        const { file, line, checked, content } = message;
                        const fileData = notesByFile[file];
                        if (fileData) {
                            const note = fileData.notes.find(n => n.line === line && n.content === content);
                            if (note && note.type === 'todo') {
                                note.checked = checked;

                                // Regenerate the markdown content
                                const updatedMarkdownContent = generateMarkdownContent();

                                // Save the updated markdown file
                                try {
                                    fs.writeFileSync(outputPath, updatedMarkdownContent, 'utf8');
                                    console.log(`Audit notes updated and saved to ${outputPath}`);
                                } catch (writeError) {
                                    console.error('Error writing markdown file:', writeError);
                                    if (writeError instanceof Error) {
                                        vscode.window.showErrorMessage(`Failed to update audit notes markdown file: ${writeError.message}`);
                                    } else {
                                        vscode.window.showErrorMessage('Failed to update audit notes markdown file. Check the console for more details.');
                                    }
                                }

                                // Optionally, update the webview content
                                // panel.webview.html = getWebviewContent(notesByFile);
                            }
                        }
                    }
                },
                undefined,
                context.subscriptions
            );

            console.log('Webview panel created successfully.');
        } catch (panelError: unknown) {
            console.error('Error creating webview panel:', panelError);
            if (panelError instanceof Error) {
                vscode.window.showErrorMessage(`Failed to create the webview panel: ${panelError.message}`);
            } else {
                vscode.window.showErrorMessage('Failed to create the webview panel. Check the console for more details.');
            }
        }
    });

    context.subscriptions.push(disposable);
    console.log('Extension "Collect Audit Notes" activated successfully.');
}

function getWebviewContent(notesByFile: { [file: string]: { fileUri: string; notes: Note[] } }): string {
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
                        ${noteContent}
                    </p>`;
            } else {
                content += `
                    <p>
                        ${noteContent}
                    </p>`;
            }
        });
    }

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' vscode-webview-resource:; style-src vscode-webview-resource:;">
            <meta charset="UTF-8">
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
                        vscode.postMessage({
                            command: 'openFile',
                            file
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

export function deactivate() {
    console.log('Extension "Collect Audit Notes" has been deactivated.');
}
