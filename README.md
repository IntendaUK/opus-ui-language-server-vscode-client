# Opus UI Language Server

#### Code IntelliSense and linter for use when writing Opus UI application JSON files

---

## Index
- **[Features](#features)**
- **[Installation](#installation)**
- **[Opus UI Configuration](#installation)**

---

## Features

- **[Suggestions](#suggestions)**: Receive intelligent suggestions for components, properties, traits, and more as you type
- **[Symbol Hovering](#symbol-hovering)**: See component property and script information on hover
- **[Linting](#linting)**: Catch common errors and potential issues in your Opus UI codebase
- **[Solutions and hints](#solutions-and-hints)**: Get solutions to issues or hints where relevant to enhance your dev experience
- **[Seamless Opus UI app switching](#opus-ui-app-switching)**: Work on multiple Opus UI applications and seamlessly switch between them without reloading

---

## Installation

To install the Opus UI Language Server, follow these steps:
1. Install the Opus UI Language Server Extension in the VSCode Extensions panel or from here: [Opus UI Language Server Extension](https://marketplace.visualstudio.com/items?itemName=Intenda.opus-language-client-vscode)
2. Ensure your application's package.json includes the entries mentioned in [Opus UI package.json configuration](#opus-ui-packagejson-configuration)

---

## Opus UI package.json configuration

### opusPackagerConfig
A mandatory configuration object used by the *opus-ui-packager* devDependency that specifies how to build your Opus UI JSON package.

```json
"opusPackagerConfig": {
    "appDir": "app",            // Where the Opus UI app exists relative to the root of your project
    "packagedDir": "public",    // Where the built Opus UI application should be stored
    "packagedFileName": "app"   // The name of the built app file
}
```

### dependencies

A mandatory configuration object specifying the dependencies to be installed into your project. This should include the **"opus-ui"** dependency itself, any Opus UI component libraries and any Opus UI ensembles.

```json
"dependencies": {
    // React dependencies
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    // Opus UI dependencies
    "opus-ui": "0.0.85",
    // Opus UI component libraries
    "opus-ui-code-editor": "^0.6.0",
    "opus-ui-components": "^0.3.0",
    "opus-ui-drag-move": "^0.2.0",
    // Opus UI ensembles
    "l2_buttons": "1.6.1",
    "l2_grid": "1.19.0"
}
```
---

### opusUiComponentLibraries

A list of Opus UI component libraries which tells the language server which component libraries to load and support.

```json
"opusUiComponentLibraries": [
    "opus-ui-components",
    "opus-ui-code-editor",
]
```
- Note for demonstration purposes, the "opus-ui-drag-move" component library is included in dependencies but not included in this list. As a result the language server will not provide any suggestions, linting support etc. for any embedded components for that library. E.g. "containerMovable", "containerDnd" etc.

---

### opusUiEnsembles

A list of Opus UI ensembles which tells the language server which ensembles to load and support. Note, this list can include a strings and/or objects.
- When a string is specified, the language server will fetch the ensemble directly from the installed ensemble inside the node_modules folder
- When the object syntax is used, the language server will fetch the ensemble from the "path" value inside the object. This allows for working on external ensembles which are not installed into the project, alongside internal ones

```json
"opusUiEnsembles": [
    "l2_buttons",
    "l2_grid",
    {
        "path": "/Users/Santino/Code/Intenda/low_code/opus-apps/mda_ensembles/l2_inputs"
    }
]
```
---

### Notes

- The language server is built to automatically rebuild when it detects a change to either "dependencies", "opusUiComponentLibraries" or "opusUiEnsembles".
- The language server expects each entry included in "opusUiComponentLibraries" and "opusUiEnsembles" (except for external ensembles) to be installed using "npm install" so it can find the associated dependency inside of node_modules. If the language server cannot find the dependency, it will be ignored and features such as suggestions, linting, etc. for the associated components will not be shown.