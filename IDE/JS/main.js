const textarea=document.getElementById('code-input');
const codeBlock=document.getElementById('code-highlight');
textarea.addEventListener('input',function(){
    const code=this.value;
    const highlighted=hljs.highlight(code,{language:'cpp'}).value;
    codeBlock.innerHTML=highlighted;
});
textarea.dispatchEvent(new Event('input'));
textarea.addEventListener('scroll',function(){
    const pre=document.querySelector('.code-display');
    pre.scrollTop=this.scrollTop;
    pre.scrollLeft=this.scrollLeft;
});
async function preCacheWasm() {
    const basePath = './node_modules/browsercc/dist/';
    const files = ['clang.wasm', 'lld.wasm', 'sysroot.tar'];
    
    try {
        const cache = await caches.open('browsercc-cache');
        const cacheKeys = await cache.keys();
        const alreadyCached = files.every(file => cacheKeys.some(req => req.url.endsWith(file)));
        if (alreadyCached) {
            console.log('WASM 文件已在缓存中，无需重复下载');
            return;
        }
        await Promise.all(files.map(async (file) => {
            const url = basePath + file;
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) throw new Error(`Failed to fetch ${file}`);
            await cache.put(url, response);
        }));
        console.log('WASM 文件预缓存完成');
    } catch (e) {
        console.warn('预缓存失败:', e);
    }
}

if ('requestIdleCallback' in window) {
    requestIdleCallback(preCacheWasm);
} else {
    setTimeout(preCacheWasm, 1000);
}

import { compile } from 'browsercc';
import { WASI, File, OpenFile, ConsoleStdout } from '@bjorn3/browser_wasi_shim';

async function runCpp(code, stdinContent = '') {
    const { module, compileOutput } = await compile({
        source: code,
        fileName: 'main.cpp',
        flags: ['-std=c++17', '-fno-exceptions']
    });

    if (!module) {
        return { output: compileOutput || '编译失败，未生成模块', error: true };
    }
    const stdin = new TextEncoder().encode(stdinContent || '');
    let output = '';
    const stdoutCallback = (data) => {
        output += new TextDecoder().decode(data);
    };
    const stderrCallback = (data) => {
        output += new TextDecoder().decode(data);
    };
    const fds = [
        new OpenFile(new File(stdin)),
        new ConsoleStdout(stdoutCallback),
        new ConsoleStdout(stderrCallback),
    ];
    const wasi = new WASI([], [], fds);
    const instance = await WebAssembly.instantiate(module, {
        'wasi_snapshot_preview1': wasi.wasiImport,
    });
    wasi.start(instance);
    return { output: output, error: false };
}
document.getElementById('run-btn').addEventListener('click', async () => {
    const code = document.getElementById('code-input').value;
    const stdin = document.getElementById('stdin-input').value;
    const outputElem = document.getElementById('output');
    outputElem.textContent = 'Compiling...';
    outputElem.style.color = '#ffdd00';
    const result = await runCpp(code, stdin);
    outputElem.textContent = result.output;
    outputElem.style.color = result.error ? '#ff4444' : '#d4d4d4';
});
function getLineIndent(text, pos) {
    let start = pos;
    while (start > 0 && text[start - 1] !== '\n') start--;
    const line = text.substring(start, pos);
    const match = line.match(/^\s*/);
    return match ? match[0] : '';
}
function insertText(textarea, text, cursorOffset = 0) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    const newValue = before + text + after;
    textarea.value = newValue;
    const newPos = start + text.length + cursorOffset;
    textarea.selectionStart = textarea.selectionEnd = newPos;
    textarea.dispatchEvent(new Event('input'));
}
function hasSelection(textarea) {
    return textarea.selectionStart !== textarea.selectionEnd;
}
textarea.addEventListener('keydown', function(e) {
    if (e.isComposing) return;
    const key = e.key;
    const value = this.value;
    const start = this.selectionStart;
    const end = this.selectionEnd;
    if (key === 'Tab') {
        e.preventDefault();
        const indent = '    ';
        insertText(this, indent);
        return;
    }
    if (key === 'Enter') {
        e.preventDefault();
        const left = value[start - 1];
        const right = value[start];
        if ((left === '(' && right === ')') ||
            (left === '[' && right === ']') ||
            (left === '{' && right === '}')) {
            e.preventDefault();
            const indent = getLineIndent(value, start);
            insertText(this, '\n' + indent + '    ' + '\n' + indent, -1-indent.length);
            return;
        }
        else{
            const indent = getLineIndent(value, start);
            insertText(this, '\n' + indent);
        }
        return;
    }
    const pairs = {
        '(': ')',
        '[': ']',
        '{': '}',
        "'": "'",
        '"': '"'
    };
    if (pairs.hasOwnProperty(key)) {
        if (hasSelection(this)) {
            e.preventDefault();
            const selected = value.substring(start, end);
            const newText = key + selected + pairs[key];
            const before = value.substring(0, start);
            const after = value.substring(end);
            this.value = before + newText + after;
            this.selectionStart = start + 1;
            this.selectionEnd = end + 1;
            this.dispatchEvent(new Event('input'));
            return;
        } else {
            e.preventDefault();
            const pair = key + pairs[key];
            insertText(this, pair, -1);
            return;
        }
    }
    if (key === 'Backspace') {
        if (start === end && start > 0 && start < value.length) {
            const left = value[start - 1];
            const right = value[start];
            if ((left === '(' && right === ')') ||
                (left === '[' && right === ']') ||
                (left === '{' && right === '}') ||
                (left === "'" && right === "'") ||
                (left === '"' && right === '"')) {
                e.preventDefault();
                const before = value.substring(0, start - 1);
                const after = value.substring(start + 1);
                this.value = before + after;
                this.selectionStart = this.selectionEnd = start - 1;
                this.dispatchEvent(new Event('input'));
                return;
            }
        }
    }
    const rightKeys = { ')': '(', ']': '[', '}': '{' };
    if (rightKeys.hasOwnProperty(key)) {
        if (start === end && start < value.length && value[start] === key) {
            e.preventDefault();
            this.selectionStart = this.selectionEnd = start + 1;
            return;
        }
    }
});