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
    function getMethodParams(method) {
        const match = method.match(/\(([^)]*)\)/);
        if (!match)
            return [];
        const paramsRaw = match[1]
            .split(',')
            .map(p => p.trim())
            .filter(p => p && !p.includes('=') && !/^self\s*$/i.test(p));
        const withDefaults = match[1]
            .split(',')
            .map(p => p.trim().split('=')[0].trim())
            .filter(p => p && !/^self$/i.test(p));
        return withDefaults;
    }
    function updateDecorations(editor) {
        if (!editor)
            return;
        const text = editor.document.getText();
        const functionCallPattern = /\b(?:\w+\.)?(\w+)\s*\(([^)]*)\)/g;
        const redRanges = [];
        let match;
        while ((match = functionCallPattern.exec(text)) !== null) {
            const fullMatch = match[0];
            const functionName = match[1];
            const paramsInCall = match[2];
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length - 1);
            const range = new vscode.Range(startPos, endPos);
            const funcInfo = getFunctionInfo(functionName);
            if (!funcInfo || !funcInfo.param)
                continue;
            const methodParams = getMethodParams(funcInfo.method);
            const methodParam = funcInfo.param.split(':')[0].trim();
            const passedParams = paramsInCall.match(/\b\w+(?=\s*=)/g) || [];
            // Identifica chamada posicional
            const posParams = paramsInCall.split(',').map(p => p.trim()).filter(p => p && !p.includes('='));
            const methodParamIndex = methodParams.indexOf(methodParam);
            const wasPassed = passedParams.includes(methodParam) || (methodParamIndex >= 0 && posParams.length > methodParamIndex);
            if (!wasPassed) {
                redRanges.push(range);
            }
        }
        editor.setDecorations(redUnderline, redRanges);
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
                    const paramList = params.split(',').map(p => p.trim()).filter(p => p);
                    let hoverText = `**Chamada de função:**\n\n\`\`\`python\n${functionCall}\n\`\`\``;
                    if (paramList.length > 0) {
                        hoverText += `\n\n**Parâmetros:**\n`;
                        paramList.forEach(param => {
                            hoverText += `- \`${param}\`\n`;
                        });
                    }
                    const funcInfo = getFunctionInfo(word);
                    hoverText += `\n\n---\n\n**DABC:** ${funcInfo ? `função encontrada` : 'função não encontrada'}`;
                    if (funcInfo === null || funcInfo === void 0 ? void 0 : funcInfo.param) {
                        const methodParams = getMethodParams(funcInfo.method);
                        const methodParam = funcInfo.param.split(':')[0].trim();
                        const passedParams = params.match(/\b\w+(?=\s*=)/g) || [];
                        const posParams = params.split(',').map(p => p.trim()).filter(p => p && !p.includes('='));
                        const methodParamIndex = methodParams.indexOf(methodParam);
                        if (passedParams.includes(methodParam)) {
                            hoverText += `\n\n✅ parâmetro \`${methodParam}\` passado`;
                        }
                        else if (methodParamIndex >= 0 && posParams.length > methodParamIndex) {
                            hoverText += `\n\n✅ parâmetro \`${methodParam}\` passado (forma posicional)`;
                        }
                        else {
                            hoverText += `\n\n⚠️ parâmetro \`${methodParam}\` não passado - potencial DABC encontrado (${funcInfo.dabc_module})`;
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
