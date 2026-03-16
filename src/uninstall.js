// Runs when the extension is uninstalled (via package.json scripts.vscode:uninstall)
const fs = require('fs');
const path = require('path');
const os = require('os');

const extDir = path.join(os.homedir(), '.vscode', 'extensions');
try {
    const dirs = fs.readdirSync(extDir).filter(d => d.startsWith('anthropic.claude-code'));
    dirs.sort().reverse();
    for (const dir of dirs) {
        const webview = path.join(extDir, dir, 'webview');
        const cssBackup = path.join(webview, 'index.css.rtl-backup');
        const jsBackup = path.join(webview, 'index.js.rtl-backup');
        const cssFile = path.join(webview, 'index.css');
        const jsFile = path.join(webview, 'index.js');

        // Restore from clean backup if exists
        if (fs.existsSync(cssBackup)) {
            const backup = fs.readFileSync(cssBackup, 'utf8');
            if (!backup.includes('RTL-for-Claude-Code')) {
                fs.copyFileSync(cssBackup, cssFile);
            } else {
                // Backup is contaminated, strip patch manually
                stripPatch(cssFile);
            }
            fs.unlinkSync(cssBackup);
        } else {
            stripPatch(cssFile);
        }

        if (fs.existsSync(jsBackup)) {
            const backup = fs.readFileSync(jsBackup, 'utf8');
            if (!backup.includes('RTL-for-Claude-Code')) {
                fs.copyFileSync(jsBackup, jsFile);
            } else {
                stripPatch(jsFile);
            }
            fs.unlinkSync(jsBackup);
        } else {
            stripPatch(jsFile);
        }
    }
} catch (e) {
    // Silently fail - don't block uninstall
}

function stripPatch(filePath) {
    try {
        if (!fs.existsSync(filePath)) return;
        let content = fs.readFileSync(filePath, 'utf8');
        const marker = content.indexOf('/* RTL-for-Claude-Code */');
        if (marker > 0) {
            const cleanEnd = content.lastIndexOf('\n', marker);
            content = content.substring(0, cleanEnd);
            fs.writeFileSync(filePath, content, 'utf8');
        }
    } catch (e) {
        // Silently fail
    }
}
