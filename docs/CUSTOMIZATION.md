# Customization Guide

## 🎨 Universal Widget Options

### Basic Configuration
```html
<script src="your-widget-url" 
        data-webhook="https://hook.us2.make.com/your-webhook"
        data-agent-id="agent_your_agent_id"
        data-color="#347D9B"
        data-position="bottom-right"
        data-title="Voice Assistant"
        data-subtitle="Live Voice Agent"
        data-show-transcript="false"></script>
```

### All Available Options

| Option | Default | Description |
|--------|---------|-------------|
| `data-webhook` | Required | Your Make.com webhook URL |
| `data-agent-id` | Required | Your Retell AI agent ID |
| `data-color` | `#347D9B` | Primary color (hex code) |
| `data-position` | `bottom-right` | Widget position |
| `data-title` | `Voice Assistant` | Panel title |
| `data-subtitle` | `Live Voice Agent` | Panel subtitle |
| `data-show-transcript` | `false` | Show transcript by default |

### Position Options
- `bottom-right` (default)
- `bottom-left`
- `top-right`
- `top-left`

### Color Examples
```html
<!-- Blue (default) -->
data-color="#347D9B"

<!-- Green -->
data-color="#28a745"

<!-- Orange -->
data-color="#ff6b35"

<!-- Purple -->
data-color="#6f42c1"

<!-- Custom brand color -->
data-color="#YOUR-HEX-COLOR"
```

## 🔘 Button Widget Options

### Basic Button
```html
<button class="fluvio-call-btn" 
        data-webhook="https://hook.us2.make.com/your-webhook"
        data-agent-id="agent_your_agent_id">Call Now</button>
```

### All Available Options

| Option | Description |
|--------|-------------|
| `data-webhook` | Your Make.com webhook URL |
| `data-agent-id` | Your Retell AI agent ID |
| `data-company-name` | Company name for personalization |
| `data-agent-name` | AI agent name |
| `data-agent-title` | Agent title/role |
| `data-company-number` | Company phone number |
| `data-company-hours` | Business hours |
| `data-company-address` | Company address |
| `data-greeting` | Custom greeting message |

### Dynamic Variables Example
```html
<button class="fluvio-call-btn" 
        data-webhook="your-webhook"
        data-agent-id="your-agent-id"
        data-company-name="TechCorp Solutions"
        data-agent-name="Sarah"
        data-agent-title="Sales Representative"
        data-company-hours="Mon-Fri 9am-6pm"
        data-greeting="Hi! I'm {{AI_agent}} from {{company_name}}. How can I help you today?">
    Talk to {{AI_agent}}
</button>
```

### Button Styling
```css
/* Custom button styles */
.fluvio-call-btn {
    background: #your-color;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.fluvio-call-btn:hover {
    background: #darker-shade;
    transform: translateY(-1px);
}
```

## 🏢 Dynamic Variables

Use these variables in your `data-greeting` and other text:

| Variable | Usage |
|----------|-------|
| `{{AI_agent}}` | Agent name |
| `{{company_name}}` | Company name |
| `{{AI_agent_title}}` | Agent title |
| `{{company_number}}` | Phone number |
| `{{company_hours}}` | Business hours |
| `{{company_address}}` | Address |

### Example Greetings
```html
<!-- Professional -->
data-greeting="Hello! I'm {{AI_agent}}, {{AI_agent_title}} at {{company_name}}. How can I assist you?"

<!-- Casual -->
data-greeting="Hi there! {{AI_agent}} here from {{company_name}}. What can I help you with?"

<!-- Real Estate -->
data-greeting="Welcome! I'm {{AI_agent}}, your {{AI_agent_title}} at {{company_name}}. Ready to find your dream home?"

<!-- Support -->
data-greeting="Hi! I'm {{AI_agent}} from {{company_name}} support. I'm here to help resolve any issues you have."
```

## 🎯 Use Case Examples

### E-commerce Product Page
```html
<button class="fluvio-call-btn product-call-btn" 
        data-webhook="your-webhook"
        data-agent-id="agent_sales_id"
        data-company-name="ShopCorp"
        data-agent-name="Mike"
        data-agent-title="Sales Specialist"
        data-greeting="Hi! I'm {{AI_agent}}, a {{AI_agent_title}} at {{company_name}}. I can help you with this product!">
    🛒 Talk to Sales
</button>
```

### Real Estate Listing
```html
<button class="fluvio-call-btn property-btn" 
        data-webhook="your-webhook"
        data-agent-id="agent_realty_id"
        data-company-name="Prime Realty"
        data-agent-name="Sarah"
        data-agent-title="Real Estate Agent"
        data-greeting="Hi! I'm {{AI_agent}} from {{company_name}}. I'd love to tell you more about this property!">
    🏠 Call Agent
</button>
```

### Support Page
```html
<button class="fluvio-call-btn support-btn" 
        data-webhook="your-webhook"
        data-agent-id="agent_support_id"
        data-company-name="TechSupport Inc"
        data-agent-name="Alex"
        data-agent-title="Technical Support"
        data-company-hours="24/7 Support Available"
        data-greeting="Hello! I'm {{AI_agent}} from {{company_name}} {{AI_agent_title}}. How can I help resolve your issue?">
    🔧 Get Help
</button>
```

## 📱 Mobile Optimization

Both widgets are mobile-responsive by default, but you can customize:

### Universal Widget Mobile
```css
/* Custom mobile styles */
@media (max-width: 768px) {
    #fluvio-fab {
        width: 52px;
        height: 52px;
        bottom: 16px;
        right: 16px;
    }
    
    #fluvio-panel {
        width: calc(100vw - 24px);
        right: 12px;
        left: 12px;
    }
}
```

### Button Widget Mobile
```css
@media (max-width: 768px) {
    .fluvio-call-btn {
        width: 100%;
        padding: 16px;
        font-size: 18px;
    }
}
```

## 🔧 Advanced Customization

### Multiple Agents
```html
<!-- Sales Button -->
<button class="fluvio-call-btn" 
        data-webhook="https://hook.us2.make.com/sales-webhook"
        data-agent-id="agent_sales_id">Sales Inquiry</button>

<!-- Support Button -->
<button class="fluvio-call-btn" 
        data-webhook="https://hook.us2.make.com/support-webhook"
        data-agent-id="agent_support_id">Get Support</button>
```

### Conditional Loading
```javascript
// Load widget only on certain pages
if (window.location.pathname.includes('/contact')) {
    const script = document.createElement('script');
    script.src = 'your-widget-url';
    script.setAttribute('data-webhook', 'your-webhook');
    script.setAttribute('data-agent-id', 'your-agent-id');
    document.body.appendChild(script);
}
```

### Custom Events
```javascript
// Listen for widget events
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('fluvio-call-btn')) {
        // Track button clicks
        gtag('event', 'voice_call_started', {
            'button_text': e.target.textContent
        });
    }
});
```

---

**Need more examples?** Check the demo files in the `examples/` folder!