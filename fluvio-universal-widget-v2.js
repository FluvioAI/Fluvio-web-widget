/**
 * Fluvio Universal Voice Widget
 * Deploy to any website with a single script tag
 * 
 * Usage:
 * <script src="https://your-domain.com/fluvio-universal-widget.js" 
 *         data-webhook="https://hook.us2.make.com/your-webhook"
 *         data-project-id="project_your_project_id"></script>
 */

(function() {
  'use strict';

  // Capture script reference synchronously before any async work (document.currentScript is null after defer/async)
  const currentScript = document.currentScript || document.querySelector('script[src*="fluvio-universal-widget"]');

  const config = {
    webhook:      currentScript?.getAttribute('data-webhook') || '',
    projectId:    currentScript?.getAttribute('data-project-id') || '',
    agentId:      currentScript?.getAttribute('data-agent-id') || '',       // Deprecated
    voiceAgentId: currentScript?.getAttribute('data-voice-agent-id') || '', // Deprecated
    chatAgentId:  currentScript?.getAttribute('data-chat-agent-id') || '',  // Deprecated
    color:        currentScript?.getAttribute('data-color') || '#347D9B',
    position:     currentScript?.getAttribute('data-position') || 'bottom-right',
    title:        currentScript?.getAttribute('data-title') || 'AI Assistant',
    subtitle:     currentScript?.getAttribute('data-subtitle') || 'Voice & Chat Support',
    mode:         currentScript?.getAttribute('data-mode') || 'dual',
    defaultMode:  currentScript?.getAttribute('data-default-mode') || 'voice',
    companyName:  currentScript?.getAttribute('data-company-name') || '',
    companyNumber:currentScript?.getAttribute('data-company-number') || '',
    companyHours: currentScript?.getAttribute('data-company-hours') || '',
    agentName:    currentScript?.getAttribute('data-agent-name') || '',
    agentTitle:   currentScript?.getAttribute('data-agent-title') || '',
    companyAddress:currentScript?.getAttribute('data-company-address') || '',
    greeting:     currentScript?.getAttribute('data-greeting') || '',
    chatGreeting: currentScript?.getAttribute('data-chat-greeting') || '',
    // Explicit demo mode flag — avoids substring-sniffing on real project IDs
    demoMode:     currentScript?.getAttribute('data-demo') === 'true',
  };

  // Prevent multiple instances
  if (window.FluvioWidgetLoaded) {
    console.warn('Fluvio Widget already loaded');
    return;
  }
  window.FluvioWidgetLoaded = true;

  // ── C3: Webhook URL validation ──────────────────────────────────────────────
  function isValidWebhookUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // ── C1/C2: HTML escaping — never interpolate dynamic data into innerHTML ────
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── H1: Promise with timeout ────────────────────────────────────────────────
  function withTimeout(promise, ms, fallback) {
    const timer = new Promise((resolve) => setTimeout(() => resolve(fallback), ms));
    return Promise.race([promise, timer]);
  }


  // Inline SVGs — eliminates the Lucide CDN dependency entirely.
  // Icons used: Phone, PhoneOff, MessageCircle, X, Bot, User, Send
  const ICONS = {
    Phone: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    PhoneOff: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.62 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10.91"/><line x1="2" y1="2" x2="22" y2="22"/></svg>',
    MessageCircle: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    X: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    Bot: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>',
    User: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    Send: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  };

  function createIcon(name) {
    return ICONS[name] || ICONS.MessageCircle;
  }

  // No-op retained so any remaining call sites don't throw
  function initializeLucideIcons() {}

  // Inject CSS styles
  function injectStyles() {
    const css = `
      #fluvio-fab {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${config.color};
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 999999;
        font-size: 24px;
        box-shadow: 0 8px 32px rgba(52, 125, 155, 0.3);
        transition: all 0.3s ease;
        animation: fluvio-float 3s ease-in-out infinite;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border: none;
      }

      #fluvio-fab svg {
        width: 24px;
        height: 24px;
      }

      #fluvio-fab:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 12px 40px rgba(52, 125, 155, 0.4);
      }

      @keyframes fluvio-float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }

      #fluvio-panel {
        position: fixed;
        bottom: 100px;
        right: 20px;
        width: 380px;
        max-width: calc(100vw - 40px);
        max-height: calc(100vh - 140px);
        background: #fff;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        z-index: 999999;
        display: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
        animation: fluvio-slideUp 0.3s ease-out;
        flex-direction: column;
      }

      @keyframes fluvio-slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      #fluvio-header {
        background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%);
        color: white;
        padding: 13px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      #fluvio-header-content {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      #fluvio-header-icon {
        width: 28px;
        height: 28px;
        background: rgba(255,255,255,0.2);
        border-radius: 7px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }

      #fluvio-header-icon svg {
        width: 14px;
        height: 14px;
      }

      #fluvio-header-text h4 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        line-height: 1.2;
      }

      #fluvio-header-text p {
        margin: 1px 0 0 0;
        font-size: 12px;
        opacity: 0.85;
        font-weight: 400;
      }

      #fluvio-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background 0.2s ease;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #fluvio-close svg {
        width: 20px;
        height: 20px;
      }

      #fluvio-close:hover {
        background: rgba(255,255,255,0.1);
      }

      #fluvio-content {
        padding: 12px 20px 12px;
        text-align: center;
        max-height: calc(100vh - 180px);
        overflow-y: auto;
      }

      #fluvio-mode-selector {
        display: flex;
        background: #fff;
        border-bottom: 2px solid #E5E7EB;
        margin-bottom: 12px;
        gap: 0;
        padding: 0;
      }

      .fluvio-mode-btn {
        flex: 1;
        padding: 9px 16px;
        border: none;
        border-bottom: 3px solid transparent;
        margin-bottom: -2px;
        border-radius: 0;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        background: transparent;
        color: #9CA3AF;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .fluvio-mode-btn svg {
        width: 15px;
        height: 15px;
      }

      .fluvio-mode-btn.active {
        color: ${config.color};
        border-bottom: 3px solid ${config.color};
        background: transparent;
      }

      .fluvio-mode-btn:hover:not(.active) {
        color: #374151;
        background: #F9FAFB;
      }

      #fluvio-chat-container {
        display: none;
        text-align: left;
      }

      #fluvio-chat-container.active {
        display: block !important;
      }

      #fluvio-chat-messages {
        height: 180px;
        max-height: calc(30vh - 60px);
        overflow-y: auto;
        overflow-x: hidden;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        background: #FAFAFA;
        color: #374151;
      }

      .fluvio-message {
        margin-bottom: 16px;
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }

      .fluvio-message.user {
        flex-direction: row-reverse;
      }

      .fluvio-message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
      }

      .fluvio-message-avatar svg {
        width: 16px;
        height: 16px;
      }

      .fluvio-message.agent .fluvio-message-avatar {
        background: ${config.color};
        color: white;
      }

      .fluvio-message.user .fluvio-message-avatar {
        background: #6B7280;
        color: white;
      }

      .fluvio-message-content {
        background: white;
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 70%;
        font-size: 14px;
        line-height: 1.4;
        border: 1px solid #E5E7EB;
        color: #374151;
        word-break: break-word;
        overflow-wrap: break-word;
        min-width: 0;
      }

      .fluvio-message.user .fluvio-message-content {
        background: ${config.color};
        color: white;
        border-color: ${config.color};
      }

      .fluvio-message.agent .fluvio-message-content {
        background: white;
        color: #1F2937 !important;
        border-color: #E5E7EB;
      }

      #fluvio-chat-input-container {
        display: flex;
        gap: 8px;
      }

      #fluvio-chat-input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid #D1D5DB;
        border-radius: 8px;
        font-size: 14px;
        resize: none;
        min-height: 44px;
        max-height: 120px;
        font-family: inherit;
        box-sizing: border-box;
        overflow-y: hidden;
      }

      #fluvio-chat-input:focus {
        outline: none;
        border-color: ${config.color};
        box-shadow: 0 0 0 3px ${config.color}20;
      }

      #fluvio-chat-send {
        padding: 12px 16px;
        background: ${config.color};
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: background 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      #fluvio-chat-send svg {
        width: 16px;
        height: 16px;
      }

      #fluvio-chat-send:hover:not(:disabled) {
        background: ${config.color}dd;
      }

      #fluvio-chat-send:disabled {
        background: #9CA3AF;
        cursor: not-allowed;
      }

      #fluvio-voice-container {
        display: block;
        text-align: center;
      }

      #fluvio-voice-container.active {
        display: block;
      }

      .fluvio-typing-indicator {
        display: none;
        align-items: center;
        gap: 8px;
        color: #6B7280;
        font-size: 14px;
        font-style: italic;
        margin-bottom: 12px;
      }

      .fluvio-typing-indicator.show {
        display: flex;
      }

      .fluvio-typing-dots {
        display: flex;
        gap: 4px;
      }

      .fluvio-typing-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #9CA3AF;
        animation: fluvio-typing 1.4s infinite ease-in-out;
      }

      .fluvio-typing-dot:nth-child(1) { animation-delay: -0.32s; }
      .fluvio-typing-dot:nth-child(2) { animation-delay: -0.16s; }

      @keyframes fluvio-typing {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }

      #fluvio-footer {
        padding: 10px 24px 14px;
        text-align: center;
        border-top: 1px solid #F3F4F6;
        background: #FAFAFA;
        flex-shrink: 0;
        position: sticky;
        bottom: 0;
        z-index: 1;
      }

      #fluvio-branding {
        font-size: 12px;
        color: #9CA3AF;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;
      }

      #fluvio-branding:hover {
        color: ${config.color};
      }

      #fluvio-instruction {
        color: #6B7280;
        font-size: 16px;
        margin-bottom: 32px;
        line-height: 1.5;
      }

      #fluvio-status-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 10px 16px;
        background: #F9FAFB;
        border-radius: 10px;
      }

      #fluvio-status-label {
        font-size: 14px;
        color: #6B7280;
        font-weight: 500;
      }

      #fluvio-status {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
      }

      #fluvio-status.offline {
        color: #6B7280;
      }

      #fluvio-status.connecting {
        color: #F59E0B;
      }

      #fluvio-status.online {
        color: #10B981;
      }

      #fluvio-call-button {
        width: 100%;
        padding: 16px 24px;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-family: inherit;
      }

      #fluvio-call-button svg {
        width: 18px;
        height: 18px;
      }

      #fluvio-call-button.start {
        background: ${config.color};
        color: white;
      }

      #fluvio-call-button.start:hover:not(:disabled) {
        background: ${config.color}dd;
        transform: translateY(-1px);
      }

      #fluvio-call-button.end {
        background: #EF4444;
        color: white;
      }

      #fluvio-call-button.end:hover:not(:disabled) {
        background: #DC2626;
        transform: translateY(-1px);
      }

      #fluvio-call-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
      }

      /* ── ORB ── */
      #fluvio-orb-wrapper {
        position: relative;
        width: 96px;
        height: 96px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 4px auto 12px;
      }

      #fluvio-orb-glow {
        position: absolute;
        inset: -20px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(52,125,155,0.2) 0%, transparent 70%);
        opacity: 0.7;
        animation: fluvio-orb-breathe 4s ease-in-out infinite;
      }

      #fluvio-orb-ripple, #fluvio-orb-ripple2 {
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        border: 2px solid rgba(52,125,155,0.25);
        opacity: 0;
      }

      #fluvio-orb-core {
        position: relative;
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: radial-gradient(circle at 38% 35%,
          #5aafc7 0%, #347D9B 42%, #1b5470 75%, #0d2e3e 100%
        );
        box-shadow:
          0 0 28px 6px rgba(52,125,155,0.28),
          inset 0 -6px 18px rgba(0,0,0,0.38),
          inset 0 3px 10px rgba(255,255,255,0.13);
        animation: fluvio-orb-breathe-core 4s ease-in-out infinite;
        transition: background 0.5s ease, box-shadow 0.4s ease;
      }

      #fluvio-orb-core::before {
        content: '';
        position: absolute;
        top: 12px; left: 18px;
        width: 24px; height: 15px;
        border-radius: 50%;
        background: rgba(255,255,255,0.22);
        filter: blur(4px);
        transform: rotate(-30deg);
      }

      #fluvio-orb-core::after {
        content: '';
        position: absolute;
        top: 18px; left: 24px;
        width: 10px; height: 6px;
        border-radius: 50%;
        background: rgba(255,255,255,0.44);
        filter: blur(2px);
        transform: rotate(-20deg);
      }

      @keyframes fluvio-orb-breathe {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50%       { opacity: 1;   transform: scale(1.06); }
      }
      @keyframes fluvio-orb-breathe-core {
        0%, 100% { transform: scale(1); }
        50%       { transform: scale(1.04); }
      }

      /* listening state */
      #fluvio-orb-wrapper.listening #fluvio-orb-core {
        animation: fluvio-orb-listen-core 1.6s ease-in-out infinite;
        background: radial-gradient(circle at 38% 35%,
          #7dc4d8 0%, #3d96b8 40%, #1e6580 75%, #0d2e3e 100%
        );
        box-shadow:
          0 0 44px 12px rgba(61,150,184,0.4),
          inset 0 -6px 18px rgba(0,0,0,0.38),
          inset 0 3px 10px rgba(255,255,255,0.16);
      }
      #fluvio-orb-wrapper.listening #fluvio-orb-glow {
        animation: fluvio-orb-listen-glow 1.6s ease-in-out infinite;
        background: radial-gradient(circle, rgba(61,150,184,0.28) 0%, transparent 70%);
      }
      #fluvio-orb-wrapper.listening #fluvio-orb-ripple {
        animation: fluvio-orb-ripple-out 1.8s ease-out infinite;
      }
      @keyframes fluvio-orb-listen-core {
        0%, 100% { transform: scale(1); }
        50%       { transform: scale(1.08); }
      }
      @keyframes fluvio-orb-listen-glow {
        0%, 100% { opacity: 0.7; }
        50%       { opacity: 1; }
      }

      /* talking state */
      #fluvio-orb-wrapper.talking #fluvio-orb-core {
        animation: fluvio-orb-talk-core 0.85s ease-in-out infinite alternate;
        background: radial-gradient(circle at 38% 35%,
          #8fd4e8 0%, #47afd1 35%, #2278a0 65%, #0d2e3e 100%
        );
        box-shadow:
          0 0 64px 20px rgba(71,175,209,0.55),
          inset 0 -6px 18px rgba(0,0,0,0.38),
          inset 0 3px 10px rgba(255,255,255,0.18);
      }
      #fluvio-orb-wrapper.talking #fluvio-orb-glow {
        animation: fluvio-orb-talk-glow 0.85s ease-in-out infinite alternate;
        background: radial-gradient(circle, rgba(71,175,209,0.38) 0%, transparent 65%);
      }
      #fluvio-orb-wrapper.talking #fluvio-orb-ripple {
        animation: fluvio-orb-ripple-out 1.1s ease-out infinite;
        border-color: rgba(71,175,209,0.4);
      }
      #fluvio-orb-wrapper.talking #fluvio-orb-ripple2 {
        animation: fluvio-orb-ripple-out 1.1s ease-out infinite 0.55s;
        border-color: rgba(71,175,209,0.22);
      }
      @keyframes fluvio-orb-talk-core {
        0%   { transform: scale(1.0); }
        100% { transform: scale(1.11); }
      }
      @keyframes fluvio-orb-talk-glow {
        0%   { opacity: 0.8; transform: scale(1); }
        100% { opacity: 1;   transform: scale(1.1); }
      }
      @keyframes fluvio-orb-ripple-out {
        0%   { transform: scale(0.9);  opacity: 0.5; }
        100% { transform: scale(1.55); opacity: 0; }
      }

      #fluvio-orb-label {
        font-size: 11px;
        color: #9CA3AF;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: 500;
        margin-bottom: 10px;
        text-align: center;
        transition: color 0.4s ease;
        min-height: 16px;
      }

      /* Mobile responsiveness */
      @media (max-width: 768px) {
        #fluvio-fab {
          width: 56px;
          height: 56px;
          bottom: 16px;
          right: 16px;
          font-size: 22px;
          animation: none;
        }

        #fluvio-panel {
          width: calc(100vw - 32px) !important;
          max-width: calc(100vw - 32px) !important;
          right: 16px !important;
          left: 16px !important;
          bottom: 80px !important;
          top: auto !important;
          max-height: calc(100vh - 120px) !important;
          overflow-y: auto;
        }

        #fluvio-header {
          padding: 16px 20px;
        }

        #fluvio-content {
          padding: 16px 12px 12px;
        }

        #fluvio-instruction {
          font-size: 15px;
          margin-bottom: 24px;
        }

        #fluvio-chat-messages {
          height: 160px !important;
          max-height: calc(25vh - 30px) !important;
        }

        #fluvio-chat-input {
          max-height: 96px !important;
          font-size: 16px; /* Prevents zoom on iOS */
        }

        #fluvio-footer {
          padding: 8px 16px 12px !important;
        }
      }

      @media (max-width: 360px) {
        #fluvio-fab {
          width: 52px;
          height: 52px;
          bottom: 12px;
          right: 12px;
          font-size: 20px;
        }

        #fluvio-panel {
          width: calc(100vw - 24px) !important;
          max-width: calc(100vw - 24px) !important;
          right: 12px !important;
          left: 12px !important;
          bottom: 72px !important;
          border-radius: 16px;
          max-height: calc(100vh - 100px) !important;
        }

        #fluvio-chat-messages {
          height: 140px !important;
          max-height: calc(20vh - 20px) !important;
        }
      }

      /* Position variations */
      .fluvio-position-bottom-left #fluvio-fab {
        left: 20px;
        right: auto;
      }

      .fluvio-position-bottom-left #fluvio-panel {
        left: 20px;
        right: auto;
      }

      .fluvio-position-top-right #fluvio-fab {
        top: 20px;
        bottom: auto;
      }

      .fluvio-position-top-right #fluvio-panel {
        top: 100px;
        bottom: auto;
      }

      .fluvio-position-top-left #fluvio-fab {
        top: 20px;
        left: 20px;
        bottom: auto;
        right: auto;
      }

      .fluvio-position-top-left #fluvio-panel {
        top: 100px;
        left: 20px;
        bottom: auto;
        right: auto;
      }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Create widget UI
  function createWidget() {
    // Add position class to body
    document.body.classList.add(`fluvio-position-${config.position}`);

    // Create floating button
    const fab = document.createElement('div');
    fab.id = 'fluvio-fab';
    fab.innerHTML = createIcon('MessageCircle');
    fab.setAttribute('aria-label', 'Open AI assistant');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('role', 'button');
    fab.setAttribute('tabindex', '0');

    // Create panel
    const panel = document.createElement('div');
    panel.id = 'fluvio-panel';
    
    // Determine which modes to show
    const showVoice = config.mode === 'voice' || config.mode === 'dual';
    const showChat = config.mode === 'chat' || config.mode === 'dual';
    const showModeSelector = config.mode === 'dual';
    
    // C2: All config values escaped before insertion into innerHTML
    panel.innerHTML = `
      <div id="fluvio-header">
        <div id="fluvio-header-content">
          <div id="fluvio-header-icon">${createIcon('Bot')}</div>
          <div id="fluvio-header-text">
            <h4>${esc(config.title)}</h4>
            <p>${esc(config.subtitle)}</p>
          </div>
        </div>
        <button id="fluvio-close" aria-label="Close">${createIcon('X')}</button>
      </div>
      <div id="fluvio-content">
        ${showModeSelector ? `
        <div id="fluvio-mode-selector" role="tablist">
          <button class="fluvio-mode-btn ${config.defaultMode === 'voice' ? 'active' : ''}" data-mode="voice"
                  role="tab" aria-selected="${config.defaultMode === 'voice'}">
            ${createIcon('Phone')} Web Call
          </button>
          <button class="fluvio-mode-btn ${config.defaultMode === 'chat' ? 'active' : ''}" data-mode="chat"
                  role="tab" aria-selected="${config.defaultMode === 'chat'}">
            ${createIcon('MessageCircle')} Chat
          </button>
        </div>
        ` : ''}

        <div id="fluvio-voice-container" class="${!showModeSelector || config.defaultMode === 'voice' ? 'active' : ''}">
          <div id="fluvio-orb-wrapper" aria-hidden="true">
            <div id="fluvio-orb-glow"></div>
            <div id="fluvio-orb-ripple"></div>
            <div id="fluvio-orb-ripple2"></div>
            <div id="fluvio-orb-core"></div>
          </div>
          <div id="fluvio-orb-label">Ready</div>
          <div id="fluvio-status-section">
            <span id="fluvio-status-label">Status:</span>
            <span id="fluvio-status" class="offline" aria-live="polite">Loading...</span>
          </div>
          <button id="fluvio-call-button" class="start" disabled>
            <span id="fluvio-call-icon">${createIcon('Phone')}</span>
            <span id="fluvio-call-text">Start Call</span>
          </button>
        </div>

        <div id="fluvio-chat-container" class="${!showModeSelector || config.defaultMode === 'chat' ? 'active' : ''}">
          <div id="fluvio-chat-messages" aria-live="polite" aria-label="Chat messages"></div>
          <div class="fluvio-typing-indicator" id="fluvio-typing-indicator" aria-live="polite">
            <span>${esc(config.agentName || 'AI')} is typing...</span>
            <div class="fluvio-typing-dots">
              <div class="fluvio-typing-dot"></div>
              <div class="fluvio-typing-dot"></div>
              <div class="fluvio-typing-dot"></div>
            </div>
          </div>
          <div id="fluvio-chat-input-container">
            <textarea id="fluvio-chat-input" placeholder="Type your message..." rows="1"
                      aria-label="Type a message"></textarea>
            <button id="fluvio-chat-send" aria-label="Send message">${createIcon('Send')}</button>
          </div>
        </div>
      </div>
      <div id="fluvio-footer">
        <a href="https://fluvio.ai" target="_blank" rel="noopener noreferrer" id="fluvio-branding">Powered by FluvioAI</a>
      </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    // Initialize Lucide icons after DOM insertion
    setTimeout(() => {
      initializeLucideIcons();
    }, 100);

    // Add viewport positioning logic
    function adjustPanelPosition() {
      const fabRect = fab.getBoundingClientRect();
      const panelWidth = Math.min(380, window.innerWidth - 40);
      const panelMaxHeight = Math.min(500, window.innerHeight - 120); // Reduced from 600 to 500
      const margin = 20;
      
      // Calculate optimal position
      let left = fabRect.right - panelWidth;
      let right = 'auto';
      let bottom = window.innerHeight - fabRect.top + 20;
      let top = 'auto';
      
      // Ensure panel doesn't go off the left edge
      if (left < margin) {
        left = margin;
        right = 'auto';
      }
      
      // Ensure panel doesn't go off the right edge
      if (left + panelWidth > window.innerWidth - margin) {
        left = 'auto';
        right = margin;
      }
      
      // Ensure panel doesn't go off the top or bottom
      if (bottom + panelMaxHeight > window.innerHeight - margin) {
        bottom = 'auto';
        top = margin;
      }
      
      // Apply positioning
      panel.style.left = left === 'auto' ? 'auto' : left + 'px';
      panel.style.right = right === 'auto' ? 'auto' : right + 'px';
      panel.style.bottom = bottom === 'auto' ? 'auto' : bottom + 'px';
      panel.style.top = top === 'auto' ? 'auto' : top + 'px';
      panel.style.maxHeight = panelMaxHeight + 'px';
      panel.style.width = panelWidth + 'px';
      
      // Adjust chat messages height if needed
      const chatMessages = document.getElementById('fluvio-chat-messages');
      if (chatMessages) {
        const availableHeight = panelMaxHeight - 240; // Account for header, footer, input, padding, and branding
        chatMessages.style.maxHeight = Math.max(120, availableHeight) + 'px';
      }
    }

    // Store the positioning function for later use
    panel.adjustPosition = adjustPanelPosition;

    return {
      fab,
      panel,
      statusEl: document.getElementById('fluvio-status'),
      callButton: document.getElementById('fluvio-call-button'),
      callText: document.getElementById('fluvio-call-text'),
      callIcon: document.getElementById('fluvio-call-icon'),
      // Chat elements
      chatContainer: document.getElementById('fluvio-chat-container'),
      chatMessages: document.getElementById('fluvio-chat-messages'),
      chatInput: document.getElementById('fluvio-chat-input'),
      chatSend: document.getElementById('fluvio-chat-send'),
      typingIndicator: document.getElementById('fluvio-typing-indicator'),
      // Voice elements
      voiceContainer: document.getElementById('fluvio-voice-container'),
      // Mode selector
      modeSelector: document.getElementById('fluvio-mode-selector')
    };
  }
  // ── H1/H3: Load Retell SDK with timeout and pinned version ─────────────────
  // Dynamic import() fallbacks removed — they bypass CSP script-src directives.
  // Embedders must whitelist unpkg.com or jsdelivr.net in their CSP.
  function loadRetellSDK() {
    const loader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      // Pinned version — update intentionally, not silently via @latest
      script.src = 'https://unpkg.com/retell-client-js-sdk@3.0.14/dist/retell-client-js-sdk.min.js';

      script.onload = resolve;
      script.onerror = () => {
        const script2 = document.createElement('script');
        script2.src = 'https://cdn.jsdelivr.net/npm/retell-client-js-sdk@3.0.14/dist/retell-client-js-sdk.min.js';
        script2.onload = resolve;
        script2.onerror = () => reject(new Error('Retell SDK failed to load from all CDNs'));
        document.head.appendChild(script2);
      };

      document.head.appendChild(script);
    });

    return withTimeout(loader, 10000, Promise.reject(new Error('Retell SDK load timed out')));
  }

  // Initialize widget functionality
  function initializeWidget(elements) {
    let RetellWebClient;
    let client;
    let isCallActive = false;
    let demoMode = false;
    let currentMode = config.defaultMode;
    let currentChatId = null;
    let chatHistory = [];
    let hasShownChatGreeting = false;

    // Orb state: 'idle' | 'listening' | 'talking'
    const orbEl = document.getElementById('fluvio-orb-wrapper');
    const orbLabel = document.getElementById('fluvio-orb-label');

    function setOrbState(state) {
      if (!orbEl) return;
      orbEl.className = state;
      const labels = { idle: 'Ready', listening: 'Listening…', talking: 'Speaking…' };
      if (orbLabel) orbLabel.textContent = labels[state] || '';
    }

    function getAgentDisplayName() {
      const name = (config.agentName || '').trim();
      return name || 'AI';
    }

    function ensureChatGreeting() {
      if (hasShownChatGreeting) return;

      // Prefer dedicated chat greeting, fall back to legacy greeting, then default.
      const greeting = ((config.chatGreeting || config.greeting) || `Hello! How can I help you today?`).trim();

      // Only show greeting when entering chat the first time.
      addChatMessage(greeting, 'agent');
      hasShownChatGreeting = true;
    }

    // M3: Fetch with AbortController timeout
    function fetchWithTimeout(url, options, timeoutMs = 15000) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(id));
    }

    // Chat functionality
    async function startChatSession() {
      try {
        const response = await fetchWithTimeout(config.webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: config.projectId,
            mode: 'chat',
            action: 'create_session',
            dynamic_variables: {
              ...(config.companyName   && { company_name:    config.companyName }),
              ...(config.companyNumber && { company_number:  config.companyNumber }),
              ...(config.companyHours  && { company_hours:   config.companyHours }),
              ...(config.agentName     && { AI_agent:        config.agentName }),
              ...(config.agentTitle    && { AI_agent_title:  config.agentTitle }),
              ...(config.companyAddress&& { company_address: config.companyAddress }),
              ...(config.greeting      && { greeting:        config.greeting }),
            }
          })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        const data = await response.json();
        // M4: Validate expected shape
        if (!data || typeof data.chat_id !== 'string') throw new Error('No chat ID received from webhook');
        currentChatId = data.chat_id;
        return currentChatId;
      } catch (error) {
        console.error('Failed to start chat session:', error);
        throw error;
      }
    }

    async function sendChatMessage(message) {
      try {
        const response = await fetchWithTimeout(config.webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: config.projectId,
            mode: 'chat',
            action: 'send_message',
            chat_id: currentChatId,
            message: message
          })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        const data = await response.json();
        // M4: Validate messages array before iterating
        return Array.isArray(data.messages) ? data.messages : [];
      } catch (error) {
        console.error('Failed to send chat message:', error);
        throw error;
      }
    }

    // C1: Build message bubbles with DOM nodes — never innerHTML for dynamic content
    function addChatMessage(content, role = 'user') {
      if (!elements.chatMessages) return;

      const messageDiv = document.createElement('div');
      messageDiv.className = `fluvio-message ${role}`;

      const avatar = document.createElement('div');
      avatar.className = 'fluvio-message-avatar';
      avatar.innerHTML = role === 'agent' ? createIcon('Bot') : createIcon('User');

      const bubble = document.createElement('div');
      bubble.className = 'fluvio-message-content';
      if (role === 'agent') {
        bubble.style.background = 'white';
        bubble.style.color = '#1F2937';
      }
      bubble.textContent = content; // Safe — no HTML injection possible

      messageDiv.appendChild(avatar);
      messageDiv.appendChild(bubble);

      elements.chatMessages.appendChild(messageDiv);
      elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
      chatHistory.push({ role, content, timestamp: Date.now() });
    }

    function showTypingIndicator() {
      const labelEl = elements.typingIndicator?.querySelector('span');
      if (labelEl) {
        labelEl.textContent = `${getAgentDisplayName()} is typing...`;
      }
      elements.typingIndicator.classList.add('show');
      elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }

    function hideTypingIndicator() {
      elements.typingIndicator.classList.remove('show');
    }

    async function handleChatMessage() {
      const message = elements.chatInput.value.trim();
      if (!message) return;


      // Add user message to UI
      addChatMessage(message, 'user');
      elements.chatInput.value = '';
      elements.chatInput.style.height = 'auto';
      elements.chatSend.disabled = true;
      
      showTypingIndicator();

      try {
        // L3: Demo mode only via explicit data-demo="true" attribute
        if (config.demoMode || demoMode || !config.projectId) {
          setTimeout(() => {
            hideTypingIndicator();
            // C2: Static demo responses — do not echo user input into innerHTML
            const demoResponses = [
              'Thanks for your message! This is a demo response. In production I would connect to your AI agent.',
              'I received your message. This is demo mode — your real agent would respond here.',
              'Great question! In production mode your configured AI agent would provide a real answer.',
            ];
            addChatMessage(demoResponses[Math.floor(Math.random() * demoResponses.length)], 'agent');
            elements.chatSend.disabled = false;
          }, 1000 + Math.random() * 1500);
          return;
        }

        // Real chat implementation
        
        // Create chat session if we don't have one
        if (!currentChatId) {
          await startChatSession();
        }

        // Send message and get response
        const response = await sendChatMessage(message);
        
        hideTypingIndicator();
        
        // Process and display agent responses
        
        if (response && response.length > 0) {
          response.forEach((msg, index) => {
            if (msg.role === 'agent' && msg.content) {
              addChatMessage(msg.content, 'agent');
            } else {
            }
          });
        } else {
          addChatMessage('I received your message. Let me help you with that.', 'agent');
        }
        
        elements.chatSend.disabled = false;
        
      } catch (error) {
        console.error('Chat error:', error);
        hideTypingIndicator();
        
        // Show user-friendly error message
        let errorMessage = 'Sorry, I encountered an error. Please try again.';
        if (error.message.includes('500')) {
          errorMessage = 'The chat service is temporarily unavailable. Please try again in a moment.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Chat service not found. Please check your configuration.';
        } else if (error.message.includes('No chat ID')) {
          errorMessage = 'Failed to start chat session. Please refresh and try again.';
        }
        
        addChatMessage(errorMessage, 'agent');
        elements.chatSend.disabled = false;
      }
    }

    function switchMode(mode) {
      currentMode = mode;
      
      // Update mode selector buttons
      if (elements.modeSelector) {
        elements.modeSelector.querySelectorAll('.fluvio-mode-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.mode === mode);
        });
      }
      
      // Show/hide containers
      if (elements.voiceContainer) {
        if (mode === 'voice') {
          elements.voiceContainer.style.display = 'block';
          elements.voiceContainer.classList.add('active');
        } else {
          elements.voiceContainer.style.display = 'none';
          elements.voiceContainer.classList.remove('active');
        }
      }
      
      if (elements.chatContainer) {
        if (mode === 'chat') {
          elements.chatContainer.style.display = 'block';
          elements.chatContainer.classList.add('active');

          // Inject configurable greeting on first entry to chat.
          ensureChatGreeting();
        } else {
          elements.chatContainer.style.display = 'none';
          elements.chatContainer.classList.remove('active');
        }
      }
      
    }

    try {
      // Try to find RetellWebClient
      if (window.RetellSDK && window.RetellSDK.RetellWebClient) {
        RetellWebClient = window.RetellSDK.RetellWebClient;
      } else if (window.RetellWebClient) {
        RetellWebClient = window.RetellWebClient;
      } else if (window.Retell && window.Retell.RetellWebClient) {
        RetellWebClient = window.Retell.RetellWebClient;
      } else {
        demoMode = true;
      }

      if (!demoMode) {
        client = new RetellWebClient();
      }

      // Update status
      elements.statusEl.textContent = demoMode ? 'Demo Mode' : 'Offline';
      elements.statusEl.className = demoMode ? 'connecting' : 'offline';
      elements.callButton.disabled = false;


    } catch (error) {
      demoMode = true;
      elements.statusEl.textContent = 'Demo Mode';
      elements.statusEl.className = 'connecting';
      elements.callButton.disabled = false;
    }

    // H4: End active call and update UI when closing the panel
    function closePanel() {
      if (isCallActive) {
        if (client && client.stopCall) client.stopCall();
        isCallActive = false;
        elements.callButton.className = 'start';
        elements.callButton.disabled = false;
        elements.callText.textContent = 'Start Call';
        elements.callIcon.innerHTML = createIcon('Phone');
        setOrbState('idle');
        elements.statusEl.textContent = 'Offline';
        elements.statusEl.className = 'offline';
        setTimeout(() => { initializeLucideIcons(); }, 10);
      }
      elements.panel.style.display = 'none';
      elements.fab.setAttribute('aria-expanded', 'false');
      elements.fab.focus(); // M5: Return focus to trigger
    }

    function openPanel() {
      if (elements.panel.adjustPosition) elements.panel.adjustPosition();
      elements.panel.style.display = 'block';
      elements.fab.setAttribute('aria-expanded', 'true');
      // M5: Move focus to close button
      const closeBtn = document.getElementById('fluvio-close');
      if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
    }

    elements.fab.addEventListener('click', () => {
      elements.panel.style.display === 'block' ? closePanel() : openPanel();
    });

    elements.fab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elements.fab.click(); }
    });

    // M5: Escape key closes panel
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.panel.style.display === 'block') closePanel();
    });

    // H5: Throttled resize/scroll with RAF — scroll listener only attached while panel is open
    let rafPending = false;
    function throttledAdjust() {
      if (rafPending || elements.panel.style.display !== 'block') return;
      rafPending = true;
      requestAnimationFrame(() => {
        if (elements.panel.adjustPosition) elements.panel.adjustPosition();
        rafPending = false;
      });
    }
    window.addEventListener('resize', throttledAdjust, { passive: true });
    window.addEventListener('scroll', throttledAdjust, { passive: true });

    document.getElementById('fluvio-close').addEventListener('click', closePanel);

    // H4: Stop call on page navigation
    window.addEventListener('pagehide', () => {
      if (isCallActive && client && client.stopCall) client.stopCall();
    });

    // Mode selector event handlers
    if (elements.modeSelector) {
      elements.modeSelector.addEventListener('click', (e) => {
        if (e.target.classList.contains('fluvio-mode-btn')) {
          const mode = e.target.dataset.mode;
          switchMode(mode);
        }
      });
    }

    // Chat event handlers
    if (elements.chatSend) {
      elements.chatSend.addEventListener('click', handleChatMessage);
    }

    if (elements.chatInput) {
      elements.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleChatMessage();
        }
      });

      // Auto-resize textarea
      elements.chatInput.addEventListener('input', (e) => {
        e.target.style.height = 'auto';
        const maxHeight = window.innerWidth <= 768 ? 96 : 120;
        const newHeight = Math.min(e.target.scrollHeight, maxHeight);
        e.target.style.height = newHeight + 'px';
        e.target.style.overflowY = newHeight >= maxHeight ? 'auto' : 'hidden';
        
        // Reposition panel if it's visible and might overflow
        if (elements.panel.style.display === 'block' && elements.panel.adjustPosition) {
          setTimeout(() => {
            elements.panel.adjustPosition();
          }, 10);
        }
      });
    } else {
    }

    // Initialize chat greeting if chat is the default mode.
    if (currentMode === 'chat' || config.mode === 'chat') {
      setTimeout(() => {
        ensureChatGreeting();
      }, 500);
    }

    elements.callButton.addEventListener('click', async (e) => {
      
      if (elements.callButton.disabled) {
        return;
      }
      
      if (demoMode) {
        // Demo mode simulation
        if (!isCallActive) {
          elements.statusEl.textContent = 'Connecting...';
          elements.statusEl.className = 'connecting';
          setOrbState('idle');
          elements.callButton.disabled = true;

          setTimeout(() => {
            elements.statusEl.textContent = 'Connected (Demo)';
            elements.statusEl.className = 'online';
            isCallActive = true;
            elements.callButton.className = 'end';
            elements.callButton.disabled = false;
            elements.callText.textContent = 'End Call';
            elements.callIcon.innerHTML = createIcon('PhoneOff');
            setOrbState('listening');

            // Simulate agent talking after 1.5s
            setTimeout(() => { setOrbState('talking'); }, 1500);
            setTimeout(() => { setOrbState('listening'); }, 4000);

            setTimeout(() => { initializeLucideIcons(); }, 10);
          }, 1500);
        } else {
          elements.statusEl.textContent = 'Demo Mode';
          elements.statusEl.className = 'connecting';
          isCallActive = false;
          elements.callButton.className = 'start';
          elements.callButton.disabled = false;
          elements.callText.textContent = 'Start Call';
          elements.callIcon.innerHTML = createIcon('Phone');
          setOrbState('idle');

          setTimeout(() => { initializeLucideIcons(); }, 10);
        }
        return;
      }

      // Real Retell functionality
      if (!isCallActive) {
        try {
          elements.statusEl.textContent = 'Connecting...';
          elements.statusEl.className = 'connecting';
          elements.callButton.disabled = true;

          // Check if webhook URL is a placeholder
          if (config.webhook.includes('your-webhook') || config.webhook.includes('httpbin.org')) {
            // Simulate demo call for testing
            setTimeout(() => {
              elements.statusEl.textContent = 'Connected (Demo)';
              elements.statusEl.className = 'online';
              isCallActive = true;
              elements.callButton.className = 'end';
              elements.callButton.disabled = false;
              elements.callText.textContent = 'End Call';
              elements.callIcon.innerHTML = createIcon('PhoneOff');
              setOrbState('listening');

              setTimeout(() => { setOrbState('talking'); }, 1500);
              setTimeout(() => { setOrbState('listening'); }, 4000);

              setTimeout(() => { initializeLucideIcons(); }, 10);
            }, 1500);
            return;
          }

          const response = await fetchWithTimeout(config.webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: config.projectId,
              mode: 'voice',
              dynamic_variables: {
                ...(config.companyName   && { company_name:    config.companyName }),
                ...(config.companyNumber && { company_number:  config.companyNumber }),
                ...(config.companyHours  && { company_hours:   config.companyHours }),
                ...(config.agentName     && { AI_agent:        config.agentName }),
                ...(config.agentTitle    && { AI_agent_title:  config.agentTitle }),
                ...(config.companyAddress&& { company_address: config.companyAddress }),
                ...(config.greeting      && { greeting:        config.greeting }),
              }
            })
          }, 15000);

          if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

          const responseText = await response.text();
          let webhookData;
          try {
            webhookData = JSON.parse(responseText);
          } catch {
            webhookData = { access_token: responseText.trim() };
          }

          const accessToken = webhookData.access_token || responseText.trim();

          // M4: Sanity-check the token — reject HTML error pages or obviously invalid values
          if (!accessToken || accessToken.includes('<') || accessToken.length > 1000) {
            throw new Error('Invalid access token received from webhook');
          }

          const callOptions = {
            accessToken: accessToken,
            sampleRate: 24000,
            enableUpdate: true
          };

          if (webhookData.call_inbound && webhookData.call_inbound.dynamic_variables) {
            callOptions.retell_llm_dynamic_variables = webhookData.call_inbound.dynamic_variables;
          }

          await client.startCall(callOptions);

        } catch (error) {
          console.error('Call failed:', error);
          
          // Provide more specific error messages
          let errorMessage = 'Connection failed';
          if (error.message.includes('CORS')) {
            errorMessage = 'CORS error - check webhook';
          } else if (error.message.includes('404')) {
            errorMessage = 'Webhook not found';
          } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Network error';
          }
          
          elements.statusEl.textContent = errorMessage;
          elements.statusEl.className = 'offline';
          elements.callButton.disabled = false;
        }
      } else {
        if (client && client.stopCall) {
          client.stopCall();
        } else {
          // Manual cleanup for demo mode
          elements.statusEl.textContent = 'Offline';
          elements.statusEl.className = 'offline';
          isCallActive = false;
          elements.callButton.className = 'start';
          elements.callButton.disabled = false;
          elements.callText.textContent = 'Start Call';
          elements.callIcon.innerHTML = createIcon('Phone');
          
          // Initialize new icons
          setTimeout(() => {
            initializeLucideIcons();
          }, 10);
        }
      }
    });

    // Retell event listeners (only if not in demo mode)
    if (!demoMode && client) {
      client.on('call_started', () => {
        elements.statusEl.textContent = 'Connected';
        elements.statusEl.className = 'online';
        isCallActive = true;
        elements.callButton.className = 'end';
        elements.callButton.disabled = false;
        elements.callText.textContent = 'End Call';
        elements.callIcon.innerHTML = createIcon('PhoneOff');
        setOrbState('listening');
        setTimeout(() => { initializeLucideIcons(); }, 10);
      });

      client.on('call_ended', () => {
        elements.statusEl.textContent = 'Offline';
        elements.statusEl.className = 'offline';
        isCallActive = false;
        elements.callButton.className = 'start';
        elements.callButton.disabled = false;
        elements.callText.textContent = 'Start Call';
        elements.callIcon.innerHTML = createIcon('Phone');
        setOrbState('idle');
        setTimeout(() => { initializeLucideIcons(); }, 10);
      });

      client.on('agent_start_talking', () => {
        elements.statusEl.textContent = 'Agent speaking...';
        elements.statusEl.className = 'online';
        setOrbState('talking');
      });

      client.on('agent_stop_talking', () => {
        elements.statusEl.textContent = 'Listening...';
        elements.statusEl.className = 'online';
        setOrbState('listening');
      });

      client.on('error', (error) => {
        console.error('Retell error:', error);
        elements.statusEl.textContent = 'Error occurred';
        elements.statusEl.className = 'offline';
        isCallActive = false;
        elements.callButton.className = 'start';
        elements.callButton.disabled = false;
        elements.callText.textContent = 'Start Call';
        elements.callIcon.innerHTML = createIcon('Phone');
        setOrbState('idle');
        setTimeout(() => { initializeLucideIcons(); }, 10);
      });
    }
  }

  // Main initialization
  async function init() {
    // C3: Validate webhook URL before doing anything
    if (!config.webhook || !isValidWebhookUrl(config.webhook)) {
      console.error('Fluvio Widget: data-webhook must be a valid https:// URL');
      return;
    }

    if (!config.projectId) {
      console.error('Fluvio Widget: data-project-id is required');
      return;
    }

    try {
      injectStyles();
      const elements = createWidget();

      // H1: Retell SDK load is time-bounded — falls back to demo mode on failure
      if (config.mode === 'voice' || config.mode === 'dual') {
        try {
          await loadRetellSDK();
        } catch (error) {
          console.warn('Fluvio Widget: Voice SDK unavailable, running in demo mode.', error.message);
        }
      }

      initializeWidget(elements);

    } catch (error) {
      console.error('Fluvio Widget: initialization failed', error);
    }
  }

  // Start when DOM is ready
  function initWhenReady() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      // DOM is already ready, but let's wait a tick to ensure all scripts are loaded
      setTimeout(init, 0);
    }
  }

  // Call initialization
  initWhenReady();

})();