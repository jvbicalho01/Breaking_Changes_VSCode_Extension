import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';

// Inicializando o cliente de linguagem para Pyright
let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    // Configuração do cliente de linguagem
    const serverOptions: ServerOptions = {
        run: { command: 'pyright-langserver', transport: TransportKind.stdio },
        debug: { command: 'pyright-langserver', transport: TransportKind.stdio }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'python' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.py')
        }
    };

    // Criando o cliente de linguagem
    client = new LanguageClient('python', 'Python Language Server', serverOptions, clientOptions);

    // Iniciando o cliente
    client.start();

    // Registrando o provedor de hover
    const hoverProvider = vscode.languages.registerHoverProvider('python', {
        async provideHover(document, position, token) {
            const word = document.getText(document.getWordRangeAtPosition(position));

            // Enviando uma solicitação ao servidor de linguagem para obter a assinatura
            try {
                const response: any = await client.sendRequest('textDocument/hover', {
                    textDocument: { uri: document.uri.toString() },
                    position: { line: position.line, character: position.character }
                });

                if (response && response.contents) {
                    const hoverMessage = new vscode.MarkdownString();

                    // Adiciona o título "Assinatura"
                    hoverMessage.appendMarkdown('**Assinatura:**\n\n');

                    // Verifica o tipo de 'contents' e processa o retorno adequadamente
                    if (Array.isArray(response.contents)) {
                        response.contents.forEach((content: any) => {
                            const text = content.value || content;
                            console.log('Conteúdo capturado (Array):', text); // Exibe no console
                            hoverMessage.appendMarkdown(text);
                            hoverMessage.appendMarkdown('\n\n');
                        });
                    } else if (typeof response.contents === 'object' && response.contents.value) {
                        console.log('Conteúdo capturado (Objeto):', response.contents.value); // Exibe no console
                        hoverMessage.appendMarkdown(response.contents.value);
                    } else if (typeof response.contents === 'string') {
                        console.log('Conteúdo capturado (String):', response.contents); // Exibe no console
                        hoverMessage.appendText(response.contents);
                    }

                    return new vscode.Hover(hoverMessage);
                }
            } catch (error) {
                console.error('Erro ao processar hover:', error);
            }
        }
    });

    context.subscriptions.push(hoverProvider);
}

export function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
