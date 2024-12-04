"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
function activate(context) {
    let disposable = vscode.languages.registerHoverProvider('python', {
        provideHover(document, position, token) {
            const range = document.getWordRangeAtPosition(position);
            const word = document.getText(range);
            // Simples lógica para capturar a linha atual
            const line = document.lineAt(position.line).text.trim();
            if (line.startsWith("def")) {
                // Aqui você pode analisar a linha para extrair informações
                return new vscode.Hover(`Função detectada: **${word}**`);
            }
            return undefined;
        }
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
