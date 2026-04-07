# Hosting Your Widget on GitHub Pages

GitHub Pages is a free hosting service that makes your widget file available at a permanent public URL. This guide walks you through the entire setup — no technical experience required.

**Time required:** 15–20 minutes

---

## What You Will Need

- A computer with internet access
- An email address to create a GitHub account
- The files from this folder

---

## Step 1: Create a GitHub Account

1. Go to [github.com](https://github.com)
2. Click **Sign up**
3. Enter your email address, create a password, and choose a username
4. Choose a username that is professional and easy to remember, such as `yourcompany-ai` or `yourname-widgets`
5. Complete the verification steps and choose the **Free** plan

---

## Step 2: Create a Repository

A repository is simply a folder on GitHub where your files will live.

1. After signing in, click the green **New** button on the left, or the **+** icon in the top-right corner
2. Fill in the details:
   - **Repository name:** `fluvio-widget` (or any name you prefer)
   - **Description:** `AI assistant widget for websites`
   - **Visibility:** Select **Public** — this is required for free hosting
   - Leave all other options unchanged
3. Click **Create repository**

---

## Step 3: Upload Your Files

1. On the repository page, click the link that says **uploading an existing file**
2. Drag and drop the following files into the upload area, or click **choose your files** to select them:
   - `fluvio-universal-widget.js`
   - `fluvio-button-widget.js`
   - `index.html`
   - `README.md`
   - The `docs/` folder and its contents
3. Scroll down to the **Commit changes** section
4. In the text box, type: `Add widget files`
5. Click the green **Commit changes** button

---

## Step 4: Enable Free Hosting

1. Click the **Settings** tab at the top of your repository
2. In the left sidebar, click **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Under **Branch**, select **main** from the dropdown
5. Leave the folder set to **/ (root)**
6. Click **Save**

GitHub will take 2–5 minutes to publish your files. You will see a confirmation message with your URL once it is ready.

---

## Step 5: Find Your Widget URL

Your widget will be available at:

```
https://YOUR-USERNAME.github.io/fluvio-widget/fluvio-universal-widget.js
https://YOUR-USERNAME.github.io/fluvio-widget/fluvio-button-widget.js
```

Replace `YOUR-USERNAME` with your GitHub username and `fluvio-widget` with whatever repository name you chose.

**To confirm it is working:** paste the URL into a browser. You should see a page of JavaScript code — that is correct.

---

## Step 6: Test the Demo Page

Open the following URL in your browser:

```
https://YOUR-USERNAME.github.io/fluvio-widget/index.html
```

You should see the Fluvio widget demo page. Enter your webhook URL and project ID, click **Update Widget**, and verify that the widget appears and responds correctly.

---

## Adding the Widget to Your Website

Once hosting is confirmed, use your GitHub Pages URL as the script source:

### Floating Widget

```html
<script src="https://YOUR-USERNAME.github.io/fluvio-widget/fluvio-universal-widget.js"
        data-webhook="https://hook.us2.make.com/your-webhook-url"
        data-project-id="YOUR-PROJECT-ID"
        data-mode="dual"
        data-title="AI Assistant"
        data-subtitle="Voice & Chat Support"></script>
```

### Call Button

```html
<button class="fluvio-call-btn"
        data-webhook="https://hook.us2.make.com/your-webhook-url"
        data-project-id="YOUR-PROJECT-ID">
    Talk to an Agent
</button>

<script src="https://YOUR-USERNAME.github.io/fluvio-widget/fluvio-button-widget.js"></script>
```

---

## Updating Your Widget in the Future

When a new version of the widget is available:

1. Go to your repository on GitHub
2. Click on the file you want to replace (e.g. `fluvio-universal-widget.js`)
3. Click the pencil icon to edit, or use the upload option to replace the file
4. Scroll down and click **Commit changes**
5. The update will be live within 2–5 minutes

---

## Troubleshooting

**"Page not found" when visiting the URL**
- Wait 5–10 minutes after enabling Pages — it can take time to activate
- Confirm the repository is set to **Public** in Settings
- Double-check the URL spelling, including your exact username

**Widget does not load on my website**
- Paste the `.js` URL into a browser to confirm it is accessible
- Make sure the script tag is placed before the closing `</body>` tag in your HTML
- Open the browser developer tools (press F12) and check the Console tab for errors

**Need to rename the repository**
1. Go to **Settings** in your repository
2. Under **General**, find **Repository name**
3. Enter the new name and click **Rename**
4. Update any links or script tags that reference the old URL

---

## Setup Checklist

- [ ] GitHub account created
- [ ] Repository created and set to Public
- [ ] All widget files uploaded
- [ ] GitHub Pages enabled on the main branch
- [ ] Widget URL confirmed working in browser
- [ ] Demo page (`index.html`) loads correctly
- [ ] Widget added to your website with correct webhook and project ID
