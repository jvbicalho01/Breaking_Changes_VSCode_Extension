import * as vscode from 'vscode';
import { spawn } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    // Define o estilo de sublinhado para as chamadas de função
    const decorationType = vscode.window.createTextEditorDecorationType({
        textDecoration: 'underline wavy',
        color: '#C00000'  // Cor do sublinhado
    });

    // Função para atualizar as decorações em um documento
    function updateDecorations(editor: vscode.TextEditor) {
        if (!editor) {
            return;
        }

        const text = editor.document.getText();
        const functionCallRanges: vscode.Range[] = [];

        // Regex para encontrar chamadas de função no texto
        const functionCallPattern = /\b\w+\s*\(/g;
        let match;
        while ((match = functionCallPattern.exec(text)) !== null) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length - 1); // Exclui '('
            const range = new vscode.Range(startPos, endPos);
            functionCallRanges.push(range);
        }

        // Aplica as decorações encontradas
        editor.setDecorations(decorationType, functionCallRanges);
    }

    // Atualiza as decorações quando o editor é aberto ou o documento é alterado
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

    // Atualiza as decorações no editor atual ao ativar a extensão
    if (vscode.window.activeTextEditor) {
        updateDecorations(vscode.window.activeTextEditor);
    }

    // Hover Provider para exibir informações ao passar o mouse
    const supportedLanguages = ['python'];  // Adicione outras linguagens se necessário

    supportedLanguages.forEach(language => {
        let disposable = vscode.languages.registerHoverProvider(language, {
            provideHover(document, position) {
                const wordRange = document.getWordRangeAtPosition(position, /\b\w+\b/);
                if (!wordRange) {
                    return;
                }

                const word = document.getText(wordRange);
                const line = document.lineAt(position).text;

                // Verifica se a palavra é uma chamada de função
                const isFunctionCall = new RegExp(`\\b${word}\\s*\\(`).test(line);
                if (isFunctionCall) {
                    // Chama o script Python para obter a assinatura da função
                    const lineNum = position.line + 1;  // Ajuste para base 1
                    const colNum = position.character + 1;

                    return new Promise<vscode.Hover>((resolve, reject) => {
                        console.log('Chamando o script Python...');
                        const pythonPath = context.asAbsolutePath('src/jedi_server.py');
                        console.log('Caminho para o script Python:', pythonPath);
                        
                        const pythonProcess = spawn('python', [pythonPath, lineNum.toString(), colNum.toString()]);
                        const code = document.getText();
                        pythonProcess.stdin.write(code);
                        pythonProcess.stdin.end();

                        pythonProcess.stdout.on('data', (data) => {
                            console.log('Jedi Output:', data.toString());  // Log de saída do Jedi
                            const signature = data.toString().trim();
                            resolve(new vscode.Hover(`**Função:** \`${word}\`\n\n**Assinatura:** ${signature}`));
                        });

                        pythonProcess.stderr.on('data', (data) => {
                            console.error('Jedi Error:', data.toString());  // Log de erro do Jedi
                            reject(new vscode.Hover(`Erro: ${data.toString()}`));
                        });
                    });
                }
            }
        });

        context.subscriptions.push(disposable);
    });
}

export function deactivate() {}
