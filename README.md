# Opus UI Language Server VSCode Client

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

### Suggestions
![Demo](https://github.com/IntendaUK/opus-ui-language-server-vscode-client/blob/main/images/componentPrps.gif?raw=true)

---

## Installation

To install the Opus UI Language Server, follow these steps:
1. Install the Opus UI Language Server Extension in the VSCode Extensions panel or from here: [Opus UI Language Server Extension](https://marketplace.visualstudio.com/items?itemName=Intenda.opus-language-client-vscode)
2. Ensure your application's package.json includes the entries mentioned in [Opus UI package.json configuration](#opus-ui-packagejson-configuration)

---

## Opus UI package.json configuration

### opusPackagerConfig
A mandatory configuration object used by the [opus-ui-packager](https://github.com/IntendaUK/opus-ui-packager) dependency specifying where to build Opus UI JSON.

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
    "@intenda/opus-ui": "^1.1.4",
    "@intenda/opus-ui-code-editor": "^1.0.0",
    "@intenda/opus-ui-components": "^1.0.0",
    "@intenda/opus-ui-drag-move": "^1.0.0",
    "@intenda/opus-ui-expo-interface": "^1.0.1",
    "@intenda/opus-ui-grid": "^1.0.1",
    "@intenda/opus-ui-json-builder": "^1.0.0",
    "@intenda/opus-ui-map-location-iq": "^1.0.0",
    "@intenda/opus-ui-pdf-viewer": "^1.0.0",
    "@intenda/opus-ui-svg": "^1.1.0",
    "@intenda/opus-ui-zoom-panner": "^1.0.3",
     // Opus UI ensembles
    "l2_buttons": "^1.6.1",
    "l2_grid": "^1.19.0"
},
```
---

### opusUiComponentLibraries

A list of paths (relative to the node_modules folder) which tells the language server which component libraries to load and provide language server features for.

```json
"opusUiComponentLibraries": [
    "@intenda/opus-ui-components",
    "@intenda/opus-ui-drag-move",
]
```

---

### opusUiEnsembles

A list of entries which tells the language server which ensembles to load and support. Note, this list can include a strings and/or objects.
- Each entry can be a string path or an object with the "path" key and *optionally* the "external" key. When external is falsy, ensembles will be loaded from the root of the node_modules folder. When true, an absolute path must be supplied. This allows for working on external ensembles which are not installed into the project, alongside internal ones.

```json
"opusUiEnsembles": [
    "l2_buttons", 
    {
        "path": "l2_grid"
    },
    {
        "external": true,
        "name": "l2_inputs",
        "path": "/Users/Santino/Code/Intenda/low_code/opus-apps/mda_ensembles/l2_inputs"
    }
]
```
---

### Important notes

- The language server is built to automatically rebuild when it detects a change to either "dependencies", "opusUiComponentLibraries" or "opusUiEnsembles".
- The language server expects each entry included in "opusUiComponentLibraries" and "opusUiEnsembles" (except for external ensemble entries) to be installed using "npm install" so it can find the associated dependency inside of node_modules. If the language server cannot find the dependency, it will be ignored and features such as suggestions, linting, etc. for the associated components will not be shown.

---

## Frequently asked questions
- **[Why do random suggestions which are not part of the language server show?](#why-do-random-suggestions-which-are-not-part-of-the-language-server-show)**
- **[Why are JSON linting errors showing twice?](#why-are-json-linting-errors-showing-twice)**
- **[Why do nodes not always update when working in split panes?](#why-do-nodes-not-always-update-when-working-in-split-panes)**
- **[Why isn't the language server providing suggestions for external ensembles?](#why-isnt-the-language-server-providing-suggestions-for-external-ensembles)**

### Why do random suggestions which are not part of the language server show?

VSCode has a built-in extension called "JSON Language Features" which runs in the background alongside the Opus UI Language Server. It provides (context unaware) suggestions which are shown alongside the suggestions provided by the Opus UI Language Server. As the Opus UI Language Server provides context-aware suggestions, the "JSON Language Features" extension can be disabled. To disable it:
1. Click the three dots next to the refresh icon in the extensions panel
2. In the context menu that appears, click "Show Running Extensions"
3. Search for the "JSON Language Features" extension, right click and select "Disable (Workspace)"

### Why are JSON linting errors showing twice?

This is also due to the "JSON Language Features" built in VSCode extension. As the Opus UI Language Server has JSON language features built in, this extension can be safely disabled. See above for steps to disable it for your workspace.

### Why do nodes not always update when working in split panes?

As with any application, Opus UI applications can have an infinite amount of files (inside the app directory), simply rebuilding all nodes for each file every time we make a change, would become very slow. To maintain speed and efficient rebuilding, the language server will only rebuild nodes for affecting files when we click on (or open) the affecting file. However, for developer satisfaction, one of the few situations it does rebuild automatically for affecting files is with traits and trait definitions. 

### Why isn't the language server providing suggestions for external ensembles?

The language server is built to quickly switch between different Opus UI projects on the fly. Due to this, when any file is opened, it will drill up until it finds a package.json file with Opus UI inside it's dependencies list. As external ensembles are outside the scope of an Opus UI application, it has no context of which project the ensemble belongs to. However, this can be circumvented by **first opening any file within the project you want to work on**, and then clicking back in the ensemble file. This will give the language server context and language server features will work as normal.