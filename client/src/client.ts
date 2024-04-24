// Plugins
import { LanguageClient, TransportKind } from 'vscode-languageclient/node';
import { window, workspace, commands, ProgressLocation } from 'vscode';

// Helpers
import path from 'path';

// Model
import type { TextEditor, ExtensionContext } from 'vscode';
import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node';

// Local Internals
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

const reloadLanguageServer = () => {
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
};

// Events
const onFileFocused = async (editor: TextEditor | undefined) => {
	if (editor && editor.document.languageId === 'json' && window.activeTextEditor)
		await sendDocumentFocusedNotification(editor);
};

// Implementation
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

		// Commands
		context.subscriptions.push(commands.registerCommand('opusLanguageServer.reload', reloadLanguageServer ));
		
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
