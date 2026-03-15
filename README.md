# RTL for Claude Code

Adds right-to-left (RTL) text support to the [Claude Code](https://marketplace.visualstudio.com/items?itemName=anthropics.claude-code) VS Code extension. Enables proper display and input of Hebrew, Arabic, and Persian text.

## Features

- **Input field RTL** -- Type Hebrew, Arabic, or Persian directly in the Claude Code input. Both the editable field and the visible overlay are patched.
- **Message display RTL** -- User messages, assistant responses, tool outputs, and thinking blocks all render with correct bidirectional text.
- **Code blocks preserved** -- Code, `pre`, and Monaco editor blocks remain left-to-right.
- **Auto-apply on startup** -- Patch is applied automatically when VS Code starts (configurable).
- **Survives updates** -- Detects when Claude Code updates overwrite its files and re-applies the patch.
- **Status bar indicator** -- Shows current patch state at a glance.

## How It Works

Claude Code renders its UI in a webview with `index.js` and `index.css` files. This extension appends a small RTL payload to each file:

- **JS payload**: Sets `dir="rtl"` on the `contenteditable` input and the `mentionMirror` overlay (CSS `direction` is ignored on `contenteditable="plaintext-only"` elements). Sets `dir="auto"` on user message bubbles for correct mixed-language rendering.
- **CSS payload**: Applies `unicode-bidi: plaintext` to message content, `direction: rtl` to lists, and preserves `direction: ltr` on code blocks.

Both payloads are marked with a comment tag for clean detection and removal.

## Commands

Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and search for:

| Command | Description |
|---------|-------------|
| **RTL for Claude Code: Apply Patch** | Manually apply the RTL patch |
| **RTL for Claude Code: Remove Patch** | Remove the RTL patch and restore original files |
| **RTL for Claude Code: Check Status** | Show whether the patch is currently applied |

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `rtlForClaudeCode.autoApply` | boolean | `true` | Automatically apply the RTL patch on startup and after Claude Code updates |

## Known Limitations

- **Reload required**: After applying or removing the patch, a window reload is needed for changes to take effect. The extension will prompt you.
- **Extension updates**: When Claude Code updates, its webview files are overwritten. The extension detects this and re-applies the patch automatically, but a reload is still needed.
- **File permissions**: On macOS and Linux, the extension directory may require elevated permissions for the first patch. If you see a permission error, run VS Code once with `sudo` or adjust file ownership.
- **Webview class names**: Claude Code uses hashed CSS class names that may change between versions. The selectors use wildcard matching (`[class*="..."]`) to handle this, but a major restructuring of Claude Code's UI could require an update to this extension.

## Supported Languages

- Hebrew
- Arabic
- Persian (Farsi)
- Any other RTL script (Urdu, Pashto, etc.)

## Installation

### From VSIX (local)

1. Clone or download this repository
2. Run `npm install && npm run compile`
3. Run `npx vsce package` to produce a `.vsix` file
4. In VS Code: Extensions > `...` menu > "Install from VSIX..."

### From Marketplace

Coming soon.

## License

MIT
