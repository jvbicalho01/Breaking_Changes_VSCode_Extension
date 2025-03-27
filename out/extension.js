"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const numpy_functions = [
    { 'id': 0,
        'dabc_msg': 'Previously, the default was documented to be -1, but that was in error. At some future date, the default will change to -1, as originally intended. Until then, the axis should be given explicitly when ``arr.ndim > 1``, to avoid a FutureWarning.',
        'version': '1.13.0',
        'class': 'MaskedArrayFutureWarning(FutureWarning)',
        'method': 'def argsort(self,axis=np._NoValue,kind=None,order=None,endwith=True,fill_value=None)',
        'param': 'axis : int',
        'default': 'np._NoValue',
        'dabc_module': 'Masked Arrays',
        'reason': 'Maintainability',
        'effect': 'Behavior' },
    { 'id': 1,
        'dabc_msg': 'Made default False in response to CVE-2019-6446.',
        'version': '1.16.3',
        'class': ' NpzFile(Mapping)',
        'method': 'def __init__(self,fid,own_fid=False,allow_pickle=False,pickle_kwargs=None, *,max_header_size=format._MAX_HEADER_SIZE)',
        'param': 'allow_pickle: bool',
        'default': 'False',
        'dabc_module': 'General Functions',
        'reason': 'Bug Fixing',
        'effect': 'Behavior' },
    { 'id': 2,
        'dabc_msg': 'Made default False in response to CVE-2019-6446.',
        'version': '1.16.3',
        'class': 'NpzFile(Mapping)',
        'method': "def load(file,mmap_mode=None,allow_pickle=False,fix_imports=True,encoding='ASCII',*,max_header_size=format._MAX_HEADER_SIZE)",
        'param': 'allow_pickle: bool',
        'default': 'False',
        'dabc_module': 'General Functions',
        'reason': 'Bug Fixing',
        'effect': 'Behavior' },
    { 'id': 3,
        'dabc_msg': 'Made default False in response to CVE-2019-6446.',
        'version': '1.16.3',
        'class': 'NA',
        'method': 'def read_array(fp,allow_pickle=False,pickle_kwargs=None,*,max_header_size=_MAX_HEADER_SIZE)',
        'param': 'allow_pickle : bool',
        'default': 'False',
        'dabc_module': 'General Functions',
        'reason': 'Bug Fixing',
        'effect': 'Behavior' },
    { 'id': 4,
        'dabc_msg': 'If not set, a FutureWarning is given. The previous default of ``-1`` will use the machine precision as `rcond` parameter, the new default will use the machine precision times `max(M, N)`. To silence the warning and use the new default, use ``rcond=None``, to keep using the old behavior, use ``rcond=-1``',
        'version': '1.14.0',
        'class': 'NA',
        'method': 'def lstsq(a,b,rcond="warn")',
        'param': 'rcond : float',
        'default': '"warn"',
        'dabc_module': 'Linear Algebra',
        'reason': 'API Compatibility',
        'effect': 'Performance' }
];
const pandas_functions = [
    { 'id': 1,
        'dabc_msg': 'Default value is changed to ``True``. Google has deprecated the ``auth_local_webserver = False`` `"out of band" (copy-paste) flow <https://developers.googleblog.com/2022/02/making-oauth-flows-safer.html?m=1#disallowed-oob>`_.',
        'version': '1.5.2000',
        'class': 'DataFrame(NDFrame, OpsMixin)',
        'method': 'method: def to_gbq(self,destination_table,project_id = None,chunksize = None,reauth = False,if_exists = "fail",auth_local_webserver = True,table_schema = None,location = None,progress_bar = True,credentials=None)',
        'param': 'auth_local_webserver : bool',
        'default': 'True',
        'dabc_module': 'DataFrame',
        'reason': 'API Simplification',
        'effect': 'Behaviour' },
    { 'id': 2,
        'dabc_msg': 'Default value is changed to ``True``. Google has deprecated the ``auth_local_webserver = False`` `"out of band" (copy-paste) flow <https://developers.googleblog.com/2022/02/making-oauth-flows-safer.html?m=1#disallowed-oob>`_.',
        'version': '1.5.2000',
        'class': 'NA',
        'method': 'def read_gbq(query,project_id = None,index_col = None,col_order = None,reauth = False,auth_local_webserver = True,dialect = None,location = None,configuration = None,credentials=None,use_bqstorage_api = None,max_results = None,progress_bar_type = None)',
        'param': 'auth_local_webserver : bool',
        'default': 'True',
        'dabc_module': 'Input/Output',
        'reason': 'New Feature',
        'effect': 'Behaviour' },
    { 'id': 3,
        'dabc_msg': 'Changed to not sort by default. ',
        'version': '1.0.0',
        'class': 'NA',
        'method': 'def concat(objs,axis = 0,join = "outer",ignore_index = False,keys=None,levels=None,names=None,verify_integrity = False,sort = False,copy = True)',
        'param': 'sort : bool',
        'default': 'False',
        'dabc_module': 'General Functions',
        'reason': 'nan',
        'effect': 'Aesthetics' },
    { 'id': 4,
        'dabc_msg': 'Changed to not sort by default.',
        'version': '1.0.0',
        'class': ' DataFrame(NDFrame, OpsMixin)',
        'method': 'def append(self,other,ignore_index = False,verify_integrity = False,sort = False)',
        'param': 'sort : bool',
        'default': 'False',
        'dabc_module': 'DataFrame',
        'reason': 'Maintainability',
        'effect': 'Aesthetics' },
    { 'id': 5,
        'dabc_msg': "Not applicable for ``orient='table'``.",
        'version': '0.25.0',
        'class': 'NA',
        'method': 'def read_json(path_or_buf,orient = None,typ = "frame",dtype = None,convert_axes=None,convert_dates = True,keep_default_dates = True,numpy = False,precise_float = False,date_unit = None,encoding = None,encoding_errors = "strict",lines = False,chunksize = None,compression = "infer",nrows = None,storage_options = None)',
        'param': 'convert_axes : bool',
        'default': 'None',
        'dabc_module': 'Input/Output',
        'reason': 'Maintainability',
        'effect': 'Aesthetics' }
];
const sklearn_functions = [];
function activate(context) {
    const decorationType = vscode.window.createTextEditorDecorationType({
        textDecoration: 'underline wavy',
        color: '#C00000'
    });
    function updateDecorations(editor) {
        if (!editor) {
            return;
        }
        const text = editor.document.getText();
        const functionCallRanges = [];
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
                    const functionCall = match[0]; // Exemplo: multiplica(x=4, y=3)
                    const params = match[1]; // Exemplo: x=4, y=3
                    // Separar parâmetros individualmente
                    const paramList = params.split(',').map(param => param.trim()).filter(p => p);
                    let hoverText = `**Chamada de função:**\n\n\`\`\`python\n${functionCall}\n\`\`\``;
                    if (paramList.length > 0) {
                        hoverText += `\n\n**Parâmetros:**\n`;
                        paramList.forEach(param => {
                            hoverText += `- \`${param}\`\n`;
                        });
                    }
                    return new vscode.Hover(hoverText);
                }
            }
        });
        context.subscriptions.push(disposable);
    });
}
function deactivate() { }
