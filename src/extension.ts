import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Registrar um comando que será executado ao abrir o arquivo
    let disposable = vscode.commands.registerCommand('extension.breakingChange', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const text = document.getText();
        const diagnostics: vscode.Diagnostic[] = [];

        const functionCallRegex = /\b\w+\s*\(.*?\)/g;
        let match;
        while ((match = functionCallRegex.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);

            const diagnostic = new vscode.Diagnostic(range, `Função chamada: ${match[0]}`, vscode.DiagnosticSeverity.Warning);
            diagnostics.push(diagnostic);
        }

        const diagnosticCollection = vscode.languages.createDiagnosticCollection('breakingChanges');
        diagnosticCollection.set(document.uri, diagnostics);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
