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

        const keywordsToExclude = ["const", "function", "async", "var", "console.log"];
        let inQuotes = false;
        let inComment = false;
        let pos = 0;

        while (pos < text.length) {
            let char = text[pos];

            // Handle comments
            if (text.substr(pos, 2) === '//' || text.substr(pos, 2) === '/*') {
                inComment = true;
            }
            if (inComment && text.substr(pos, 2) === '*/') {
                inComment = false;
                pos += 2;
                continue;
            }
            if (inComment && char === '\n') {
                inComment = false;
            }

            // Skip quoted text
            if (char === '\'' || char === '"' || char === '`') {
                inQuotes = !inQuotes;
            }

            if (!inQuotes && !inComment && /\w/.test(char)) { // Check if it's a word character and not in quotes or comments
                let startPos = editor.document.positionAt(pos);
                let wordEnd = pos;

                // Find the end of the word
                while (wordEnd < text.length && /\w/.test(text[wordEnd])) {
                    wordEnd++;
                }

                const word = text.substring(pos, wordEnd);

                if (word.length >= 3 && !keywordsToExclude.some(keyword => word.startsWith(keyword))) {
                    const length = word.length;
                    const boldEnd = pos + Math.ceil(length * percentageOfWord);

                    for (let i = 0; i < length; i++) {
                        const isCapitalLetter = /[A-Z]/.test(word[i]);
                        const shouldBeBold = i < boldEnd || isCapitalLetter;
                        if (shouldBeBold) {
                            const charStartPos = editor.document.positionAt(pos + i);
                            const charEndPos = editor.document.positionAt(pos + i + 1);
                            const range = new vscode.Range(charStartPos, charEndPos);
                            decorationsArray.push({ range });
                        }
                    }
                }

                pos = wordEnd;
            } else {
                pos++;
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
