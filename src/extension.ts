import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const emphasizeDecoration = vscode.window.createTextEditorDecorationType({
        fontWeight: 'bold'
    });

    const updateDecorations = (editor: vscode.TextEditor) => {
        if (!editor) {
            return;
        }

        const config = vscode.workspace.getConfiguration('bionic-reading');
        const percentageOfWord = config.get<number>('percentageOfWord', 0.5);
        const enabled = config.get<boolean>('enabled', true);

        if (!enabled) {
            editor.setDecorations(emphasizeDecoration, []);
            return;
        }

        const text = editor.document.getText();
        const decorationsArray: vscode.DecorationOptions[] = [];

        // const keywordsToExclude = ["const", "function", "async", "var", "console", "log"];
        const keywordsToExclude = [
            "const", "function", "async", "var", "console", "log",
            "let", "class", "import", "export", "new", "return", "if", "else",
            "switch", "case", "break", "continue", "for", "while", "do", "try",
            "catch", "finally", "throw", "typeof", "instanceof", "delete", "void",
            "this", "super", "extends", "await", "yield", "static", "get", "set",
            "require", "module", "exports", "process", "Buffer", "setTimeout",
            "setInterval", "clearTimeout", "clearInterval", "Math", "Date", "RegExp",
            "JSON", "eval", "parseInt", "parseFloat", "isNaN", "isFinite",
            "document", "window", "getElementById", "querySelector", "querySelectorAll",
            "addEventListener", "removeEventListener", "appendChild", "removeChild",
            "createElement", "innerHTML", "innerText", "textContent", "className", "id", "style",
            "forEach", "map", "filter", "reduce", "find", "findIndex", "every", "some",
            "slice", "splice", "concat", "push", "pop", "shift", "unshift", "join",
            "sort", "reverse", "includes", "indexOf", "lastIndexOf", "charAt",
            "charCodeAt", "endsWith", "startsWith", "substring", "toLowerCase", "toUpperCase",
            "trim", "trimStart", "trimEnd", "replace", "split",
            "backgroundColor", "href", "src", "alt", "title", "width", "height",
            "classList", "dataset", "offsetHeight", "offsetWidth", "clientHeight", "clientWidth",
            "in", "of", "from", "as", "default", "interface", "type", "enum",
            "namespace", "implements", "public", "private", "protected",
            "readonly", "declare"          
        ];
        const wordPattern = /\b\w+\b/g;
        const quotePattern = /(["'`]).*?\1/g;
        const commentPattern = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;

        let match;

        // Exclude comments and quoted text
        let excludedRanges: vscode.Range[] = [];

        while ((match = quotePattern.exec(text)) !== null) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            excludedRanges.push(new vscode.Range(startPos, endPos));
        }

        while ((match = commentPattern.exec(text)) !== null) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            excludedRanges.push(new vscode.Range(startPos, endPos));
        }

        const isExcluded = (pos: number) => {
            return excludedRanges.some(range => {
                const start = editor.document.offsetAt(range.start);
                const end = editor.document.offsetAt(range.end);
                return pos >= start && pos < end;
            });
        };

        while ((match = wordPattern.exec(text)) !== null) {
            const word = match[0];
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + word.length);

            if (isExcluded(match.index) || word.length < 3 || keywordsToExclude.includes(word)) {
                continue;
            }

            const length = word.length;
            const boldEndIndex = Math.ceil(length * percentageOfWord);

            for (let i = 0; i < length; i++) {
                const isCapitalLetter = /[A-Z]/.test(word[i]);
                const shouldBeBold = i < boldEndIndex || isCapitalLetter;
                if (shouldBeBold) {
                    const charStartPos = editor.document.positionAt(match.index + i);
                    const charEndPos = editor.document.positionAt(match.index + i + 1);
                    const range = new vscode.Range(charStartPos, charEndPos);
                    decorationsArray.push({ range });
                }
            }
        }

        editor.setDecorations(emphasizeDecoration, decorationsArray);
    };

    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        updateDecorations(activeEditor);
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

    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('bionic-reading')) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                updateDecorations(editor);
            }
        }
    });
}

export function deactivate() {}
