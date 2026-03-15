import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem | undefined;

export function createStatusBar(): vscode.StatusBarItem {
    if (statusBarItem) {
        return statusBarItem;
    }

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'rtl-claude.status';
    statusBarItem.show();
    return statusBarItem;
}

export function updateStatusBar(state: 'applied' | 'not-applied' | 'no-claude-code'): void {
    if (!statusBarItem) {
        return;
    }

    switch (state) {
        case 'applied':
            statusBarItem.text = '$(check) RTL';
            statusBarItem.tooltip = 'RTL for Claude Code in VS: Active';
            statusBarItem.backgroundColor = undefined;
            break;
        case 'not-applied':
            statusBarItem.text = '$(circle-slash) RTL';
            statusBarItem.tooltip = 'RTL for Claude Code in VS: Not active (click to check)';
            statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            break;
        case 'no-claude-code':
            statusBarItem.text = '$(dash) RTL';
            statusBarItem.tooltip = 'RTL for Claude Code in VS: Claude Code not found';
            statusBarItem.backgroundColor = undefined;
            break;
    }
}

export function disposeStatusBar(): void {
    statusBarItem?.dispose();
    statusBarItem = undefined;
}
