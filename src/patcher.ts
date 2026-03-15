import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { PATCH_MARKER, JS_PATCH, CSS_PATCH } from './constants';

interface ClaudeCodePaths {
    extensionPath: string;
    jsPath: string;
    cssPath: string;
}

/**
 * Locate Claude Code's webview files across platforms.
 */
export function findClaudeCode(): ClaudeCodePaths | null {
    const ext = vscode.extensions.getExtension('Anthropic.claude-code');
    if (!ext) {
        return null;
    }

    const webviewDir = path.join(ext.extensionPath, 'webview');
    const jsPath = path.join(webviewDir, 'index.js');
    const cssPath = path.join(webviewDir, 'index.css');

    if (!fs.existsSync(jsPath) || !fs.existsSync(cssPath)) {
        return null;
    }

    return {
        extensionPath: ext.extensionPath,
        jsPath,
        cssPath,
    };
}

/**
 * Check if the RTL patch is currently applied.
 */
export function isPatchApplied(paths: ClaudeCodePaths): { js: boolean; css: boolean } {
    const jsContent = fs.readFileSync(paths.jsPath, 'utf-8');
    const cssContent = fs.readFileSync(paths.cssPath, 'utf-8');

    return {
        js: jsContent.includes(PATCH_MARKER),
        css: cssContent.includes(PATCH_MARKER),
    };
}

/**
 * Apply RTL patch to Claude Code's webview files.
 * Returns true if patch was applied, false if already applied.
 */
export async function applyPatch(paths: ClaudeCodePaths): Promise<boolean> {
    const status = isPatchApplied(paths);

    if (status.js && status.css) {
        return false; // Already applied
    }

    try {
        if (!status.js) {
            const jsContent = fs.readFileSync(paths.jsPath, 'utf-8');
            fs.writeFileSync(paths.jsPath, jsContent + JS_PATCH, 'utf-8');
        }

        if (!status.css) {
            const cssContent = fs.readFileSync(paths.cssPath, 'utf-8');
            fs.writeFileSync(paths.cssPath, cssContent + CSS_PATCH, 'utf-8');
        }

        return true;
    } catch (err: any) {
        if (err.code === 'EACCES' || err.code === 'EPERM') {
            throw new Error(
                'Permission denied. On macOS/Linux, you may need to run VS Code with elevated permissions once, or adjust file ownership.'
            );
        }
        throw err;
    }
}

/**
 * Remove RTL patch from Claude Code's webview files.
 * Returns true if patch was removed, false if not present.
 */
export async function removePatch(paths: ClaudeCodePaths): Promise<boolean> {
    const status = isPatchApplied(paths);

    if (!status.js && !status.css) {
        return false; // Nothing to remove
    }

    if (status.js) {
        const jsContent = fs.readFileSync(paths.jsPath, 'utf-8');
        const markerIndex = jsContent.indexOf(`\n${PATCH_MARKER}`);
        if (markerIndex !== -1) {
            fs.writeFileSync(paths.jsPath, jsContent.substring(0, markerIndex), 'utf-8');
        }
    }

    if (status.css) {
        const cssContent = fs.readFileSync(paths.cssPath, 'utf-8');
        const markerIndex = cssContent.indexOf(`\n${PATCH_MARKER}`);
        if (markerIndex !== -1) {
            fs.writeFileSync(paths.cssPath, cssContent.substring(0, markerIndex), 'utf-8');
        }
    }

    return true;
}
