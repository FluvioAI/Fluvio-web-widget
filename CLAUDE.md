# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A no-build, vanilla JavaScript embeddable widget project. No package.json, no bundler, no test runner. Edit JS files directly and open HTML files in a browser to test.

## Architecture

Four independent IIFE widget scripts, each self-contained with no shared modules. There is no build step, so a change to one is never automatically mirrored to another.

### `fluvio-universal-widget-v2.js` — Active development target
The redesigned floating widget. All new work goes here. The original `fluvio-universal-widget.js` is NEVER modified.

**Initialization flow:**
1. Read config from `document.currentScript` data attributes at load time (synchronous, once — config cannot change after load)
2. Validate `data-webhook` (must be `https://`) and `data-project-id`; the widget renders nothing if either is missing
3. Call `orbPalette(config.color)` inside `injectStyles()` to derive the orb color palette from the brand color
4. Inject all CSS via `injectStyles()` — styles use template literals with config values and `orb.*` palette interpolated directly
5. Build and append DOM via `createWidget()` — returns element references
6. Load the Retell SDK via dynamic `import()` from `esm.sh` (only for `voice`/`dual` mode)
7. Set up all event listeners via `initializeWidget(elements, RetellWebClient)`

**Icons:** inline SVG strings in an `ICONS` map — there is no Lucide dependency. `initializeLucideIcons()` is a deliberate no-op kept so existing call sites don't throw.

**Panel views (2-tab):** `switchMode(mode)` manages `'voice' | 'chat'`. `switchView()` is a thin alias for it. There is **no landing screen** — in `dual` mode the panel opens straight onto the default tab, with a top tab bar (`#fluvio-mode-selector`).
- Voice: orb, timer, call button, status
- Chat: message list, input, send button

**Panel open/close:** visibility is driven by the `data-open` attribute (CSS transitions `visibility`/`opacity`/`transform`/`filter`) plus a transient `.is-closing` class. Nothing ever sets `panel.style.display`.

**Orb:** Pure CSS gradient-mesh — `#fluvio-orb-core` contains 4 `.fluvio-orb-blob` divs with `mix-blend-mode: screen` on a dark base. State driven by `core.dataset.state` (`idle | listening | talking`). Colors derived from `orbPalette()` at inject time.

**`setOrbState(state)`:** Sets `orbEl.className` + `core.dataset.state`. CSS handles animation speed changes via `animation-duration` overrides.

**Voice calls:** POST to `config.webhook` → `{ access_token }` → `retellClient.startCall()`

**Chat:** POST to `config.webhook` with `action: 'create_session' | 'send_message'`

**Call timer:** `startTimer()` / `stopTimer()` — updates `#fluvio-timer` every second

### `fluvio-universal-widget.js` — Original (do not modify)
Stable production version. Leave untouched.

### `fluvio-iframe-widget.js`
Iframe-optimised side variant, for embedding the widget inside an `<iframe>`. Wraps the FAB and panel in a fixed `#fluvio-iframe-root` and pins the host body (`position: fixed`) so the iframe page never scrolls; children are positioned absolutely. Same webhook contract as v2, but it still contains the demo-mode simulation that v2 removed. Changes must be ported from v2 manually.

### `fluvio-button-widget.js`
Scans for `.fluvio-call-btn` elements and attaches voice-only call handlers. Uses the same webhook pattern, but loads the Retell SDK and Lucide from `<script>` tags on unpkg with a jsdelivr fallback.

## Key Constraints

- **No `window` globals assumed** — guards: `window.FluvioWidgetLoaded` (v1 + v2), `window.FluvioIframeWidgetLoaded`, `window.FluvioButtonLoaded`
- **CSS is injected via `<style>` tag** — all styles in `injectStyles()` as template literal; brand color and orb palette interpolated at runtime
- **`adjustPanelPosition()` writes inline position styles onto the panel** on every open/resize/scroll, overriding the position-variant CSS classes. Debounced with `requestAnimationFrame`.
- **Dynamic variables** map from `data-*` attributes to snake_case keys for the Retell/Make.com backend
- **Greeting placeholders** (`{{AI_agent}}`, `{{company_name}}`, etc.) are NOT resolved client-side — no widget JS handles `{{`. They are a Make.com/Retell-side concern.
- **XSS protection** — all config values interpolated into HTML use `esc()` helper; chat bubbles are built as DOM nodes with `textContent`; webhook responses are shape-validated before reaching the DOM
- **All `fetch` calls** go through `fetchWithTimeout()` (AbortController, 15s)

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
| `data-fab-style` | `pill` | `pill` \| `circle` |

Note: `data-demo` was removed from v2 in commit `b8e9c84`. It still exists in `fluvio-iframe-widget.js`.

## Testing

Open test files directly in a browser — no server required.

| File | Purpose |
|------|---------|
| `test-v2-widget.html` | Live demo of v2, with viewport/DPR/breakpoint diagnostics overlay |
| `widget-tests.html` | Automated test suite (60 tests, 11 suites) |
| `test-iframe.html` + `iframe-content.html` | Iframe scaling harness |
| `test-button-widget.html` | Button widget demo |
| `demo-widget.html` | Param-driven demo (loads the widget from the GitHub Pages URL) |
| `index.html` | Interactive configuration tester — **targets v1, not v2** |

All tests in `widget-tests.html` must use `await test(...)` — the runner calls `renderResults()` after awaiting all tests, so a missing `await` silently drops a test from the report.

The suite targets a placeholder webhook, so network-dependent tests self-guard and **pass vacuously**. A green run does not prove the chat round-trip works.

## Deployment

Widget files are served as static assets (GitHub Pages or any CDN). No build step. Consumers embed via a single `<script>` tag with `data-` attributes.

`vercel.json` serves the repo root as-is and sets `Cache-Control: public, max-age=31536000, immutable` on `*.js` — released widget files stay cached for a year, so updates reach consumers via manual file replacement rather than a build.

Two git remotes are configured: `origin` (skhandor, personal) and `fluvioai` (the org repo GitHub Pages serves). Confirm which you are pushing to.

## Git Commits

Do not add `Co-Authored-By` lines to commit messages.
