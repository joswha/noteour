# Collect Audit Notes Extension

**Collect Audit Notes** is a Visual Studio Code extension that scans through JavaScript, TypeScript, Solidity, and other project files to collect comments and notes marked with `@note`, `@audit-info`, `@audit`, and `TODO`. The extension generates an organized list of all audit notes and TODOs and presents it in both a markdown file (`audit-notes.md`) and a webview inside VSCode.

## Features

- Scans through all relevant files in your workspace for special comments:
  - `@note`, `@audit-info`, `@audit` for audit-related notes.
  - `TODO` for tasks to be done.
- Collects all matching notes and generates a markdown file (`audit-notes.md`) containing:
  - A list of files where these comments were found.
  - Each comment listed with its file and line number.
  - Checkboxes for `TODO` items that can be checked off.
- Displays the notes in an easy-to-navigate **webview** within VSCode.
- Clickable links in both the markdown file and the webview to open files directly at the relevant line.
- Persistent TODO checkbox states across sessions.

## Installation

1. Open **Visual Studio Code**.
2. Go to the Extensions view by clicking the Extensions icon in the Activity Bar on the side of the window or by pressing `Ctrl+Shift+X`.
3. Search for **Collect Audit Notes**.
4. Click **Install**.

Alternatively, you can install this extension from the source code:

1. Clone the repository:
   ```bash
   git clone https://github.com/joswha/noteour.git
   ```
2. Open the folder in VSCode:
   ```bash
   code noteour
   ```
3. Press `F5` to launch the extension in a new VSCode window for testing.

## Usage

1. Open your workspace in VSCode.
2. Run the **Collect Audit Notes** command:
   - Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS).
   - Type `Collect Audit Notes` and select it.
3. The extension will scan all relevant files in your workspace and:
   - Create or update the `audit-notes.md` file in your workspace root with a list of all audit notes and TODOs.
   - Open a **webview** displaying the notes in an organized format.

### TODO Checkboxes

- TODO comments (`TODO`) will appear as checkboxes in the `audit-notes.md` file and in the webview.
- You can check off TODO items in the webview, and the state will be saved in the markdown file.
- Checked off TODOs will persist across sessions.

## Configuration

No configuration is required out of the box. The extension scans for:
- `.js`, `.ts`, `.jsx`, `.tsx`, and `.sol` files.
- It ignores files in the `node_modules/` folder by default.

## Development

If you want to contribute or customize the extension:

1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Run `npm run compile` to build the project.
4. Press `F5` to open a new VSCode window with the extension loaded for testing.

### How It Works

- The extension searches for comments in the following formats:
  - `@note`
  - `@audit-info`
  - `@audit`
  - `TODO`
- It collects all matches into a structured list and saves them into `audit-notes.md`.
- It uses a VSCode **webview** to display the notes in an interactive format, allowing users to navigate between files and check off TODOs.

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

## File: [src/index.js](src/index.js)

- (Line 12) @note Add detailed documentation for this function.
- (Line 24) @audit Check the security implementation here.

## File: [src/utils.js](src/utils.js)

- [ ] TODO: Refactor this utility function.
```
