# Setting Up Your Widget — Complete Guide

This guide will help you host the VoxBridge widget on GitHub Pages and add it to your website. No coding experience needed — just follow the steps.

**Time:** 15–20 minutes  
**Cost:** Free (GitHub Pages is free forever)

---

## What You're Building

When you're done, your website will have a floating chat bubble in the corner. Visitors click it, pick Voice or Chat from the tabs at the top, and start talking to your AI assistant immediately.

```
┌─────────────────────────┐
│  Your Company Name    ✕ │  ← Header
├──────────┬──────────────┤
│  Voice   │    Chat      │  ← Tabs (click to switch)
├──────────┴──────────────┤
│                         │
│      ( 🎤 Voice )       │  ← Opens directly to Voice
│    or ( 💬 Chat )       │     No extra screens
│                         │
├─────────────────────────┤
│  Powered by VoxBridge   │
└─────────────────────────┘
```

---

## What You Need

- [ ] A computer with internet
- [ ] An email address (for GitHub)
- [ ] Your **webhook URL** (from Make.com — looks like `https://hook.us2.make.com/...`)
- [ ] Your **project ID** (from your VoxBridge setup — like `ZWQ4VZV`)

---

## Step 1 — Create a GitHub Account

1. Open [github.com](https://github.com) in your browser
2. Click **Sign up** (top right)
3. Enter your email, create a password, pick a username
4. Choose the **Free** plan when asked
5. Verify your email address (GitHub sends a confirmation email)

> **Tip for the username:** Pick something professional. Examples: `yourcompany`, `yourcompany-widgets`, `yourname-ai`.

---

## Step 2 — Create a Repository

A "repository" is just a folder where your files live online.

1. After signing in, click the **+** icon (top right) → **New repository**
2. Fill in:
   - **Repository name:** `voxbridge-widget` (or anything you like)
   - **Description:** `AI chat widget for my website`
   - **Visibility:** 🔴 Select **Public** (this is required for free hosting)
   - Leave everything else as is
3. Click the green **Create repository** button

---

## Step 3 — Upload the Widget File

You only need **one file** for the floating widget.

1. On your new repository page, click **uploading an existing file** (blue link in the middle)
2. Download the widget file first:
   - Right-click this link → **Save link as...**: [`fluvio-universal-widget-v2.js`](https://github.com/FluvioAI/Fluvio-web-widget/raw/production-hardening/fluvio-universal-widget-v2.js)
   - Save it somewhere easy to find (Desktop or Downloads)
3. Drag the downloaded file into the upload area, or click **choose your files**
4. Scroll down to **Commit changes**, type `Add widget` in the text box
5. Click the green **Commit changes** button

> **Optional:** If you also want standalone call buttons on your page, upload `fluvio-button-widget.js` the same way. Most people only need the main file above.

---

## Step 4 — Turn On Hosting

1. Click the **Settings** tab (top of your repository page)
2. In the left sidebar, click **Pages**
3. Under **Branch**, select **main** from the dropdown
4. Click **Save**

GitHub will show a blue banner: "Your site is ready to be published." Wait 1–2 minutes, then refresh the page. You'll see a green banner with your URL:

```
✅ Your site is published at https://YOUR-USERNAME.github.io/voxbridge-widget/
```

---

## Step 5 — Test It Works

Open this URL in your browser:

```
https://YOUR-USERNAME.github.io/voxbridge-widget/fluvio-universal-widget-v2.js
```

*(Replace `YOUR-USERNAME` with your GitHub username and `voxbridge-widget` with your repository name.)*

You should see a wall of JavaScript code. **That means it's working.** If you see "404" or "Page not found", wait 5 more minutes and try again — GitHub can be slow on first publish.

---

## Step 6 — Add It to Your Website

Copy the code below. Replace the three **bold** parts with your own details, then paste it into your website's HTML just before the `</body>` tag (usually the very last thing before `</body>`).

```html
<!-- VoxBridge AI Widget -->
<script src="https://YOUR-USERNAME.github.io/voxbridge-widget/fluvio-universal-widget-v2.js"
        data-webhook="https://hook.us2.make.com/YOUR-WEBHOOK"
        data-project-id="YOUR-PROJECT-ID"
        data-mode="dual"
        data-color="#347D9B"
        data-title="AI Assistant"
        data-subtitle="Voice & Chat Support"
        data-fab-text="Talk to AI"
        data-agent-name="Alex"
        data-company-name="Your Company"
        data-greeting="Hi! I'm {{AI_agent}} from {{company_name}}. How can I help you today?"></script>
```

### What each line means

| Attribute | What it does | Example |
|-----------|-------------|---------|
| `src` | The URL to your widget file (from Step 5) | Your GitHub Pages URL |
| `data-webhook` | Connects calls/chat to your Make.com backend | `https://hook.us2.make.com/abc123` |
| `data-project-id` | Your VoxBridge project identifier | `ZWQ4VZV` |
| `data-mode` | What tabs to show: `dual` (both), `voice`, or `chat` | `dual` |
| `data-color` | Your brand color — drives everything: tabs, orb, buttons | `#347D9B` |
| `data-title` | Name shown at the top of the widget panel | `AI Assistant` |
| `data-subtitle` | Smaller text under the title | `Voice & Chat Support` |
| `data-fab-text` | Text on the floating button | `Talk to AI` |
| `data-agent-name` | Your AI agent's name (used in greetings) | `Alex` |
| `data-company-name` | Your company name (used in greetings) | `Your Company` |
| `data-greeting` | First message visitors see when chat opens | `Hi! I'm {{AI_agent}}...` |

---

## Changing Your Brand Color

The `data-color` controls everything — the tabs, the orb animation, the call button, the send button. Use your brand's hex color code:

```html
data-color="#1a73e8"   <!-- Google blue -->
data-color="#0f9d58"   <!-- Green -->
data-color="#FF6B35"   <!-- Warm orange -->
data-color="#7c3aed"   <!-- Purple -->
```

To find your brand's exact color, Google "[your brand] brand color hex" or ask your designer.

---

## Platform-Specific Instructions

### WordPress
Install the free **Insert Headers and Footers** plugin. Go to **Settings → Insert Headers and Footers**, paste the script tag in the **Footer** box, and save.

### Shopify
Go to **Online Store → Themes → Edit Code**. Open `theme.liquid`, scroll to the bottom, and paste the script tag just **above** `</body>`. Save.

### Squarespace
Go to **Settings → Advanced → Code Injection**. Paste the script tag in the **Footer** section. Save.

### Wix
Go to **Settings → Custom Code**. Click **+ Add Custom Code**, paste the script tag, set it to **Body - end**, and apply to **All pages**.

### Webflow
Go to **Site Settings → Custom Code**. Paste the script tag in the **Before </body> tag** section. Save.

---

## Updating Your Widget Later

When a new version comes out:

1. Go to your repository on GitHub
2. Click the `fluvio-universal-widget-v2.js` file
3. Click the trash icon (top right) to delete the old file
4. Upload the new version using the same **Add file → Upload files** button
5. It updates automatically on your site within 2–3 minutes

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| **Widget doesn't appear** | Make sure the script tag is right before `</body>`, not inside `<head>`. Open your page and press F12 → Console tab — any red errors? |
| **"404 Not Found" on the .js URL** | Your Pages might still be deploying. Wait 5 minutes. Also double-check the URL — it must match your username and repo name exactly (case-sensitive). |
| **Voice/Chat doesn't respond** | Check your webhook URL and project ID are correct. Log into Make.com and make sure your scenario is turned ON. |
| **Widget looks wrong on mobile** | It should adjust automatically. If your site has custom styles that conflict, the panel might need tweaking — contact us. |
| **Need a different corner** | Add `data-position="bottom-left"` (options: `bottom-right`, `bottom-left`, `top-right`, `top-left`) |
| **Want just voice, no chat tab** | Change `data-mode="dual"` to `data-mode="voice"` |
| **Want just chat, no voice tab** | Change `data-mode="dual"` to `data-mode="chat"` |

---

## Quick Reference Card

Cut-and-paste template (fill in the **bold** parts):

```html
<script src="https://YOUR-USERNAME.github.io/YOUR-REPO/fluvio-universal-widget-v2.js"
        data-webhook="https://hook.us2.make.com/YOUR-WEBHOOK"
        data-project-id="YOUR-PROJECT-ID"
        data-mode="dual"
        data-color="#347D9B"
        data-title="AI Assistant"
        data-subtitle="Voice & Chat Support"
        data-fab-text="Talk to AI"
        data-agent-name="Alex"
        data-company-name="Your Company"></script>
```

That's it. Refresh your website and you'll see the chat bubble in the bottom-right corner.
