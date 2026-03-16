import * as vscode from 'vscode';
import * as path from 'path';
import { findClaudeCode, applyPatch, removePatch, isPatchApplied } from './patcher';
import { createStatusBar, updateStatusBar, disposeStatusBar } from './statusBar';

let fileWatcher: vscode.FileSystemWatcher | undefined;

export function activate(context: vscode.ExtensionContext): void {
    createStatusBar();

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('rtl-claude.apply', cmdApply),
        vscode.commands.registerCommand('rtl-claude.remove', cmdRemove),
        vscode.commands.registerCommand('rtl-claude.status', cmdStatus),
    );

    // Listen for extension changes (Claude Code install/update/uninstall)
    context.subscriptions.push(
        vscode.extensions.onDidChange(() => {
            refreshState();
        })
    );

    // Initial check on startup
    refreshState();
}

export function deactivate(): void {
    fileWatcher?.dispose();
    fileWatcher = undefined;
    disposeStatusBar();
    // Patch cleanup is handled by vscode:uninstall script, not here.
    // deactivate() runs on every reload - removing patch here would cause an infinite loop.
}

/**
 * Refresh patch state: auto-apply if enabled, update status bar, set up file watcher.
 */
async function refreshState(): Promise<void> {
    const paths = findClaudeCode();

    if (!paths) {
        updateStatusBar('no-claude-code');
        fileWatcher?.dispose();
        fileWatcher = undefined;
        return;
    }

    // Set up file watcher on the webview directory to detect updates
    setupFileWatcher(paths.extensionPath);

    const status = isPatchApplied(paths);
    const fullyApplied = status.js && status.css;

    if (fullyApplied) {
        updateStatusBar('applied');
        return;
    }

    // Auto-apply if setting is enabled
    const autoApply = vscode.workspace.getConfiguration('rtlForClaudeCode').get<boolean>('autoApply', true);

    if (autoApply) {
        try {
            const applied = await applyPatch(paths);
            updateStatusBar('applied');
            if (applied) {
                promptReload('RTL for Claude Code in VS: Patch applied (JS + CSS).');
            }
        } catch (err: any) {
            updateStatusBar('not-applied');
            vscode.window.showErrorMessage(`RTL for Claude Code in VS: ${err.message}`);
        }
    } else {
        updateStatusBar('not-applied');
    }
}

/**
 * Watch the webview directory for file changes (Claude Code updates overwrite these files).
 */
function setupFileWatcher(extensionPath: string): void {
    fileWatcher?.dispose();

    const webviewPattern = new vscode.RelativePattern(
        path.join(extensionPath, 'webview'),
        'index.{js,css}'
    );

    fileWatcher = vscode.workspace.createFileSystemWatcher(webviewPattern);

    fileWatcher.onDidChange(() => {
        // File changed -- Claude Code may have updated. Re-check and re-apply.
        setTimeout(() => refreshState(), 1000);
    });
}

/**
 * Prompt user to reload window for changes to take effect.
 */
function promptReload(message: string): void {
    vscode.window
        .showInformationMessage(message + ' Reload window to apply changes.', 'Reload')
        .then((choice) => {
            if (choice === 'Reload') {
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
        });
}

// ---- Commands ----

async function cmdApply(): Promise<void> {
    const paths = findClaudeCode();
    if (!paths) {
        vscode.window.showWarningMessage('RTL for Claude Code in VS: Claude Code extension not found.');
        return;
    }

    try {
        const applied = await applyPatch(paths);
        if (applied) {
            updateStatusBar('applied');
            promptReload('RTL for Claude Code in VS is active.');
        } else {
            updateStatusBar('applied');
            vscode.window.showInformationMessage('RTL for Claude Code in VS: RTL is already active.');
        }
    } catch (err: any) {
        vscode.window.showErrorMessage(`RTL for Claude Code in VS: ${err.message}`);
    }
}

async function cmdRemove(): Promise<void> {
    const paths = findClaudeCode();
    if (!paths) {
        vscode.window.showWarningMessage('RTL for Claude Code in VS: Claude Code extension not found.');
        return;
    }

    try {
        const removed = await removePatch(paths);
        if (removed) {
            updateStatusBar('not-applied');
            promptReload('RTL for Claude Code in VS has been disabled.');
        } else {
            updateStatusBar('not-applied');
            vscode.window.showInformationMessage('RTL for Claude Code in VS: RTL is not currently active.');
        }
    } catch (err: any) {
        vscode.window.showErrorMessage(`RTL for Claude Code in VS: ${err.message}`);
    }
}

async function cmdStatus(): Promise<void> {
    const paths = findClaudeCode();
    if (!paths) {
        vscode.window.showInformationMessage('RTL for Claude Code in VS: Claude Code extension is not installed.');
        updateStatusBar('no-claude-code');
        return;
    }

    const status = isPatchApplied(paths);

    if (status.js && status.css) {
        vscode.window.showInformationMessage('RTL for Claude Code in VS: RTL is active.');
        updateStatusBar('applied');
    } else if (status.js || status.css) {
        const partial = status.js ? 'JS only' : 'CSS only';
        const action = await vscode.window.showWarningMessage(
            `RTL for Claude Code in VS: Partial RTL detected (${partial}). Re-apply?`,
            'Re-apply'
        );
        if (action === 'Re-apply') {
            await cmdApply();
        }
    } else {
        const action = await vscode.window.showWarningMessage(
            'RTL for Claude Code in VS: RTL is not active.',
            'Apply Now'
        );
        if (action === 'Apply Now') {
            await cmdApply();
        }
        updateStatusBar('not-applied');
    }
}
