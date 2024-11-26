# Change Log

All notable changes to the "noteour" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.5]

- Made settings configurable from CMD+, rather than through the UI.
- Fixed minor bugs where '@audit' was not detected due to regex limitations.

## [0.0.4]

- Fixed an issue where the extension was changing file icons unexpectedly by removing the `iconThemes` contribution from `package.json`.
- Removed custom icons from the tree view items to prevent interfering with already defined VS Code icons.

## [0.0.3]

- Added logo to the extension.

## [0.0.2]

- Updated core functionality to support special characters in note types, such as '@'.
- Improved naming of commands in Command Palette for clarity.
- Enhanced functionality to collect audit notes upon each file extension or note type change.

## [0.0.1]

- Initial release.