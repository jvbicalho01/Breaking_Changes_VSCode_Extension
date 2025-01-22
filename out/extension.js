"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const node_1 = require("vscode-languageclient/node");
// Inicializando o cliente de linguagem para Pyright
let client;
function activate(context) {
    // Configuração do cliente de linguagem
    const serverOptions = {
        run: { command: 'pyright-langserver', transport: node_1.TransportKind.stdio },
        debug: { command: 'pyright-langserver', transport: node_1.TransportKind.stdio }
    };
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'python' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.py')
        }
    };
    // Criando o cliente de linguagem
    client = new node_1.LanguageClient('python', 'Python Language Server', serverOptions, clientOptions);
    // Iniciando o cliente
    client.start();
    // Registrando o provedor de hover
    const hoverProvider = vscode.languages.registerHoverProvider('python', {
        provideHover(document, position, token) {
            return __awaiter(this, void 0, void 0, function* () {
                const word = document.getText(document.getWordRangeAtPosition(position));
                // Enviando uma solicitação ao servidor de linguagem para obter a assinatura
                try {
                    const response = yield client.sendRequest('textDocument/hover', {
                        textDocument: { uri: document.uri.toString() },
                        position: { line: position.line, character: position.character }
                    });
                    if (response && response.contents) {
                        const hoverMessage = new vscode.MarkdownString();
                        // Adiciona o título "Assinatura"
                        hoverMessage.appendMarkdown('**Assinatura:**\n\n');
                        // Verifica o tipo de 'contents' e processa o retorno adequadamente
                        if (Array.isArray(response.contents)) {
                            response.contents.forEach((content) => {
                                const text = content.value || content;
                                console.log('Conteúdo capturado (Array):', text); // Exibe no console
                                hoverMessage.appendMarkdown(text);
                                hoverMessage.appendMarkdown('\n\n');
                            });
                        }
                        else if (typeof response.contents === 'object' && response.contents.value) {
                            console.log('Conteúdo capturado (Objeto):', response.contents.value); // Exibe no console
                            hoverMessage.appendMarkdown(response.contents.value);
                        }
                        else if (typeof response.contents === 'string') {
                            console.log('Conteúdo capturado (String):', response.contents); // Exibe no console
                            hoverMessage.appendText(response.contents);
                        }
                        return new vscode.Hover(hoverMessage);
                    }
                }
                catch (error) {
                    console.error('Erro ao processar hover:', error);
                }
            });
        }
    });
    context.subscriptions.push(hoverProvider);
}
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
