# Collect Audit Notes Extension

**Collect Audit Notes** is a Visual Studio Code extension that scans through your project files to collect comments and notes marked with `@note`, `@audit-info`, `@audit`, and `TODO`. The extension generates an organized list of all audit notes and TODOs, presenting them in both a markdown file (`audit-notes.md`) and an interactive webview inside VSCode.

## Features

- Scans through files in your workspace for special comments:
  - `@note`, `@audit-info`, `@audit` for audit-related notes.
  - `TODO` for tasks to be done.
- Collects all matching notes and generates a markdown file (`audit-notes.md`) containing:
  - A list of files where these comments were found.
  - Each comment listed with its file and line number.
  - Checkboxes for all notes that can be checked off.
- Displays the notes in an easy-to-navigate **webview** within VSCode.
- Provides a custom view in the Activity Bar for quick access to extension features.
- Allows customization of file extensions to scan.
- Clickable links in both the markdown file and the webview to open files directly at the relevant line.
- Persistent checkbox states across sessions for all types of notes.
- Clear collected notes with a single click.

## Installation

1. Open **Visual Studio Code**.
2. Go to the Extensions view (Ctrl+Shift+X).
3. Search for **Collect Audit Notes**.
4. Click **Install**.

Alternatively, you can install this extension from the source code:

1. Clone the repository:
   ```bash
   git clone https://github.com/joswha/noteour.git
   ```
2. Open the folder in VSCode:
   ```bash
   code collect-audit-notes
   ```
3. Press `F5` to launch the extension in a new VSCode window for testing.

## Usage

1. Open your workspace in VSCode.
2. Click on the Audit Notes icon in the Activity Bar to open the custom view.
3. Use the "Collect Notes" button to scan your workspace and collect notes.
4. Use the "Open Audit Notes" button to view the collected notes in a webview.
5. Set custom file extensions to scan using the "File Extensions" item in the custom view.
6. Click the "Clear Notes" button in the custom view to delete all collected audit notes.

### Custom View

The extension provides a custom view in the Activity Bar with the following features:
- File Extensions: Displays current file extensions being scanned. Click to modify.
- Status: Shows the current status of note collection.
- Collect Notes: Button to start the note collection process.
- Open Audit Notes: Button to open the collected notes in a webview.
- Clear Notes: Button to delete all collected audit notes.

### Checkboxes

- All notes (including `@note`, `@audit-info`, `@audit`, and `TODO`) appear as checkboxes in the `audit-notes.md` file and in the webview.
- You can check off items in the webview, and the state will be saved in the markdown file.
- Checked items will have a strikethrough style in the webview.
- Checked states persist across sessions.

## Configuration

Customize file extensions and note types through VS Code settings:

1. Open Settings:
   - **macOS**: `Cmd + ,`
   - **Windows/Linux**: `Ctrl + ,`
2. Search for "noteour"
3. Configure the following settings:

- **File Extensions** (`noteour.fileExtensions`):
  - Default: `sol`
  - Description: Comma-separated list of file extensions to scan (e.g. `js,ts,jsx,tsx,sol`)
  - Example: `sol,ts,js`

- **Note Types** (`noteour.noteTypes`):
  - Default: `TODO,@audit`
  - Description: Comma-separated list of note types to search for (e.g. `TODO,@audit,@note`)
  - Example: `TODO,@audit,@note,@audit-info`

Changes to these settings will automatically trigger a new note collection.

### Custom View

The extension provides a custom view in the Activity Bar with the following features:
- Status: Shows the current status of note collection
- Collect Notes: Button to start the note collection process
- Open Audit Notes: Button to open the collected notes in a webview
- Clear Notes: Button to delete all collected audit notes

### Notes About Files

- By default scans `.sol` files
- Ignores files in the `node_modules/` folder

## Development

To contribute or customize the extension:

1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Run `npm run compile` to build the project.
4. Press `F5` to open a new VSCode window with the extension loaded for testing.

## Contributing

Contributions are welcome! To contribute:

1. Fork this repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Create a pull request.

---

## Example Output

### Markdown Output (`audit-notes.md`):

```markdown
# Audit Notes

## File: [src/index.js](vscode://file/path/to/src/index.js)

- [ ] [Line 12](vscode://file/path/to/src/index.js:12): @note Add detailed documentation for this function.
- [ ] [Line 24](vscode://file/path/to/src/index.js:24): @audit Check the security implementation here.

## File: [src/utils.js](vscode://file/path/to/src/utils.js)

- [ ] [Line 5](vscode://file/path/to/src/utils.js:5): TODO: Refactor this utility function.
```
