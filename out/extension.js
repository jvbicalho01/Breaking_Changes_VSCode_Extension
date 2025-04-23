"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const dabc_functions_1 = require("./dabc_functions");
function activate(context) {
    const redUnderline = vscode.window.createTextEditorDecorationType({
        textDecoration: 'underline wavy red'
    });
    const greenUnderline = vscode.window.createTextEditorDecorationType({
        textDecoration: 'underline wavy green'
    });
    const all_functions = [
        ...dabc_functions_1.numpy_functions,
        ...dabc_functions_1.pandas_functions,
        ...dabc_functions_1.sklearn_functions
    ];
    function extractFunctionName(code) {
        const match = code.match(/\b(\w+)\s*\(/);
        return match ? match[1] : null;
    }
    function methodNameFromField(method) {
        const match = method.match(/\b(\w+)\s*\(/);
        return match ? match[1] : null;
    }
    function getFunctionInfo(name) {
        return all_functions.find(f => methodNameFromField(f.method) === name);
    }
    function getParamsFromField(param) {
        const match = param.match(/^\s*([\w_]+)/);
        return match ? match[1] : '';
    }
    function updateDecorations(editor) {
        if (!editor)
            return;
        const text = editor.document.getText();
        const functionCallPattern = /\b\w+\s*\(/g;
        const redRanges = [];
        let match;
        while ((match = functionCallPattern.exec(text)) !== null) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length - 1);
            const range = new vscode.Range(startPos, endPos);
            const functionName = extractFunctionName(match[0]);
            if (functionName && getFunctionInfo(functionName)) {
                redRanges.push(range);
            }
        }
        editor.setDecorations(redUnderline, redRanges);
        editor.setDecorations(greenUnderline, []);
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
                if (!wordRange)
                    return;
                const word = document.getText(wordRange);
                const line = document.lineAt(position).text;
                const functionCallRegex = new RegExp(`\\b${word}\\s*\\(([^)]*)\\)`);
                const match = line.match(functionCallRegex);
                if (match) {
                    const functionCall = match[0];
                    const params = match[1];
                    const paramList = params.split(',').map(p => p.split('=')[0].trim()).filter(p => p);
                    let hoverText = `**Chamada de função:**\n\n\`\`\`python\n${functionCall}\n\`\`\``;
                    if (paramList.length > 0) {
                        hoverText += `\n\n**Parâmetros passados:**\n`;
                        paramList.forEach(param => {
                            hoverText += `- \`${param}\`\n`;
                        });
                    }
                    const funcInfo = getFunctionInfo(word);
                    hoverText += `\n\n---\n\n**DABC:** ${funcInfo ? `função encontrada (${funcInfo.dabc_module})` : 'função não encontrada'}`;
                    if (funcInfo && funcInfo.param) {
                        const paramField = getParamsFromField(funcInfo.param);
                        if (paramField) {
                            if (paramList.includes(paramField)) {
                                hoverText += `\n\n✅ parâmetro \`${paramField}\` passado`;
                            }
                            else {
                                hoverText += `\n\n⚠️ parâmetro \`${paramField}\` não passado - potencial DABC encontrado`;
                            }
                        }
                    }
                    return new vscode.Hover(hoverText);
                }
            }
        });
        context.subscriptions.push(disposable);
    });
}
function deactivate() { }
