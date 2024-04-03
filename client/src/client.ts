// Plugins
import path from 'path';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node';
import { window, workspace, commands, ConfigurationTarget, ProgressLocation } from 'vscode';

// Model
import type { TextEditor, ConfigurationChangeEvent, WorkspaceConfiguration, ExtensionContext } from 'vscode';
import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node';

// Local Model
type ConfigurationSettings = {
	ensemblesPath: string
};

// Local Internals

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
let configurationSettings: ConfigurationSettings;

let client: LanguageClient;

// Helpers
const sendDocumentFocusedNotification = async (editor: TextEditor): Promise<void> => {
	client.sendNotification('documentFocused', {
		textDocument: {
			uri: editor.document.uri.toString(),
			text: editor.document.getText()
		}
	});
};

const fireOpenedForActiveWindows = async () => {
	for (const editor of window.visibleTextEditors) {
		if (editor && editor.document.languageId === 'json')
			await sendDocumentFocusedNotification(editor);
	}
};

const setConfigurationSettings = (newConfig: WorkspaceConfiguration) => {
	configurationSettings = {
		ensemblesPath: newConfig.get('ensemblesPath') as string
	};
};

const changeConfiguration = (commandPath: string, label: string, newValue: string) => {
	const config = workspace.getConfiguration();
	config.update(commandPath, newValue, ConfigurationTarget.Global);
	window.showInformationMessage(`"${label}" updated.`);
};

// Events
const onConfigurationChanged = async (event: ConfigurationChangeEvent) => {
	if (event.affectsConfiguration('opusLanguageServer')) {
		const newConfig = workspace.getConfiguration('opusLanguageServer');

		setConfigurationSettings(newConfig);

		if (client.diagnostics)
			client.diagnostics.clear();

		await fireOpenedForActiveWindows();
	}
};

const onFileFocused = async (editor: TextEditor | undefined) => {
	if (editor && editor.document.languageId === 'json' && window.activeTextEditor)
		await sendDocumentFocusedNotification(editor);
};

export const activate = async (context: ExtensionContext): Promise<void> => {
	try {
		const serverPath: string = context.asAbsolutePath(
			path.join('server', 'out', 'server.js')
		);

		const serverOptions: ServerOptions = {
			run: {
				module: serverPath,
				transport: TransportKind.ipc
			},
			debug: {
				module: serverPath,
				transport: TransportKind.ipc,
				options: { execArgv: ['--nolazy', '--inspect=6009'] }
			}
		};
		
		const clientOptions: LanguageClientOptions = {
			documentSelector: [
				{
					scheme: 'file',
					language: 'json'
				}
			],
			synchronize: {
				configurationSection: 'opusLanguageServer',
				fileEvents: [
					workspace.createFileSystemWatcher('**/*')
				]
			}
		};

		setConfigurationSettings(workspace.getConfiguration('opusLanguageServer'));

		client = new LanguageClient(
			'opus_language_client',
			'Opus UI Language Server',
			serverOptions,
			clientOptions
		);

		await client.start();

		await fireOpenedForActiveWindows();

		// Events
		window.onDidChangeActiveTextEditor(onFileFocused);
		workspace.onDidChangeConfiguration(onConfigurationChanged);

		// Commands
		context.subscriptions.push(commands.registerCommand('opusLanguageServer.changeOpusUiEnsemblesPath', () => {
			window.showInputBox({ prompt: 'Enter the new Opus ensembles folder path:' }).then(newPath => {
				if (newPath) 
					changeConfiguration('opusLanguageServer.ensemblesPath', 'Opus Ensembles Path', newPath);
			});
		}));

		context.subscriptions.push(commands.registerCommand('opusLanguageServer.reload', () => {
			window.withProgress({
				location: ProgressLocation.Notification,
				title: 'Restarting Opus UI Language Server',
				cancellable: false
			},
			progress => {
				return new Promise<void>(resolve => {
					client.stop()
						.then(() => {
							if (client.diagnostics)
								client.diagnostics.clear();

							client.start()
								.then(() => {
									fireOpenedForActiveWindows().then(() => {
										resolve();
									});
								})
								.catch(() => {
									progress.report({ message: 'Failed to restart the language server' });
									resolve();
								});
						})
						.catch(() => {
							progress.report({ message: 'Failed to stop the language server' });
							resolve();
						});
				});
			});
		}));
		
		console.log('STARTED CLIENT');
	} catch (error) {
		console.error('Error starting language client:', error);
	}
};

export const deactivate = (): Thenable<void> | undefined => {
	if (!client)
		return undefined;

	try {
		return client.stop();
	} catch (error) {
		console.error('Error stopping language client:', error);
	}
};
