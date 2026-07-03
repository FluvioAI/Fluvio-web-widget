# Widget Update — What's New

Your widget got an upgrade. No changes needed on your end — everything still works the same. But there are new features you can turn on if you want.

---

## What Changed Automatically

**No more landing screen.** When visitors click the widget, it opens directly to Voice with tabs at the top — no extra "choose your mode" screen in between.

```
Before:  Click FAB → landing screen → pick Voice or Chat → start
After:   Click FAB → Voice tab ready → start (Chat is one click away on the tab)
```

**How it looks now:**
```
┌─────────────────────────┐
│  Your Company Name    ✕ │
├──────────┬──────────────┤
│  🎤 Voice │  💬 Chat     │  ← Tabs at the top
├──────────┴──────────────┤
│      (orb + call)       │
└─────────────────────────┘
```

If you were using `data-mode="voice"` or `data-mode="chat"` (single mode), nothing changes visually — the tab bar only appears when both modes are enabled.

---

## New Options You Can Add

Just add these to your existing script tag. They're all optional — skip any you don't need.

### Button text and shape

```html
data-fab-text="Talk to Sales"
data-fab-style="circle"
```

| `data-fab-text` | Changes the text on the floating button | `"Talk to AI"` |
| `data-fab-style` | `"pill"` = text + orb icon (default), `"circle"` = orb icon only | `"circle"` |

### Demo mode

```html
data-demo="true"
```

Shows "Demo Mode" in the widget and skips all network calls. Useful for showing the widget to a client or taking screenshots without your Make.com scenario running.

---

## Your Existing Setup Still Works

If your script tag looks like this:

```html
<script src=".../fluvio-universal-widget-v2.js"
        data-webhook="https://hook.us2.make.com/..."
        data-project-id="ZWQ4VZV"
        data-color="#347D9B"
        data-mode="dual"
        data-title="AI Assistant"></script>
```

You don't have to change anything. It will work exactly as before — just with the new tab layout instead of the landing screen.

---

## Full Reference

Here's every option available. Bold = required.

| Attribute | What it does | Example |
|-----------|-------------|---------|
| **`data-webhook`** | Your Make.com webhook URL | `https://hook.us2.make.com/abc123` |
| **`data-project-id`** | Your project ID | `ZWQ4VZV` |
| `data-mode` | Tabs to show: `dual`, `voice`, or `chat` | `dual` |
| `data-default-mode` | Which tab opens first | `voice` |
| `data-color` | Brand color (hex) | `#FF4800` |
| `data-position` | Screen corner | `bottom-right` |
| `data-title` | Header text | `AI Assistant` |
| `data-subtitle` | Subtitle under header | `Voice & Chat Support` |
| `data-fab-text` | Text on floating button | `Talk to AI` |
| `data-fab-style` | Button shape: `pill` or `circle` | `pill` |
| `data-agent-name` | AI agent's name | `Alex` |
| `data-company-name` | Your company name | `Acme Corp` |
| `data-greeting` | First message in chat | `Hi! I'm {{AI_agent}}...` |
| `data-demo` | Test mode (no real calls) | `true` |

---

## Updating Your Widget File

If you're hosting the `.js` file on GitHub Pages:

1. Go to your repository
2. Delete the old `fluvio-universal-widget-v2.js`
3. Upload the latest version (right-click → save from [here](https://github.com/FluvioAI/Fluvio-web-widget/raw/production-hardening/fluvio-universal-widget-v2.js))
4. Done — your site picks it up automatically

No changes to your website HTML needed. Just replace the file and refresh.
