# Fluvio Web Widget

A lightweight, embeddable AI assistant widget that adds voice calling and text chat to any website — no development experience required.

## What It Does

The Fluvio widget appears as a small floating button on your website. When a visitor clicks it, a chat panel opens where they can either type a message or start a voice call with your AI assistant.

## What Is Included

| File | Purpose |
|------|---------|
| `fluvio-universal-widget.js` | The widget itself — this is what you embed on your site |
| `fluvio-button-widget.js` | An alternative that turns any existing button into an AI call button |
| `index.html` | Interactive demo and configuration tester |
| `GITHUB-SETUP-GUIDE.md` | Step-by-step instructions for hosting the widget online |
| `WEBHOOK-MODIFICATION-GUIDE.md` | Technical guide for connecting the widget to Make.com |
| `docs/QUICK-START.md` | Getting started in 5 minutes |
| `docs/CUSTOMIZATION.md` | All available configuration options |

## How to Add the Widget to a Website

Copy this single line of code and paste it into your website's HTML, just before the closing `</body>` tag:

```html
<script src="https://YOUR-HOSTING-URL/fluvio-universal-widget.js"
        data-webhook="https://hook.us2.make.com/your-webhook-url"
        data-project-id="YOUR-PROJECT-ID"
        data-mode="dual"
        data-title="AI Assistant"
        data-subtitle="Voice & Chat Support"></script>
```

Replace `YOUR-HOSTING-URL`, `your-webhook-url`, and `YOUR-PROJECT-ID` with your actual values. Your Fluvio team can provide these.

## Widget Modes

| Mode | What it shows |
|------|--------------|
| `dual` | Both voice and chat tabs (recommended) |
| `voice` | Voice calling only |
| `chat` | Text chat only |

## Hosting the Widget

The widget file (`fluvio-universal-widget.js`) needs to be accessible via a public URL. The easiest option is GitHub Pages, which is free. Follow `GITHUB-SETUP-GUIDE.md` for step-by-step instructions.

## Where to Start

- **New to this?** Start with `GITHUB-SETUP-GUIDE.md`
- **Already have hosting?** Go to `docs/QUICK-START.md`
- **Want to change colors or text?** See `docs/CUSTOMIZATION.md`
- **Setting up Make.com?** See `WEBHOOK-MODIFICATION-GUIDE.md`
