# GitHub Setup Guide (No Experience Needed!)

## 🎯 What We're Doing

We're going to put your voice widgets on GitHub Pages - a free hosting service. This means:
- ✅ Your widgets will be available worldwide
- ✅ Free hosting forever
- ✅ Easy to update
- ✅ Professional URLs

**Time needed:** 10-15 minutes

## 📋 Before We Start

You'll need:
- A computer with internet
- An email address
- The files from this CLIENT-DELIVERY folder

That's it! No technical knowledge required.

## Step 1: Create GitHub Account (2 minutes)

1. Go to [GitHub.com](https://github.com)
2. Click the green **"Sign up"** button
3. Enter your email, create a password, choose a username
4. **Important:** Choose a professional username (like `yourcompany-widgets` or `yourname-voice`)
5. Complete the verification
6. Choose the free plan

## Step 2: Create Your Widget Repository (3 minutes)

1. After signing in, click the green **"New"** button (or the **"+"** in top right)
2. **Repository name:** Type `voice-widgets` (or your preferred name)
3. **Description:** Type "Voice AI widgets for websites"
4. **Make sure it's PUBLIC** ✅ (required for free hosting)
5. **DO NOT** check "Add a README file" (we have our own)
6. Click **"Create repository"**

## Step 3: Upload Your Files (5 minutes)

You'll see a page with instructions. We'll use the easy method:

1. Click **"uploading an existing file"** (blue link in the middle)
2. **Drag and drop ALL files** from your CLIENT-DELIVERY folder into the box
   - Or click "choose your files" and select all files
3. **Important:** Make sure you upload:
   - `fluvio-universal-widget.js`
   - `fluvio-button-widget.js`
   - `README.md`
   - All folders (`examples/`, `docs/`)
4. Scroll down to "Commit changes"
5. In the box, type: `Initial widget setup`
6. Click **"Commit changes"** (green button)

## Step 4: Enable Free Hosting (2 minutes)

1. Click **"Settings"** tab (at the top of your repository)
2. Scroll down to **"Pages"** section (left sidebar)
3. Under "Source", select **"Deploy from a branch"**
4. Under "Branch", select **"main"**
5. Leave folder as **"/ (root)"**
6. Click **"Save"**

## Step 5: Get Your Widget URLs (2 minutes)

After 2-3 minutes, your widgets will be live! Your URLs will be:

```
https://YOUR-USERNAME.github.io/voice-widgets/fluvio-universal-widget.js
https://YOUR-USERNAME.github.io/voice-widgets/fluvio-button-widget.js
```

**Replace `YOUR-USERNAME` with your actual GitHub username**

### Test Your URLs
1. Copy your universal widget URL
2. Paste it in a browser
3. You should see JavaScript code (that's correct!)

## Step 6: Test Your Widgets (3 minutes)

Visit your demo page:
```
https://YOUR-USERNAME.github.io/voice-widgets/examples/universal-demo.html
```

1. You should see a blue floating button
2. Click it to open the chat
3. Click "Call" to test (demo mode)
4. If it works, you're ready! 🎉

## 🎯 Using Your Widgets

Now you can add voice widgets to any website using your URLs:

### Universal Widget (Floating Chat)
```html
<script src="https://YOUR-USERNAME.github.io/voice-widgets/fluvio-universal-widget.js" 
        data-webhook="https://hook.us2.make.com/your-webhook"
        data-agent-id="agent_your_agent_id"></script>
```

### Button Widget (Custom Buttons)
```html
<button class="fluvio-call-btn" 
        data-webhook="https://hook.us2.make.com/your-webhook"
        data-agent-id="agent_your_agent_id">Call Now</button>
<script src="https://YOUR-USERNAME.github.io/voice-widgets/fluvio-button-widget.js"></script>
```

## 🔧 Making Changes Later

To update your widgets:
1. Go to your repository on GitHub
2. Click on the file you want to edit
3. Click the pencil icon (✏️) to edit
4. Make your changes
5. Scroll down and click "Commit changes"
6. Changes go live in 2-3 minutes!

## 🆘 Troubleshooting

### "Page not found" error
- Wait 5-10 minutes after enabling Pages
- Check that repository is PUBLIC
- Verify the URL spelling

### Widget not loading on website
- Check the JavaScript URL in browser (should show code)
- Verify webhook and agent-id are correct
- Check browser console for errors (F12)

### Need to change repository name?
1. Go to Settings tab
2. Scroll to "Repository name"
3. Change and click "Rename"
4. Update your URLs accordingly

## ✅ Success Checklist

- [ ] GitHub account created
- [ ] Repository created and PUBLIC
- [ ] All files uploaded successfully
- [ ] GitHub Pages enabled
- [ ] Widget URLs work in browser
- [ ] Demo page loads and works
- [ ] Ready to add to websites!

## 🎉 You Did It!

Your voice widgets are now:
- ✅ Hosted on reliable GitHub Pages
- ✅ Available worldwide
- ✅ Easy to update
- ✅ Free forever

**Next steps:**
1. Read `docs/CUSTOMIZATION.md` to customize colors and branding
2. Read `docs/PLATFORM-GUIDES.md` for your specific website platform
3. Update your webhook and agent IDs
4. Deploy to your websites!

---

**Questions?** All documentation is in the `docs/` folder of your repository.