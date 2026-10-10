# AGENTS.md

Guidance for OpenCode sessions working in this repository.

## Project

A no-build, vanilla-JS embeddable AI widget (voice + chat) that customers paste into
their site with a single `<script>` tag. There is **no package.json, no bundler, no
lint, no test runner, no CI**. `vercel.json` sets `buildCommand: null` and
`outputDirectory: "."` — the repo root *is* the deployed artifact. Edit the `.js` files
directly and verify by opening HTML in a browser.

## Which file to edit

Four independent IIFE scripts, each fully self-contained with no shared module. There is
no build step to propagate a change from one to another.

| File | Status |
|------|--------|
| `fluvio-universal-widget-v2.js` | **Primary dev target.** All new work goes here. |
| `fluvio-universal-widget.js` | Original v1, frozen and in production. Never modify. |
| `fluvio-iframe-widget.js` | Side variant for `<iframe>` embeds (fixed root wrapper, pinned host body, absolute positioning). Changes are **not** automatically mirrored from v2 — port deliberately. |
| `fluvio-button-widget.js` | Standalone; attaches voice handlers to existing `.fluvio-call-btn` elements. Still uses the old unpkg/jsdelivr `<script>` CDN loading. |

If you fix a bug in v2 and it also affects the iframe or button variant, port it
explicitly — nothing will remind you.

## Widget v2 architecture

Config is read **once, synchronously at load** from `document.currentScript` (with a
`querySelector('script[src*="fluvio-universal-widget"]')` fallback), so config cannot be
changed after load. To re-render with different config you must remove the widget DOM and
reset `window.FluvioWidgetLoaded = false`, then re-inject — see `index.html`'s
`updateWidget()` for the working pattern.

Init order in `init()`: validate webhook (`https://` only) and `project-id` — **both
required, widget renders nothing and logs to console if either is missing** → 
`injectStyles()` → `createWidget()` → `loadRetellSDK()` → `initializeWidget()`.

Things that will bite you:

- **The Retell SDK is loaded via dynamic `import()` from `esm.sh`, not a script tag.**
  There is no `window.RetellWebClient` global and no `retellClient` at init time. CSP on
  the host page must allow `script-src https://esm.sh`. Contrast the button widget, which
  still uses unpkg → jsdelivr `<script>` fallback.
- **Icons are inline SVG strings in an `ICONS` map.** There is no Lucide dependency, and
  `initializeLucideIcons()` is a deliberate no-op kept so call sites don't throw. Don't
  reintroduce `data-lucide` attributes.
- **Panel visibility is the `data-open` attribute**, driven by CSS
  (`visibility`/`opacity`/`transform`/`filter`) plus a transient `.is-closing` class.
  Nothing ever sets `panel.style.display`. Any test or tooling that checks `style.display`
  on `#fluvio-panel` is wrong against v2.
- **There is no landing screen.** Dual mode renders a top tab bar
  (`#fluvio-mode-selector`) and opens straight onto a tab. `#fluvio-mode-landing`,
  `.fluvio-mode-card`, and `#fluvio-back` are removed — CSS rules for `#fluvio-back`
  remain in `injectStyles()` as dead code.
- **`adjustPanelPosition()` writes inline `left/right/top/bottom/width/max-height` onto
  the panel on every open, resize, and scroll**, overriding the position-variant CSS
  classes. Debounced via `requestAnimationFrame` (`throttledAdjust`). If the panel looks
  misplaced, suspect this function before the CSS.
- **All CSS lives in one `injectStyles()` template literal**, with `config.color` and
  `orbPalette(config.color)` values interpolated at runtime. There is no stylesheet file.
- `data-demo` **no longer exists in v2** (removed in `b8e9c84`). It still exists in
  `fluvio-iframe-widget.js` and is still documented in `README.md` / `docs/` — stale.
  Don't reintroduce demo simulation in v2.

## Webhook contract

One Make.com webhook serves both modes; `mode` (`'voice'` | `'chat'`) on the request body
routes it. See `WEBHOOK-MODIFICATION-GUIDE.md` for the scenario wiring.

- Voice: POST → expects `{ access_token }`; optional `call_inbound.dynamic_variables` is
  forwarded as `retell_llm_dynamic_variables`.
- Chat: `action: 'create_session'` → expects `{ chat_id }`; `action: 'send_message'`
  → expects `{ messages: [{ role, content }] }`.
- `data-*` attributes map to snake_case `dynamic_variables` (`data-agent-name` →
  `AI_agent`, `data-company-name` → `company_name`, …) for the Retell/Make backend.

**The `{{AI_agent}}`-style placeholders in `docs/CUSTOMIZATION.md` are not resolved by any
widget.** No JS file contains `{{` handling — they are a Make.com/Retell-side concern.
Changing how `dynamic_variables` is shaped breaks every customer scenario.

## Security invariants

- `esc()` for any config value interpolated into an `innerHTML` template literal.
- Chat bubbles are built as DOM nodes with `textContent` — never `innerHTML` for content.
- `isValidWebhookUrl()` requires `https:` — enforced before any render.
- Webhook responses are shape-validated before use (`chat_id` is a string, `messages` is
  an array, access token length/content sanity-checked) before reaching the DOM.
- All `fetch` calls go through `fetchWithTimeout()` (AbortController, 15s).

## Testing

No runner. Open the HTML files directly in a browser — no server needed.

| File | Purpose |
|------|---------|
| `widget-tests.html` | Automated suite — **60 tests, 11 suites**. Results render into the page; there is no exit code. |
| `test-v2-widget.html` | v2 demo with viewport/DPR/breakpoint diagnostics overlay and a 360/420px ruler. |
| `test-iframe.html` + `iframe-content.html` | Iframe scaling harness (both currently untracked in git). |
| `test-button-widget.html` | Button widget demo. |
| `demo-widget.html` | Param-driven demo; loads the widget from the **GitHub Pages URL**, not the local file. |
| `index.html` | Interactive config tester — but it targets **v1**, not v2. |

Editing `widget-tests.html`:

- **Every test must be `await test(...)`.** `runTests()` ends with a single
  `renderResults()` call; results only appear after all tests resolve. A missing `await`
  silently drops a test from the report.
- Tests hit a **real, unreachable webhook** (`https://hook.us2.make.com/your-webhook-url`)
  and a placeholder project id, so network-dependent tests are slow and guarded by
  `if (!input || getChatSend()?.disabled) return;`. Those guards make a test **pass
  vacuously** — a green run does not prove the chat round-trip works.
- `isPanelOpen()` checks `hasAttribute('data-open')`, not `style.display`.
- Widgets self-guard on `window.FluvioWidgetLoaded`; the suite resets it before loading.
- Suite names are just `suite('...')` labels — keep them accurate when moving tests.

## Credentials — never commit real ones

Every test/demo file ships **placeholder** credentials on purpose:
`https://hook.us2.make.com/your-webhook-url` and `demo_project_123`. Keep it that
way. Test files are tracked and this repo is public on GitHub.

A Make.com webhook is a live credential — it mints billable Retell call tokens and
posts to a real agent. `data-project-id` alone is inert, but the pair is not.

When you need real values to debug locally, do **not** paste them into a tracked HTML
file. Either edit the DOM live in DevTools, or put them in a gitignored file
(`.env`, `config.local.js`) per `.gitignore`. Before committing, check:

```
git diff --cached | Select-String 'hook\.us2\.make\.com/[A-Za-z0-9]{8,}'
```

Non-placeholder project IDs like `ZWQ4VZV` used to appear in `test-button-widget.html`
and `index.html`; they were replaced with `demo_project_123` / `project_your_id`.
`ZWQ4VZV` remains in the customer-facing docs (`SETUP-GUIDE.md`, `docs/`) as an
example — that is intentional, leave it.

## Deployment

Served as static assets from GitHub Pages (`fluvioai` remote) and/or Vercel.
`vercel.json` adds `Access-Control-Allow-Origin: *` and
`Cache-Control: public, max-age=31536000, immutable` to `*.js` — **the JS is cached for a
year**, so a released widget file will not refresh for consumers who already loaded it.
This is why releases are manual file replacement, not a build.

Two remotes: `origin` (skhandor, personal) and `fluvioai` (the org repo that GitHub
Pages serves). Confirm which one you are pushing to.

## Docs — reconcile against the code, not the other way round

The user-facing docs are maintained separately from the widgets and drift easily. When a
doc and a `.js` file disagree, **the `.js` wins**. Re-verify these before repeating a doc
claim to a customer:

- `CLAUDE.md` is the closest thing to a technical reference here; keep it current when
  v2's architecture changes. It also records the audit-comment scheme below.
- `SETUP-GUIDE.md` still calls the product "VoxBridge" and shows an ASCII tab layout.
- `docs/CUSTOMIZATION.md` documents `{{AI_agent}}`-style placeholders as if the widget
  resolved them. It does not — they are Make.com/Retell-side.
- `index.html` previews **v1**, so it will not reflect v2 changes.

All docs are valid UTF-8 without BOM. If `?` appears where an em-dash should be, that is a
PowerShell console rendering artifact, not file corruption — re-read before "fixing" it.

## Conventions

- No `Co-Authored-By` trailer in commit messages.
- Preserve the `── C1/C2/C3/H1/M3/M4/M5 ──` audit-trail comments in the hardening code;
  they map to findings and are load-bearing context.
- Deprecated config keys (`data-agent-id`, `data-voice-agent-id`, `data-chat-agent-id`)
  are still parsed and marked `// Deprecated` — leave them rather than deleting, since
  existing customer script tags still pass them.