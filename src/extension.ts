import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    // Configuração do Pyright como servidor
    const serverOptions: ServerOptions = {
        command: 'pyright-langserver',  // Executável do Pyright
        args: ['--stdio'],              // Configuração para comunicação por `stdio`
        transport: TransportKind.stdio
    };

    // Configurações para o cliente de linguagem
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'python' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.py')
        }
    };

    // Inicializa o cliente da linguagem
    client = new LanguageClient(
        'pyrightLanguageServer',
        'Pyright Language Server',
        serverOptions,
        clientOptions
    );

    client.start();  // Inicia o cliente
    context.subscriptions.push(client);
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();  // Encerra o cliente ao desativar
}
