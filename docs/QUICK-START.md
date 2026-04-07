# Quick Start Guide

Get the Fluvio widget running on your website in under 10 minutes.

---

## Before You Begin

You will need three pieces of information from your Fluvio setup:

1. **Webhook URL** — provided by your Make.com scenario (looks like `https://hook.us2.make.com/xxxxxxxx`)
2. **Project ID** — your Fluvio project identifier (e.g. `ZWQ4VZV`)
3. **Hosted widget URL** — the public URL where your widget file is hosted (see `GITHUB-SETUP-GUIDE.md` if you have not set this up yet)

---

## Step 1: Choose Your Widget Type

**Universal Widget** — recommended for most websites
- Appears as a floating button in the corner of the page
- Visitors click it to open voice or chat

**Button Widget** — for when you already have a button on your page
- Converts an existing button into an AI call button
- Useful for specific call-to-action sections

---

## Step 2: Add the Widget to Your Website

Open your website's HTML file and paste the code just before the closing `</body>` tag.

### Universal Widget (Floating Button)

```html
<script src="https://YOUR-HOSTING-URL/fluvio-universal-widget.js"
        data-webhook="https://hook.us2.make.com/your-webhook-url"
        data-project-id="YOUR-PROJECT-ID"
        data-mode="dual"
        data-title="AI Assistant"
        data-subtitle="Voice & Chat Support"></script>
```

### Button Widget

Add the `fluvio-call-btn` class to an existing button, then load the script:

```html
<button class="fluvio-call-btn"
        data-webhook="https://hook.us2.make.com/your-webhook-url"
        data-project-id="YOUR-PROJECT-ID">
    Talk to an Agent
</button>

<script src="https://YOUR-HOSTING-URL/fluvio-button-widget.js"></script>
```

---

## Step 3: Customize the Appearance

Add any of the following options to personalize the widget:

```html
<script src="https://YOUR-HOSTING-URL/fluvio-universal-widget.js"
        data-webhook="https://hook.us2.make.com/your-webhook-url"
        data-project-id="YOUR-PROJECT-ID"
        data-mode="dual"
        data-color="#347D9B"
        data-title="Customer Support"
        data-subtitle="We are here to help"
        data-position="bottom-right"
        data-agent-name="Sarah"
        data-company-name="Acme Corp"></script>
```

| Option | Description | Default |
|--------|-------------|---------|
| `data-color` | Brand color as a hex code | `#347D9B` |
| `data-title` | Title shown in the widget header | `AI Assistant` |
| `data-subtitle` | Subtitle shown below the title | `Voice & Chat Support` |
| `data-position` | Corner where the widget appears | `bottom-right` |
| `data-agent-name` | Name of your AI agent | — |
| `data-company-name` | Your company name | — |
| `data-mode` | `dual`, `voice`, or `chat` | `dual` |
| `data-default-mode` | Which tab opens first: `voice` or `chat` | `voice` |

### Position Options

```
bottom-right    bottom-left    top-right    top-left
```

---

## Step 4: Test Before Going Live

1. Open `index.html` in your browser to use the interactive configuration tester
2. Enter your webhook URL and project ID
3. Click "Update Widget" to see the live result
4. Test both voice and chat to confirm your webhook is responding

---

## Platform-Specific Instructions

### WordPress
Install the "Insert Headers and Footers" plugin, then paste the script tag into the footer section.

Alternatively, add it directly to your theme's `functions.php`:
```php
function add_fluvio_widget() {
    echo '<script src="https://YOUR-HOSTING-URL/fluvio-universal-widget.js" data-webhook="YOUR-WEBHOOK" data-project-id="YOUR-PROJECT-ID"></script>';
}
add_action('wp_footer', 'add_fluvio_widget');
```

### Shopify
In your Shopify admin, go to **Online Store > Themes > Edit Code**, open `theme.liquid`, and paste the script tag just before `</body>`.

### Squarespace
Go to **Settings > Advanced > Code Injection**, and paste the script tag in the Footer section.

### Wix
Use the Wix **Embed HTML** element, or go to **Settings > Custom Code** and add the script to the body.

---

## Troubleshooting

**The widget does not appear on the page**
- Confirm the script URL is correct by opening it in a browser — you should see JavaScript code
- Check that the script tag is placed before `</body>`, not inside `<head>`
- Open the browser console (press F12) and look for any error messages

**Voice or chat is not responding**
- Verify your webhook URL is correct and the Make.com scenario is turned on
- Test the webhook directly using the tester on `index.html`
- Check that your project ID matches what is configured in Fluvio

**The widget looks wrong on mobile**
- Both widgets are mobile-responsive by default
- If there is a conflict with your site's styles, contact your Fluvio team

---

For full configuration options, see `docs/CUSTOMIZATION.md`.
