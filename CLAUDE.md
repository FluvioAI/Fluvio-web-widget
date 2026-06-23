# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a no-build, vanilla JavaScript embeddable widget project. There is no package.json, no bundler, and no test runner. Development is done by editing the JS files directly and opening HTML files in a browser.

## Architecture

Two independent IIFE widget scripts, each self-contained with no shared modules:

### `fluvio-universal-widget.js`
A floating FAB (Floating Action Button) that opens a panel. Configured entirely via `data-` attributes on its `<script>` tag. Supports three modes:
- `voice` — Retell WebRTC voice call only
- `chat` — text chat only
- `dual` — tabbed interface with both

**Initialization flow:**
1. Read config from `document.currentScript` attributes at load time
2. Load Lucide icons and the Retell SDK from CDN (unpkg → jsdelivr → skypack → esm.sh fallback chain)
3. Inject all CSS into a `<style>` tag (styles use template literals with `config.color` interpolated directly)
4. Build and append DOM (FAB button + panel)
5. Set up event listeners via `initializeWidget(elements)`

**Voice calls:** POST to `config.webhook` with `{ project_id, mode: 'voice', dynamic_variables }` → webhook returns `{ access_token }` → pass to `retellClient.startCall()`

**Chat:** POST to `config.webhook` with `{ project_id, mode: 'chat', action: 'create_session' | 'send_message', ... }` → receive AI reply and render in message list

### `fluvio-button-widget.js`
Scans for all `.fluvio-call-btn` elements at load time and attaches click handlers. Each button carries its own `data-webhook` and `data-project-id` attributes. Only handles voice calls (no chat). Uses the same Retell SDK and Make.com webhook pattern.

## Key Constraints

- **No `window` globals assumed** — both files guard against double-loading with `window.FluvioWidgetLoaded` / `window.FluvioButtonLoaded`
- **CSS is injected via `<style>` tag** — all styles live inside `injectStyles()` as a template literal; brand color is interpolated at runtime, not compile time
- **Dynamic variables** map from `data-*` HTML attributes to the snake_case keys the Retell/Make.com backend expects (e.g. `data-agent-name` → `AI_agent`, `data-company-name` → `company_name`)
- **Greeting placeholders** (`{{AI_agent}}`, `{{company_name}}`, etc.) are resolved client-side before display

## Testing

Open any of the `test-*.html` files directly in a browser — no server required. `index.html` is the main interactive demo. These files embed the widget scripts locally and let you test configuration changes without deploying.

## Deployment

The widget files are served as static assets (GitHub Pages or any CDN). No build step. Consumers embed via a single `<script>` tag with `data-` attributes.
