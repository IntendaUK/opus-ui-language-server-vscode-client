# Change Log

All notable changes to the "Opus UI Language Server" extension will be documented in this file.

### 3.1.1
* Fixed an issue where the language server would build nodes from node_modules folders inside ensembles.

### 3.1.0
* Added support for peerDependencies in package.json.

### 3.0.0
* Upgraded to support opus-ui v1.10.3.

### 2.5.0
* Added support for opusUiColorThemes entry for opus-ui config entries.

### 2.4.0
* Added support for .opusUiConfig dotfile for custom overrides of opus-ui config entries.

### 2.3.0
* Added functionality to show color suggestions loaded from opusUiColorThemes.

### 2.2.0
* Added functionality to allow external component libraries to import shared props from the Opus UI components folder.

### 2.1.0
* Fixed a pathing issue on windows machines preventing the language server from running.

### 2.0.0
* Extended opusUiComponentLibraries and opusUiEnsembles to support relative paths from the node_modules folder and added external ensembles support to opusUiEnsembles.

### 1.0.0
* Initial release