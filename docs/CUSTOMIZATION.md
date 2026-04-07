# Customization Guide

All widget options are set directly in the script tag using `data-` attributes. No coding knowledge is required — simply change the values to match your brand.

---

## Universal Widget — All Options

```html
<script src="https://YOUR-HOSTING-URL/fluvio-universal-widget.js"
        data-webhook="https://hook.us2.make.com/your-webhook-url"
        data-project-id="YOUR-PROJECT-ID"
        data-mode="dual"
        data-default-mode="voice"
        data-color="#347D9B"
        data-position="bottom-right"
        data-title="AI Assistant"
        data-subtitle="Voice & Chat Support"
        data-agent-name="Sarah"
        data-company-name="Acme Corp"
        data-company-hours="Mon–Fri, 9am–6pm"
        data-greeting="Hi! I am Sarah from Acme Corp. How can I help you today?"></script>
```

### Complete Options Reference

| Option | Required | Default | Description |
|--------|----------|---------|-------------|
| `data-webhook` | Yes | — | Your Make.com webhook URL |
| `data-project-id` | Yes | — | Your Fluvio project ID |
| `data-mode` | No | `dual` | Widget mode: `dual`, `voice`, or `chat` |
| `data-default-mode` | No | `voice` | Which tab opens first: `voice` or `chat` |
| `data-color` | No | `#347D9B` | Primary brand color (hex format) |
| `data-position` | No | `bottom-right` | Corner of the screen: `bottom-right`, `bottom-left`, `top-right`, `top-left` |
| `data-title` | No | `AI Assistant` | Title shown in the widget header |
| `data-subtitle` | No | `Voice & Chat Support` | Subtitle shown below the title |
| `data-agent-name` | No | `AI` | Name of your AI agent |
| `data-company-name` | No | — | Your company name |
| `data-company-hours` | No | — | Business hours, shown to the visitor |
| `data-company-address` | No | — | Your business address |
| `data-greeting` | No | — | Opening message shown when chat starts |

---

## Choosing a Color

Set `data-color` to any hex color code. A few examples:

```html
data-color="#347D9B"   <!-- Fluvio default blue -->
data-color="#1a73e8"   <!-- Google blue -->
data-color="#0f9d58"   <!-- Green -->
data-color="#e53935"   <!-- Red -->
data-color="#6200ea"   <!-- Purple -->
data-color="#FF6B35"   <!-- Orange -->
```

To find your brand's exact color code, search for "[your brand name] brand colors hex" or ask your designer.

---

## Writing a Custom Greeting

The greeting is the first message visitors see when they open the chat tab. Use these placeholders and they will be filled in automatically:

| Placeholder | Replaced with |
|-------------|--------------|
| `{{AI_agent}}` | The value of `data-agent-name` |
| `{{company_name}}` | The value of `data-company-name` |
| `{{AI_agent_title}}` | The value of `data-agent-title` |
| `{{company_hours}}` | The value of `data-company-hours` |

### Greeting Examples

```html
<!-- General purpose -->
data-greeting="Hello! I am {{AI_agent}} from {{company_name}}. How can I help you today?"

<!-- Customer support -->
data-greeting="Welcome to {{company_name}} support. I am {{AI_agent}} and I am here to help."

<!-- Real estate -->
data-greeting="Hi! I am {{AI_agent}}, your agent at {{company_name}}. What property can I help you with?"

<!-- After hours -->
data-greeting="Thanks for reaching out. Our team is available {{company_hours}}. How can I assist you?"
```

---

## Button Widget — All Options

The button widget converts any HTML button into an AI call button.

```html
<button class="fluvio-call-btn"
        data-webhook="https://hook.us2.make.com/your-webhook-url"
        data-project-id="YOUR-PROJECT-ID"
        data-company-name="Acme Corp"
        data-agent-name="Sarah"
        data-agent-title="Sales Representative"
        data-company-hours="Mon–Fri, 9am–6pm"
        data-greeting="Hi! I am {{AI_agent}}, {{AI_agent_title}} at {{company_name}}. How can I help?">
    Talk to Sales
</button>

<script src="https://YOUR-HOSTING-URL/fluvio-button-widget.js"></script>
```

### Styling the Button

By default the button inherits your website's styles. To apply a custom look, add CSS:

```css
.fluvio-call-btn {
    background-color: #347D9B;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
}

.fluvio-call-btn:hover {
    background-color: #2a6480;
}

/* Full-width on mobile */
@media (max-width: 768px) {
    .fluvio-call-btn {
        width: 100%;
        padding: 16px;
    }
}
```

---

## Industry Examples

### E-commerce — Product Page Call Button

```html
<button class="fluvio-call-btn"
        data-webhook="https://hook.us2.make.com/your-webhook-url"
        data-project-id="YOUR-PROJECT-ID"
        data-company-name="ShopCorp"
        data-agent-name="Mike"
        data-agent-title="Sales Specialist"
        data-greeting="Hi! I am {{AI_agent}}, a {{AI_agent_title}} at {{company_name}}. I can answer questions about this product.">
    Talk to a Specialist
</button>
<script src="https://YOUR-HOSTING-URL/fluvio-button-widget.js"></script>
```

### Real Estate — Property Listing

```html
<button class="fluvio-call-btn"
        data-webhook="https://hook.us2.make.com/your-webhook-url"
        data-project-id="YOUR-PROJECT-ID"
        data-company-name="Prime Realty"
        data-agent-name="Sarah"
        data-agent-title="Real Estate Agent"
        data-greeting="Hi! I am {{AI_agent}} from {{company_name}}. I would love to tell you more about this property.">
    Speak with an Agent
</button>
<script src="https://YOUR-HOSTING-URL/fluvio-button-widget.js"></script>
```

### Support Page — Floating Widget

```html
<script src="https://YOUR-HOSTING-URL/fluvio-universal-widget.js"
        data-webhook="https://hook.us2.make.com/your-webhook-url"
        data-project-id="YOUR-PROJECT-ID"
        data-mode="chat"
        data-color="#0f9d58"
        data-title="Support"
        data-subtitle="We reply instantly"
        data-agent-name="Alex"
        data-greeting="Hello! I am {{AI_agent}} from support. How can I help resolve your issue?"></script>
```

### Multiple Widgets on One Page

You can use multiple button widgets on the same page — for example, separate buttons for sales and support:

```html
<!-- Sales button -->
<button class="fluvio-call-btn"
        data-webhook="https://hook.us2.make.com/sales-webhook"
        data-project-id="SALES-PROJECT-ID"
        data-agent-name="Mike">
    Talk to Sales
</button>

<!-- Support button -->
<button class="fluvio-call-btn"
        data-webhook="https://hook.us2.make.com/support-webhook"
        data-project-id="SUPPORT-PROJECT-ID"
        data-agent-name="Alex">
    Contact Support
</button>

<script src="https://YOUR-HOSTING-URL/fluvio-button-widget.js"></script>
```

---

## Mobile Behavior

Both widgets automatically adjust their layout for mobile screens. No extra configuration is needed. The widget panel will resize to fit smaller screens, and the font size increases slightly to prevent iOS from zooming in when the input is tapped.

---

For setup instructions, see `docs/QUICK-START.md`.
For hosting instructions, see `GITHUB-SETUP-GUIDE.md`.
