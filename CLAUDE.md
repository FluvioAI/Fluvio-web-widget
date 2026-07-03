# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A no-build, vanilla JavaScript embeddable widget project. No package.json, no bundler, no test runner. Edit JS files directly and open HTML files in a browser to test.

## Architecture

Two independent IIFE widget scripts, each self-contained with no shared modules.

### `fluvio-universal-widget-v2.js` — Active development target
The redesigned floating widget. All new work goes here. The original `fluvio-universal-widget.js` is NEVER modified.

**Initialization flow:**
1. Read config from `document.currentScript` data attributes at load time
2. Load Lucide icons and Retell SDK from CDN (unpkg → jsdelivr fallback chain with timeouts)
3. Call `orbPalette(config.color)` to derive the orb color palette from the brand color
4. Inject all CSS via `injectStyles()` — styles use template literals with config values and `orb.*` palette interpolated directly
5. Build and append DOM via `createWidget()` — returns element references
6. Set up all event listeners via `initializeWidget(elements)`

**Panel views (3-state):** `switchView(view)` manages `'landing' | 'voice' | 'chat'`
- Landing: mode-selection screen shown on open when `mode === 'dual'`
- Voice: orb, timer, call button, status
- Chat: message list, input, send button

**Orb:** Pure CSS gradient-mesh — `#fluvio-orb-core` contains 4 `.fluvio-orb-blob` divs with `mix-blend-mode: screen` on a dark base. State driven by `core.dataset.state` (`idle | listening | talking`). Colors derived from `orbPalette()` at inject time.

**`setOrbState(state)`:** Sets `orbEl.className` + `core.dataset.state`. CSS handles animation speed changes via `animation-duration` overrides.

**Voice calls:** POST to `config.webhook` → `{ access_token }` → `retellClient.startCall()`

**Chat:** POST to `config.webhook` with `action: 'create_session' | 'send_message'`

**Call timer:** `startTimer()` / `stopTimer()` — updates `#fluvio-timer` every second

### `fluvio-universal-widget.js` — Original (do not modify)
Stable production version. Leave untouched.

### `fluvio-button-widget.js`
Scans for `.fluvio-call-btn` elements and attaches voice-only call handlers. Uses the same Retell SDK and webhook pattern.

## Key Constraints

- **No `window` globals assumed** — guards: `window.FluvioWidgetLoaded` / `window.FluvioButtonWidgetLoaded`
- **CSS is injected via `<style>` tag** — all styles in `injectStyles()` as template literal; brand color and orb palette interpolated at runtime
- **Dynamic variables** map from `data-*` attributes to snake_case keys for the Retell/Make.com backend
- **Greeting placeholders** (`{{AI_agent}}`, `{{company_name}}`, etc.) resolved client-side before display
- **XSS protection** — all config values interpolated into HTML use `esc()` helper; webhook responses use `textContent`

## Configuration Attributes (v2)

| Attribute | Default | Notes |
|-----------|---------|-------|
| `data-webhook` | — | Required. Must be `https://` |
| `data-project-id` | — | Required |
| `data-color` | `#347D9B` | Drives all UI color including orb palette |
| `data-mode` | `dual` | `dual \| voice \| chat` |
| `data-default-mode` | `voice` | First tab when entering voice/chat from landing |
| `data-position` | `bottom-right` | FAB corner position |
| `data-title` | `AI Assistant` | Panel header title |
| `data-subtitle` | `Voice & Chat Support` | Panel header subtitle |
| `data-fab-text` | `Chat or Talk to...` | Text shown on the pill FAB |
| `data-agent-name` | — | AI agent display name |
| `data-agent-title` | — | AI agent title |
| `data-company-name` | — | Company name |
| `data-company-hours` | — | Business hours |
| `data-company-address` | — | Company address |
| `data-greeting` | — | Voice greeting message |
| `data-chat-greeting` | — | Chat-specific greeting (overrides `data-greeting`) |
| `data-demo` | `false` | Set `"true"` to enable demo mode (no real webhook calls) |

## Testing

Open test files directly in a browser — no server required.

| File | Purpose |
|------|---------|
| `test-v2-widget.html` | Live demo of the v2 redesign |
| `widget-tests.html` | Automated test suite (77 tests, 12 suites) |
| `test-button-widget.html` | Button widget demo |
| `index.html` | Interactive configuration tester for v1 |

All tests in `widget-tests.html` must use `await test(...)` — the runner calls `renderResults()` after awaiting all tests.

## Deployment

Widget files are served as static assets (GitHub Pages or any CDN). No build step. Consumers embed via a single `<script>` tag with `data-` attributes.

## Git Commits

Do not add `Co-Authored-By` lines to commit messages.
