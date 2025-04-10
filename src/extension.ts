import * as vscode from 'vscode';

import { numpy_functions, pandas_functions, sklearn_functions, DABC_Functions } from './dabc_functions';

export function activate(context: vscode.ExtensionContext) {
    const redUnderline = vscode.window.createTextEditorDecorationType({
        textDecoration: 'underline wavy red'
    });

    const greenUnderline = vscode.window.createTextEditorDecorationType({
        textDecoration: 'underline wavy green'
    });

    const all_functions: DABC_Functions[] = [
        ...numpy_functions,
        ...pandas_functions,
        ...sklearn_functions
    ];

    function extractFunctionName(code: string): string | null {
        const match = code.match(/\b(\w+)\s*\(/);
        return match ? match[1] : null;
    }

    function methodNameFromField(method: string): string | null {
        const match = method.match(/\b(\w+)\s*\(/);
        return match ? match[1] : null;
    }

    function getFunctionInfo(name: string): DABC_Functions | undefined {
        return all_functions.find(f => methodNameFromField(f.method) === name);
    }

    function updateDecorations(editor: vscode.TextEditor) {
        if (!editor) return;

        const text = editor.document.getText();
        const functionCallPattern = /\b\w+\s*\(/g;
        const redRanges: vscode.Range[] = [];
        const greenRanges: vscode.Range[] = [];

        let match;
        while ((match = functionCallPattern.exec(text)) !== null) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length - 1);
            const range = new vscode.Range(startPos, endPos);

            const functionName = extractFunctionName(match[0]);
            if (functionName && getFunctionInfo(functionName)) {
                redRanges.push(range);
            } else {
                greenRanges.push(range);
            }
        }

        editor.setDecorations(redUnderline, redRanges);
        editor.setDecorations(greenUnderline, greenRanges);
    }

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateDecorations(editor);
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            updateDecorations(editor);
        }
    }, null, context.subscriptions);

    const supportedLanguages = ['python'];
    supportedLanguages.forEach(language => {
        const disposable = vscode.languages.registerHoverProvider(language, {
            provideHover(document, position) {
                const wordRange = document.getWordRangeAtPosition(position, /\b\w+\b/);
                if (!wordRange) return;

                const word = document.getText(wordRange);
                const line = document.lineAt(position).text;
                const functionCallRegex = new RegExp(`\\b${word}\\s*\\(([^)]*)\\)`);
                const match = line.match(functionCallRegex);

                if (match) {
                    const functionCall = match[0];
                    const params = match[1];
                    const paramList = params.split(',').map(p => p.trim()).filter(p => p);

                    let hoverText = `**Chamada de função:**\n\n\`\`\`python\n${functionCall}\n\`\`\``;
                    if (paramList.length > 0) {
                        hoverText += `\n\n**Parâmetros:**\n`;
                        paramList.forEach(param => {
                            hoverText += `- \`${param}\`\n`;
                        });
                    }

                    const funcInfo = getFunctionInfo(word);
                    hoverText += `\n\n---\n\n**DABC:** ${funcInfo ? `função encontrada (${funcInfo.dabc_module})` : 'função não encontrada'}`;

                    return new vscode.Hover(hoverText);
                }
            }
        });

        context.subscriptions.push(disposable);
    });
}

export function deactivate() {}
