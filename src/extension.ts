import * as vscode from 'vscode';
import { numpy_functions, pandas_functions, sklearn_functions, DABC_Functions } from './dabc_functions';

export function activate(context: vscode.ExtensionContext) {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('dabc');
    context.subscriptions.push(diagnosticCollection);

    const all_functions: DABC_Functions[] = [
        ...numpy_functions.map(f => ({ ...f, library: 'numpy' })),
        ...pandas_functions.map(f => ({ ...f, library: 'pandas' })),
        ...sklearn_functions.map(f => ({ ...f, library: 'sklearn' }))
    ];

    function methodNameFromField(method: string): string | null {
        const match = method.match(/\b(\w+)\s*\(/);
        return match ? match[1] : null;
    }

    function getFunctionInfo(name: string): DABC_Functions | undefined {
        let func = all_functions.find(f => methodNameFromField(f.method) === name);

        if (func) return func;

        func = all_functions.find(f => {
            if (!f.class) return false;
            const className = f.class.split('(')[0].trim();
            return className === name && f.method.startsWith('__init__(');
        });

        return func;
    }

    function getMethodParams(method: string): string[] {
        const match = method.match(/\(([^)]*)\)/);
        if (!match) return [];

        return match[1]
            .split(',')
            .map(p => p.trim().split('=')[0].trim())
            .filter(p => p && !/^self$/i.test(p));
    }

    function getLibraryName(func: DABC_Functions): string {
        return func.library || 'biblioteca desconhecida';
    }

    function updateDiagnostics(editor: vscode.TextEditor) {
        if (!editor) return;

        const text = editor.document.getText();
        const functionCallPattern = /\b(?:\w+\.)?(\w+)\s*\(([^)]*)\)/g;
        const diagnostics: vscode.Diagnostic[] = [];

        let match;
        while ((match = functionCallPattern.exec(text)) !== null) {
            const functionName = match[1];
            const paramsInCall = match[2];

            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length - 1);
            const range = new vscode.Range(startPos, endPos);

            const funcInfo = getFunctionInfo(functionName);
            if (!funcInfo || !funcInfo.param) continue;

            const methodParams = getMethodParams(funcInfo.method);
            const methodParam = funcInfo.param.split(':')[0].trim();
            const passedParams: string[] = paramsInCall.match(/\b\w+(?=\s*=)/g) || [];
            const posParams = paramsInCall.split(',').map(p => p.trim()).filter(p => p && !p.includes('='));
            const methodParamIndex = methodParams.indexOf(methodParam);

            const wasPassed = passedParams.includes(methodParam) || (methodParamIndex >= 0 && posParams.length > methodParamIndex);

            if (!wasPassed) {
                const libName = getLibraryName(funcInfo);
                const msg = `[DABC] O valor-padrão do argumento "${methodParam}" foi redefinido na versão ${funcInfo.version}. ` +
                            `Atribua um valor a este argumento para evitar problemas com diferentes versões da biblioteca ${libName}.`;

                const diagnostic = new vscode.Diagnostic(
                    range,
                    msg,
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostic.source = 'DABC';
                diagnostics.push(diagnostic);
            }
        }

        diagnosticCollection.set(editor.document.uri, diagnostics);
    }

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateDiagnostics(editor);
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            updateDiagnostics(editor);
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
                    if (funcInfo?.param) {
                        const methodParams = getMethodParams(funcInfo.method);
                        const methodParam = funcInfo.param.split(':')[0].trim();
                        const passedParams: string[] = params.match(/\b\w+(?=\s*=)/g) || [];
                        const posParams = params.split(',').map(p => p.trim()).filter(p => p && !p.includes('='));
                        const methodParamIndex = methodParams.indexOf(methodParam);

                        const wasPassed = passedParams.includes(methodParam) || (methodParamIndex >= 0 && posParams.length > methodParamIndex);

                        if (!wasPassed) {
                            const libName = getLibraryName(funcInfo);

                            hoverText += `\n\n**[DABC]** O valor-padrão do argumento \`${methodParam}\` foi redefinido na versão \`${funcInfo.version}\`. ` +
                                         `Atribua um valor a este argumento para evitar problemas com diferentes versões da biblioteca \`${libName}\`.`;
                        }
                    }

                    return new vscode.Hover(hoverText);
                }
            }
        });

        context.subscriptions.push(disposable);
    });
}

export function deactivate() {}
