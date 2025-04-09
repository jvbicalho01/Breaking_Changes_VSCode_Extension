import * as vscode from 'vscode';

import { numpy_functions, pandas_functions, sklearn_functions, DABC_Functions } from './dabc_functions';

export function activate(context: vscode.ExtensionContext) {
    const decorationType = vscode.window.createTextEditorDecorationType({
        textDecoration: 'underline wavy',
        color: '#C00000'
    });

    function updateDecorations(editor: vscode.TextEditor) {
        if (!editor) {
            return;
        }

        const text = editor.document.getText();
        const functionCallRanges: vscode.Range[] = [];
        const functionCallPattern = /\b\w+\s*\(/g;
        let match;
        while ((match = functionCallPattern.exec(text)) !== null) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length - 1);
            const range = new vscode.Range(startPos, endPos);
            functionCallRanges.push(range);
        }

        editor.setDecorations(decorationType, functionCallRanges);
    }

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateDecorations(editor);
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
            updateDecorations(vscode.window.activeTextEditor);
        }
    }, null, context.subscriptions);

    const supportedLanguages = ['python'];
    supportedLanguages.forEach(language => {
        let disposable = vscode.languages.registerHoverProvider(language, {
            provideHover(document, position) {
                const wordRange = document.getWordRangeAtPosition(position, /\b\w+\b/);
                if (!wordRange) {
                    return;
                }

                const word = document.getText(wordRange);
                const line = document.lineAt(position).text;

                const functionCallRegex = new RegExp(`\\b${word}\\s*\\(([^)]*)\\)`);
                const match = line.match(functionCallRegex);

                if (match) {
                    const functionCall = match[0]; // Ex: multiplica(x=4, y=3)
                    const params = match[1];       // Ex: x=4, y=3

                    const paramList = params.split(',').map(param => param.trim()).filter(p => p);

                    let hoverText = `**Chamada de função:**\n\n\`\`\`python\n${functionCall}\n\`\`\``;
                    if (paramList.length > 0) {
                        hoverText += `\n\n**Parâmetros:**\n`;
                        paramList.forEach(param => {
                            hoverText += `- \`${param}\`\n`;
                        });
                    }

                    // ✅ Verificação adicional com numpy_functions
                    const foundInList = numpy_functions.some(f => f.method.includes(word));
                    if (foundInList) {
                        hoverText += `\n\n✅ **DABC:** função encontrada.`;
                    } else {
                        hoverText += `\n\n❌ **DABC:** função não encontrada.`;
                    }

                    return new vscode.Hover(hoverText);
                }
            }
        });

        context.subscriptions.push(disposable);
    });
}

export function deactivate() {}
