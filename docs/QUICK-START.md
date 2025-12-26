# Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Choose Your Widget Type

**Universal Widget (Floating Chat)**
- Appears as floating button on any page
- Best for: General website use, customer support

**Button Widget (Custom Buttons)**  
- Turn any button into a voice call button
- Best for: Specific call-to-actions, custom designs

### Step 2: Get Your Widget URLs

After following the GitHub setup, your widgets will be at:
```
https://YOUR-USERNAME.github.io/voice-widgets/fluvio-universal-widget.js
https://YOUR-USERNAME.github.io/voice-widgets/fluvio-button-widget.js
```

### Step 3: Add to Your Website

#### Universal Widget
```html
<script src="https://YOUR-USERNAME.github.io/voice-widgets/fluvio-universal-widget.js" 
        data-webhook="https://hook.us2.make.com/your-webhook"
        data-agent-id="agent_your_agent_id"></script>
```

#### Button Widget
```html
<button class="fluvio-call-btn" 
        data-webhook="https://hook.us2.make.com/your-webhook"
        data-agent-id="agent_your_agent_id">Call Now</button>
<script src="https://YOUR-USERNAME.github.io/voice-widgets/fluvio-button-widget.js"></script>
```

### Step 4: Configure Your Settings

Replace these with your actual values:
- `your-webhook` - Your Make.com webhook URL
- `your_agent_id` - Your Retell AI agent ID

## 🎨 Basic Customization

### Colors and Branding
```html
<script src="your-widget-url" 
        data-webhook="your-webhook"
        data-agent-id="your-agent-id"
        data-color="#YOUR-BRAND-COLOR"
        data-title="Your Assistant Name"
        data-company-name="Your Company"></script>
```

### Position (Universal Widget Only)
```html
data-position="bottom-right"    <!-- Default -->
data-position="bottom-left"     <!-- Left side -->
data-position="top-right"       <!-- Top right -->
data-position="top-left"        <!-- Top left -->
```

### Transcript Control
```html
data-show-transcript="false"    <!-- Default: OFF -->
data-show-transcript="true"     <!-- Default: ON -->
```

## 🧪 Testing

1. **Test the demos first:**
   - `examples/universal-demo.html`
   - `examples/button-demo.html`

2. **Check your implementation:**
   - Widget appears correctly
   - Clicking works (demo mode)
   - Mobile responsive

3. **Verify with real calls:**
   - Update webhook and agent ID
   - Test actual voice calls

## 📱 Platform-Specific Instructions

### WordPress
Add to `functions.php` or use "Insert Headers and Footers" plugin

### Shopify  
Add to `theme.liquid` before `</body>` tag

### Squarespace/Wix
Use Code Injection or HTML embed blocks

### React/Next.js
```jsx
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'your-widget-url';
  script.setAttribute('data-webhook', 'your-webhook');
  script.setAttribute('data-agent-id', 'your-agent-id');
  document.body.appendChild(script);
}, []);
```

## ✅ Success Checklist

- [ ] GitHub repository set up
- [ ] Widget URLs working
- [ ] Demo examples tested
- [ ] Added to your website
- [ ] Webhook and agent ID configured
- [ ] Voice calls working
- [ ] Mobile tested
- [ ] Customized branding

## 🆘 Common Issues

**Widget not appearing:**
- Check JavaScript URL loads (paste in browser)
- Verify no JavaScript errors (F12 console)
- Ensure script tag is before `</body>`

**Calls not working:**
- Verify webhook URL is correct
- Check agent ID format
- Test webhook separately

**Styling conflicts:**
- Check for CSS conflicts
- Use browser dev tools to inspect

---

**Need more help?** Check the other guides in the `docs/` folder!