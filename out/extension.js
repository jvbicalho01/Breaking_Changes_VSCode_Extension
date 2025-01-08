"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const node_1 = require("vscode-languageclient/node");
let client;
function activate(context) {
    // Configuração do Pyright como servidor
    const serverOptions = {
        command: 'pyright-langserver', // Executável do Pyright
        args: ['--stdio'], // Configuração para comunicação por `stdio`
        transport: node_1.TransportKind.stdio
    };
    // Configurações para o cliente de linguagem
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'python' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.py')
        }
    };
    // Inicializa o cliente da linguagem
    client = new node_1.LanguageClient('pyrightLanguageServer', 'Pyright Language Server', serverOptions, clientOptions);
    client.start(); // Inicia o cliente
    context.subscriptions.push(client);
}
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop(); // Encerra o cliente ao desativar
}
