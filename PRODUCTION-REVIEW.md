# Fluvio Widget — Production Hardening Review

> Reviewed: `fluvio-universal-widget-v2.js` and `fluvio-button-widget.js`  
> Date: 2026-06-23

---

## Summary

Both widgets are functional but carry several production risks. The most serious are stored/reflected XSS via unsanitised webhook responses and config attributes rendered with `innerHTML`, no resilience when the Lucide/Retell CDNs fail or hang (no timeouts), and pervasive memory/listener leaks because the widget never tears down. The button widget additionally leaks event listeners and mishandles a multi-button page. None of these break the host page's globals (the IIFE + `'use strict'` is good), but the CSS is global and brittle.

---

## CRITICAL — Fix before any public launch

### C1 — XSS via chat responses (`addChatMessage`)

Agent message content from the webhook is injected with `innerHTML`. If the webhook returns any HTML or script tags, it executes on the host customer's website. Every visitor to every client site is exposed.

**Fix:** Use `textContent` instead of `innerHTML` for all dynamic message content.

```js
// Instead of:
bubble.innerHTML = content;

// Do:
const contentEl = document.createElement('div');
contentEl.className = 'fluvio-message-content';
contentEl.textContent = content;
bubble.appendChild(contentEl);
```

---

### C2 — XSS via config attributes + demo mode echo

`config.title`, `config.subtitle`, `config.agentName` are interpolated directly into the panel HTML template. Worse, the demo mode echoes the **visitor's own typed message** back into an `innerHTML` bubble — meaning any visitor can trigger reflected XSS by typing `<img src=x onerror=alert(1)>`.

**Fix:** A small `esc()` helper to HTML-escape all interpolated config values, and route demo responses through `textContent`.

```js
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Then in the template:
<h4>${esc(config.title)}</h4>
<p>${esc(config.subtitle)}</p>
```

---

### C3 — No webhook URL validation

The webhook URL is used verbatim with no protocol check. A `javascript:` scheme or attacker-controlled URL would receive all visitor data.

**Fix:** Validate with `new URL()` and require `https:` before any fetch.

```js
function isValidWebhook(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// In init():
if (!isValidWebhook(config.webhook)) {
  console.error('Fluvio: data-webhook must be a valid https:// URL');
  return;
}
```

---

## HIGH — Serious production reliability issues

### H1 — CDN loads have no timeout

If Lucide or the Retell SDK CDN is slow or blocked by a corporate proxy or CSP and never fires `onerror`, the widget hangs in "Loading…" forever — call button stays disabled.

**Fix:** Wrap each loader in `Promise.race` with a timeout.

```js
function withTimeout(promise, ms) {
  const timer = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), ms)
  );
  return Promise.race([promise, timer]);
}

// Usage:
await withTimeout(loadRetellSDK(), 8000).catch(() => { demoMode = true; });
```

---

### H2 — No CSP compatibility guidance, silent failures

The widget injects scripts from `unpkg.com`, `jsdelivr.net`, `skypack.dev`, and `esm.sh`. Most enterprise and e-commerce sites block these via Content-Security-Policy. The widget fails silently rather than showing a meaningful state.

**Fix:** Document required CSP directives for embedders. Surface a visible "voice unavailable" state on CDN failure rather than leaving the button disabled with no explanation.

Required CSP additions for embedders:
```
script-src: https://unpkg.com https://cdn.jsdelivr.net
microphone: self (Permissions-Policy)
```

---

### H3 — `@latest` CDN pins are a supply-chain risk

Every page load can silently pull a new, breaking, or compromised version of Retell/Lucide into all customer sites simultaneously.

**Fix:** Pin exact versions and add Subresource Integrity hashes.

```js
// Instead of:
script.src = 'https://unpkg.com/lucide@latest/dist/umd/lucide.js';

// Do:
script.src = 'https://unpkg.com/lucide@0.x.y/dist/umd/lucide.js';
script.integrity = 'sha384-<hash>';
script.crossOrigin = 'anonymous';
```

---

### H4 — Microphone stays hot when panel is closed mid-call

The close button only hides the panel — it does **not** end the call. The microphone keeps recording invisibly. There is also no `beforeunload` handler to stop the call on page navigation.

**Fix:** Check `isCallActive` on close and stop the call. Add a page unload handler.

```js
// On close button click:
if (isCallActive && client) {
  client.stopCall();
}
elements.panel.style.display = 'none';

// Page unload:
window.addEventListener('pagehide', () => {
  if (isCallActive && client) client.stopCall();
});
```

---

### H5 — Unthrottled scroll + resize listeners, never cleaned up

`adjustPosition()` runs `getBoundingClientRect()` and writes multiple inline styles on **every** scroll and resize event on the host page. This causes layout thrash and janky scrolling, especially on mobile. The listeners are attached to `window` and never removed.

**Fix:** Throttle with `requestAnimationFrame`, only attach the scroll listener while the panel is open, and pass `passive: true`.

```js
let rafPending = false;
function throttledAdjust() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    adjustPanelPosition();
    rafPending = false;
  });
}

window.addEventListener('resize', throttledAdjust, { passive: true });
// Attach scroll listener only on panel open, remove on close
```

---

### H6 — Button widget: listener accumulation + broken multi-button state

Global `isCallActive`, `retellClient`, and `currentButton` module-level variables mean a second button on the page silently dies while another call is active. The `call_ended`/`error` handlers close over the first button's `originalText`, so later buttons restore the wrong label. The MutationObserver watching for new buttons is never disconnected.

**Fix:** Track state per-button using a `WeakMap`, not module-level globals. Register Retell handlers that read `currentButton` at call time rather than at registration time.

```js
const buttonState = new WeakMap();
// Store { originalText, isActive } per button element
```

---

## MEDIUM

### M1 — `document.currentScript` fails on deferred/async loads

**Location:** Line 15 — `querySelector('script[src*="fluvio-universal-widget"]')`

If the script is loaded with `defer` or `async`, `document.currentScript` is `null` and the fallback selector picks the first matching script, which may be wrong if multiple versions coexist.

**Fix:** Capture the script reference at top-level synchronously (before any async work), or use a unique `id` attribute as a config marker.

---

### M2 — `setTimeout(initializeLucideIcons, 10)` scattered 9+ times

Race-prone timer-based icon initialization. If Lucide hasn't loaded yet, icons silently never appear. Also rescans the entire document DOM on every new chat message.

**Fix:** Tie icon initialization to the load promise resolution, not a timer guess. Scope `createIcons()` to the newly inserted node only.

---

### M3 — No request timeout on webhook fetches

A hung Make.com webhook leaves the chat "typing…" or the call "Connecting…" forever. The send button is disabled and never re-enabled if the promise hangs indefinitely.

**Fix:** Use `AbortController` with a timeout on all fetches. Re-enable the send button and show a timeout error message on abort.

```js
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 15000);
try {
  const response = await fetch(config.webhook, {
    method: 'POST',
    signal: controller.signal,
    ...
  });
} finally {
  clearTimeout(timeoutId);
}
```

---

### M4 — Unexpected webhook response shapes cause silent failures

If the webhook returns an array, a string, or an HTML error page, `data.messages.forEach` throws or silently shows a fallback. The voice path's `JSON.parse` fallback can feed an HTML error page body as an access token into `startCall`.

**Fix:** Validate shapes defensively before use.

```js
if (!Array.isArray(data.messages)) {
  throw new Error('Unexpected response shape from webhook');
}

// For token: only accept if it looks like a token (no angle brackets, reasonable length)
if (!accessToken || accessToken.includes('<') || accessToken.length > 500) {
  throw new Error('Invalid access token received');
}
```

---

### M5 — Accessibility gaps

- Panel open/close does not set `aria-expanded` on the FAB
- No focus trap inside the open panel; focus is not moved to the first control
- No `Escape` key to close
- Status changes ("Agent speaking…", "Listening…") are not announced to screen readers
- Mode buttons are not marked as `role="tab"` / `aria-selected`

**Fix:**
```js
// On open:
fab.setAttribute('aria-expanded', 'true');
closeButton.focus();

// On close:
fab.setAttribute('aria-expanded', 'false');
fab.focus();

// On status el:
statusEl.setAttribute('aria-live', 'polite');

// Escape key:
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && panelVisible) closePanel();
});
```

---

### M6 — Global CSS conflicts with host page styles

The `!important` declarations in mobile `@media` rules and the `fluvio-position-*` class added to `document.body` can clash with host page styles. The widget sets few defensive resets so host CSS targeting bare `button`, `textarea`, or `div` elements bleeds in. `z-index: 999999` can still lose to host overlays using `2147483647`.

**Fix:** Use Shadow DOM for full style isolation (also eliminates the XSS blast radius from C1/C2). If staying in the light DOM, add an `all: revert` reset on the root container and raise the documented z-index ceiling.

---

## LOW

### L1 — Dead code and label inconsistency

- Empty `catch {}` and `else {}` blocks throughout (lines 85, 98, 1269, 1416, 1442)
- `transcriptContainer` is still queried in JS but the element no longer exists in the DOM after the v2 refactor
- Call button label uses `'Call'` in some paths and `'Start Call'` in others — inconsistent

---

### L2 — Broken error logging in SDK fallback

`script.error` and `script2.error` are not standard properties on `HTMLScriptElement` — they are always `undefined`. The catch block logs them but provides no useful information.

**Fix:** Log the caught `err` argument from the `import()` promise rejection instead.

---

### L3 — Demo mode detected by substring sniffing

```js
config.projectId.includes('demo') || config.webhook.includes('httpbin.org')
```

A legitimate project whose ID or URL happens to contain the word "demo" will silently serve fake responses to real users.

**Fix:** Gate demo mode behind an explicit `data-demo="true"` attribute only.

---

### L4 — `alert()` in the button widget

Native `alert()` calls (button widget lines 182, 226, 245, 422) block the browser event loop and are jarring on third-party sites.

**Fix:** Replace with inline button state text or a small non-blocking toast notification.

---

### L5 — iOS keyboard / viewport clipping

`100vh`-based `max-height` on the panel includes the iOS Safari URL bar, so the panel can extend off-screen. The on-screen keyboard pushes the textarea input out of view.

**Fix:** Use `100dvh`/`100svh` where supported. On textarea focus, call `scrollIntoView({ behavior: 'smooth' })`.

---

## What's Already Done Well

- IIFE + `'use strict'` — no global namespace pollution from the widget itself
- `word-break` / `overflow-wrap` on message bubbles prevents long-URL overflow
- `font-size: 16px` on the mobile chat input correctly prevents iOS auto-zoom
- Layered CDN fallback chain for the Retell SDK shows good reliability intent — it just needs timeouts, version pinning, and CSP awareness to be truly robust
- `window.FluvioWidgetLoaded` guard prevents double-initialization

---

## Priority Order for Implementation

| Priority | Items | Impact |
|----------|-------|--------|
| 1 — Do now | C1, C2, C3 | XSS on every customer site |
| 2 — Before first real call | H4 | Mic recording invisibly after close |
| 3 — Before scale | H1, H3, M3 | Widget hangs on CDN issues; supply chain risk; hung fetch |
| 4 — Polish pass | H5, H6, M1–M4 | Reliability and UX |
| 5 — Ongoing | M5, M6, L1–L5 | Accessibility and code cleanliness |
