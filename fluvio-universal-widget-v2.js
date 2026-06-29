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
    fabText:      currentScript?.getAttribute('data-fab-text') || 'Chat or Talk to...',
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
    Menu: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
  };

  function createIcon(name) {
    return ICONS[name] || ICONS.MessageCircle;
  }

  // No-op retained so any remaining call sites don't throw
  function initializeLucideIcons() {}

  // Inject CSS styles
  function injectStyles() {
    const css = `
      /* ── FAB: pill shape ── */
      #fluvio-fab {
        position: fixed;
        bottom: 20px;
        right: 20px;
        height: 52px;
        padding: 8px 18px 8px 8px;
        border-radius: 999px;
        background: ${config.color};
        color: #fff;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        z-index: 999999;
        box-shadow: 0 8px 32px rgba(52,125,155,0.35);
        transition: transform 0.25s ease, box-shadow 0.25s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border: none;
        white-space: nowrap;
      }
      #fluvio-fab:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(52,125,155,0.45);
      }
      .fluvio-fab-orb {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        flex-shrink: 0;
        background:
          radial-gradient(circle at 30% 30%, rgba(255,255,255,0.42) 0%, transparent 50%),
          conic-gradient(from 200deg at 50% 50%, #c084fc, #f97316, #38bdf8, #a78bfa, #c084fc);
      }
      .fluvio-fab-text {
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* ── Panel ── */
      #fluvio-panel {
        position: fixed;
        bottom: 84px;
        right: 20px;
        width: 380px;
        max-width: calc(100vw - 40px);
        max-height: calc(100vh - 130px);
        background: #fff;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        z-index: 999999;
        display: none;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
        animation: fluvio-slideUp 0.3s ease-out;
      }
      @keyframes fluvio-slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* ── Header: white ── */
      #fluvio-header {
        background: #fff;
        padding: 14px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #E5E7EB;
        flex-shrink: 0;
        min-height: 52px;
      }
      #fluvio-header-brand {
        font-size: 14px;
        font-weight: 700;
        color: #1F2937;
        letter-spacing: -0.01em;
      }
      #fluvio-back {
        background: none;
        border: none;
        color: #6B7280;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        display: none;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        transition: background 0.2s;
        flex-shrink: 0;
      }
      #fluvio-back:hover { background: #F3F4F6; }
      #fluvio-back svg { width: 18px; height: 18px; }
      #fluvio-close {
        background: none;
        border: none;
        color: #6B7280;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        transition: background 0.2s ease;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      #fluvio-close svg { width: 18px; height: 18px; }
      #fluvio-close:hover { background: #F3F4F6; }

      /* ── Content area (flex column, fills space between header and tabs/footer) ── */
      #fluvio-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 0;
      }

      /* ── Mode landing screen ── */
      #fluvio-mode-landing,
      #fluvio-voice-container,
      #fluvio-chat-container {
        display: none;
        flex: 1;
        min-height: 0;
      }
      #fluvio-mode-landing.active {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        padding: 20px 16px 16px;
        gap: 10px;
      }
      #fluvio-mode-landing h3 {
        margin: 0 0 2px;
        font-size: 17px;
        font-weight: 700;
        color: #111827;
        line-height: 1.3;
      }
      #fluvio-mode-landing > p {
        margin: 0 0 6px;
        font-size: 13px;
        color: #6B7280;
        line-height: 1.4;
      }
      .fluvio-mode-card {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 15px;
        border: 1.5px solid #E5E7EB;
        border-radius: 12px;
        background: #fff;
        cursor: pointer;
        text-align: left;
        width: 100%;
        transition: all 0.2s ease;
        font-family: inherit;
      }
      .fluvio-mode-card:hover {
        border-color: ${config.color};
        background: ${config.color}08;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      }
      .fluvio-mode-card-icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: ${config.color};
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: #fff;
      }
      .fluvio-mode-card-icon svg { width: 20px; height: 20px; }
      .fluvio-mode-card-body {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .fluvio-mode-card-body strong {
        font-size: 14px;
        font-weight: 600;
        color: #1F2937;
        line-height: 1.2;
      }
      .fluvio-mode-card-body span {
        font-size: 12px;
        color: #6B7280;
        line-height: 1.4;
      }

      /* ── Voice container ── */
      #fluvio-voice-container.active {
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow-y: auto;
        padding: 14px 20px 16px;
      }
      #fluvio-timer {
        font-size: 13px;
        color: #9CA3AF;
        text-align: center;
        margin-bottom: 6px;
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.06em;
        font-weight: 500;
      }
      #fluvio-voice-title {
        font-size: 17px;
        font-weight: 700;
        color: #111827;
        text-align: center;
        margin-bottom: 4px;
        line-height: 1.3;
      }
      #fluvio-voice-subtitle {
        font-size: 12px;
        color: #6B7280;
        text-align: center;
        margin-bottom: 14px;
        line-height: 1.4;
      }
      #fluvio-status-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 8px 14px;
        background: #F9FAFB;
        border-radius: 10px;
        width: 100%;
      }
      #fluvio-status-label {
        font-size: 13px;
        color: #6B7280;
        font-weight: 500;
      }
      #fluvio-status {
        font-size: 13px;
        font-weight: 600;
        color: #374151;
      }
      #fluvio-status.offline   { color: #6B7280; }
      #fluvio-status.connecting { color: #F59E0B; }
      #fluvio-status.online    { color: #10B981; }

      #fluvio-call-button {
        width: 100%;
        padding: 14px 24px;
        border: none;
        border-radius: 999px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-family: inherit;
      }
      #fluvio-call-button svg { width: 18px; height: 18px; }
      #fluvio-call-button.start {
        background: ${config.color};
        color: #fff;
      }
      #fluvio-call-button.start:hover:not(:disabled) {
        background: ${config.color}dd;
        transform: translateY(-1px);
      }
      #fluvio-call-button.end {
        background: #EF4444;
        color: #fff;
      }
      #fluvio-call-button.end:hover:not(:disabled) {
        background: #DC2626;
        transform: translateY(-1px);
      }
      #fluvio-call-button:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none !important;
      }

      /* ── Iridescent orb ── */
      #fluvio-orb-wrapper {
        position: relative;
        width: 130px;
        height: 130px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 4px auto 10px;
        flex-shrink: 0;
      }
      #fluvio-orb-glow {
        position: absolute;
        inset: -22px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(192,132,252,0.22) 0%, transparent 70%);
        opacity: 0.8;
        animation: fluvio-orb-breathe 4s ease-in-out infinite;
      }
      #fluvio-orb-ripple, #fluvio-orb-ripple2 {
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        border: 2px solid rgba(168,139,250,0.3);
        opacity: 0;
      }
      #fluvio-orb-core {
        position: relative;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background:
          radial-gradient(circle at 30% 28%, rgba(255,255,255,0.5) 0%, transparent 45%),
          conic-gradient(from 220deg at 50% 50%,
            #c084fc 0%, #f97316 20%, #38bdf8 45%, #a78bfa 70%, #f0abfc 90%, #c084fc 100%);
        box-shadow:
          0 0 40px 10px rgba(192,132,252,0.28),
          inset 0 -6px 18px rgba(0,0,0,0.12),
          inset 0 3px 12px rgba(255,255,255,0.3);
        animation: fluvio-orb-breathe-core 4s ease-in-out infinite;
      }
      #fluvio-orb-core::before {
        content: '';
        position: absolute;
        top: 14px; left: 20px;
        width: 28px; height: 16px;
        border-radius: 50%;
        background: rgba(255,255,255,0.28);
        filter: blur(5px);
        transform: rotate(-30deg);
      }
      #fluvio-orb-core::after {
        content: '';
        position: absolute;
        top: 20px; left: 28px;
        width: 12px; height: 7px;
        border-radius: 50%;
        background: rgba(255,255,255,0.5);
        filter: blur(2px);
        transform: rotate(-20deg);
      }
      @keyframes fluvio-orb-breathe {
        0%, 100% { opacity: 0.7; transform: scale(1); }
        50%       { opacity: 1;   transform: scale(1.08); }
      }
      @keyframes fluvio-orb-breathe-core {
        0%, 100% { transform: scale(1); }
        50%       { transform: scale(1.04); }
      }

      /* listening */
      #fluvio-orb-wrapper.listening #fluvio-orb-core {
        animation: fluvio-orb-listen-core 1.6s ease-in-out infinite;
        background:
          radial-gradient(circle at 30% 28%, rgba(255,255,255,0.5) 0%, transparent 45%),
          conic-gradient(from 220deg at 50% 50%,
            #a78bfa 0%, #38bdf8 30%, #c084fc 60%, #f0abfc 85%, #a78bfa 100%);
        box-shadow:
          0 0 52px 14px rgba(56,189,248,0.38),
          inset 0 -6px 18px rgba(0,0,0,0.1),
          inset 0 3px 12px rgba(255,255,255,0.35);
      }
      #fluvio-orb-wrapper.listening #fluvio-orb-glow {
        animation: fluvio-orb-listen-glow 1.6s ease-in-out infinite;
        background: radial-gradient(circle, rgba(56,189,248,0.3) 0%, transparent 70%);
      }
      #fluvio-orb-wrapper.listening #fluvio-orb-ripple {
        animation: fluvio-orb-ripple-out 1.8s ease-out infinite;
        border-color: rgba(56,189,248,0.4);
      }
      @keyframes fluvio-orb-listen-core {
        0%, 100% { transform: scale(1); }
        50%       { transform: scale(1.08); }
      }
      @keyframes fluvio-orb-listen-glow {
        0%, 100% { opacity: 0.7; }
        50%       { opacity: 1; }
      }

      /* talking */
      #fluvio-orb-wrapper.talking #fluvio-orb-core {
        animation: fluvio-orb-talk-core 0.85s ease-in-out infinite alternate;
        background:
          radial-gradient(circle at 30% 28%, rgba(255,255,255,0.5) 0%, transparent 45%),
          conic-gradient(from 220deg at 50% 50%,
            #f97316 0%, #f0abfc 25%, #c084fc 50%, #38bdf8 75%, #f97316 100%);
        box-shadow:
          0 0 64px 20px rgba(249,115,22,0.38),
          inset 0 -6px 18px rgba(0,0,0,0.1),
          inset 0 3px 12px rgba(255,255,255,0.38);
      }
      #fluvio-orb-wrapper.talking #fluvio-orb-glow {
        animation: fluvio-orb-talk-glow 0.85s ease-in-out infinite alternate;
        background: radial-gradient(circle, rgba(249,115,22,0.32) 0%, transparent 65%);
      }
      #fluvio-orb-wrapper.talking #fluvio-orb-ripple {
        animation: fluvio-orb-ripple-out 1.1s ease-out infinite;
        border-color: rgba(192,132,252,0.45);
      }
      #fluvio-orb-wrapper.talking #fluvio-orb-ripple2 {
        animation: fluvio-orb-ripple-out 1.1s ease-out infinite 0.55s;
        border-color: rgba(192,132,252,0.22);
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
        100% { transform: scale(1.6);  opacity: 0; }
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

      /* ── Chat container ── */
      #fluvio-chat-container.active {
        display: flex !important;
        flex-direction: column;
        overflow: hidden;
      }
      #fluvio-chat-messages {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 16px;
        background: #FAFAFA;
        color: #374151;
        border-bottom: 1px solid #E5E7EB;
      }
      .fluvio-message {
        margin-bottom: 14px;
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      .fluvio-message.user { flex-direction: row-reverse; }
      .fluvio-message-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .fluvio-message-avatar svg { width: 15px; height: 15px; }
      .fluvio-message.agent .fluvio-message-avatar { background: ${config.color}; color: #fff; }
      .fluvio-message.user  .fluvio-message-avatar { background: #6B7280; color: #fff; }
      .fluvio-message-content {
        background: #fff;
        padding: 10px 14px;
        border-radius: 12px;
        max-width: 72%;
        font-size: 14px;
        line-height: 1.45;
        border: 1px solid #E5E7EB;
        color: #374151;
        word-break: break-word;
        overflow-wrap: break-word;
        min-width: 0;
      }
      .fluvio-message.user .fluvio-message-content {
        background: ${config.color};
        color: #fff;
        border-color: ${config.color};
      }
      .fluvio-message.agent .fluvio-message-content {
        background: #fff;
        color: #1F2937 !important;
        border-color: #E5E7EB;
      }
      .fluvio-typing-indicator {
        display: none;
        align-items: center;
        gap: 8px;
        color: #6B7280;
        font-size: 13px;
        font-style: italic;
        padding: 8px 16px;
        flex-shrink: 0;
      }
      .fluvio-typing-indicator.show { display: flex; }
      .fluvio-typing-dots { display: flex; gap: 4px; }
      .fluvio-typing-dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: #9CA3AF;
        animation: fluvio-typing 1.4s infinite ease-in-out;
      }
      .fluvio-typing-dot:nth-child(1) { animation-delay: -0.32s; }
      .fluvio-typing-dot:nth-child(2) { animation-delay: -0.16s; }
      @keyframes fluvio-typing {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40%            { transform: scale(1);   opacity: 1; }
      }
      #fluvio-chat-input-container {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        flex-shrink: 0;
        background: #fff;
      }
      #fluvio-chat-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #D1D5DB;
        border-radius: 8px;
        font-size: 14px;
        resize: none;
        min-height: 42px;
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
        padding: 10px 14px;
        background: ${config.color};
        color: #fff;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: background 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      #fluvio-chat-send svg { width: 16px; height: 16px; }
      #fluvio-chat-send:hover:not(:disabled) { background: ${config.color}dd; }
      #fluvio-chat-send:disabled { background: #9CA3AF; cursor: not-allowed; }

      /* ── Bottom pill tabs (outside #fluvio-content) ── */
      #fluvio-mode-selector {
        display: none;
        background: #fff;
        border-top: 1px solid #E5E7EB;
        padding: 10px 12px;
        gap: 8px;
        flex-shrink: 0;
      }
      .fluvio-mode-btn {
        flex: 1;
        padding: 8px 16px;
        border: 1.5px solid #E5E7EB;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        background: #fff;
        color: #6B7280;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-family: inherit;
      }
      .fluvio-mode-btn svg { width: 14px; height: 14px; }
      .fluvio-mode-btn.active {
        background: ${config.color};
        color: #fff;
        border-color: ${config.color};
      }
      .fluvio-mode-btn:hover:not(.active) {
        border-color: ${config.color};
        color: ${config.color};
      }

      /* ── Footer ── */
      #fluvio-footer {
        padding: 9px 24px 12px;
        text-align: center;
        border-top: 1px solid #F3F4F6;
        background: #FAFAFA;
        flex-shrink: 0;
      }
      #fluvio-branding {
        font-size: 12px;
        color: #9CA3AF;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;
      }
      #fluvio-branding:hover { color: ${config.color}; }

      /* ── Mobile ── */
      @media (max-width: 768px) {
        #fluvio-fab {
          bottom: 16px;
          right: 16px;
          height: 46px;
          padding: 6px 14px 6px 6px;
        }
        .fluvio-fab-orb { width: 32px; height: 32px; }
        .fluvio-fab-text { font-size: 13px; max-width: 110px; }
        #fluvio-panel {
          width: calc(100vw - 32px) !important;
          max-width: calc(100vw - 32px) !important;
          right: 16px !important;
          left: 16px !important;
          bottom: 74px !important;
          top: auto !important;
          max-height: calc(100vh - 110px) !important;
        }
        #fluvio-chat-input { font-size: 16px; }
        #fluvio-footer { padding: 7px 16px 10px !important; }
      }
      @media (max-width: 360px) {
        #fluvio-fab { bottom: 12px; right: 12px; }
        #fluvio-panel {
          width: calc(100vw - 24px) !important;
          max-width: calc(100vw - 24px) !important;
          right: 12px !important;
          left: 12px !important;
          bottom: 68px !important;
          border-radius: 16px;
          max-height: calc(100vh - 96px) !important;
        }
      }

      /* ── Position variants ── */
      .fluvio-position-bottom-left #fluvio-fab   { left: 20px; right: auto; }
      .fluvio-position-bottom-left #fluvio-panel { left: 20px; right: auto; }
      .fluvio-position-top-right #fluvio-fab     { top: 20px; bottom: auto; }
      .fluvio-position-top-right #fluvio-panel   { top: 84px; bottom: auto; }
      .fluvio-position-top-left  #fluvio-fab     { top: 20px; left: 20px; bottom: auto; right: auto; }
      .fluvio-position-top-left  #fluvio-panel   { top: 84px; left: 20px; bottom: auto; right: auto; }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Create widget UI
  function createWidget() {
    document.body.classList.add(`fluvio-position-${config.position}`);

    // FAB: pill shape with mini iridescent orb + text
    const fab = document.createElement('div');
    fab.id = 'fluvio-fab';
    fab.innerHTML = `<div class="fluvio-fab-orb"></div><span class="fluvio-fab-text">${esc(config.fabText)}</span>`;
    fab.setAttribute('aria-label', 'Open AI assistant');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('role', 'button');
    fab.setAttribute('tabindex', '0');

    const panel = document.createElement('div');
    panel.id = 'fluvio-panel';

    const showModeSelector = config.mode === 'dual';
    // In dual mode the landing screen is shown first; individual containers start inactive
    const voiceInitActive = config.mode === 'voice';
    const chatInitActive  = config.mode === 'chat';

    panel.innerHTML = `
      <div id="fluvio-header">
        <button id="fluvio-back" aria-label="Back to menu">${createIcon('Menu')}</button>
        <div id="fluvio-header-brand">${esc(config.title)}</div>
        <button id="fluvio-close" aria-label="Close">${createIcon('X')}</button>
      </div>

      <div id="fluvio-content">
        ${showModeSelector ? `
        <div id="fluvio-mode-landing" class="active">
          <h3>How can we help you today?</h3>
          <p>Choose how you'd like to interact with our assistant.</p>
          <button class="fluvio-mode-card" data-mode="voice">
            <div class="fluvio-mode-card-icon">${createIcon('Phone')}</div>
            <div class="fluvio-mode-card-body">
              <strong>Voice Assistant</strong>
              <span>Have a quick conversation and get help instantly.</span>
            </div>
          </button>
          <button class="fluvio-mode-card" data-mode="chat">
            <div class="fluvio-mode-card-icon">${createIcon('MessageCircle')}</div>
            <div class="fluvio-mode-card-body">
              <strong>Chat Assistant</strong>
              <span>Type your question and we'll guide you through.</span>
            </div>
          </button>
        </div>
        ` : ''}

        <div id="fluvio-voice-container" class="${voiceInitActive ? 'active' : ''}">
          <div id="fluvio-timer" aria-live="off">00:00</div>
          <div id="fluvio-orb-wrapper" aria-hidden="true">
            <div id="fluvio-orb-glow"></div>
            <div id="fluvio-orb-ripple"></div>
            <div id="fluvio-orb-ripple2"></div>
            <div id="fluvio-orb-core"></div>
          </div>
          <div id="fluvio-orb-label">Ready</div>
          <div id="fluvio-voice-title">${esc(config.title)}</div>
          <div id="fluvio-voice-subtitle">${esc(config.subtitle)}</div>
          <div id="fluvio-status-section">
            <span id="fluvio-status-label">Status:</span>
            <span id="fluvio-status" class="offline" aria-live="polite">Loading...</span>
          </div>
          <button id="fluvio-call-button" class="start" disabled>
            <span id="fluvio-call-icon">${createIcon('Phone')}</span>
            <span id="fluvio-call-text">Start to call</span>
          </button>
        </div>

        <div id="fluvio-chat-container" class="${chatInitActive ? 'active' : ''}">
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

      ${showModeSelector ? `
      <div id="fluvio-mode-selector" role="tablist">
        <button class="fluvio-mode-btn" data-mode="voice" role="tab" aria-selected="false">
          ${createIcon('Phone')} Voice
        </button>
        <button class="fluvio-mode-btn" data-mode="chat" role="tab" aria-selected="false">
          ${createIcon('MessageCircle')} Chat
        </button>
      </div>
      ` : ''}

      <div id="fluvio-footer">
        <a href="https://fluvio.ai" target="_blank" rel="noopener noreferrer" id="fluvio-branding">Powered by FluvioAI</a>
      </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    function adjustPanelPosition() {
      const fabRect = fab.getBoundingClientRect();
      const panelWidth = Math.min(380, window.innerWidth - 40);
      const panelMaxHeight = Math.min(540, window.innerHeight - 120);
      const margin = 20;

      let left = fabRect.right - panelWidth;
      let right = 'auto';
      let bottom = window.innerHeight - fabRect.top + 12;
      let top = 'auto';

      if (left < margin) { left = margin; right = 'auto'; }
      if (left + panelWidth > window.innerWidth - margin) { left = 'auto'; right = margin; }
      if (bottom + panelMaxHeight > window.innerHeight - margin) { bottom = 'auto'; top = margin; }

      panel.style.left      = left   === 'auto' ? 'auto' : left + 'px';
      panel.style.right     = right  === 'auto' ? 'auto' : right + 'px';
      panel.style.bottom    = bottom === 'auto' ? 'auto' : bottom + 'px';
      panel.style.top       = top    === 'auto' ? 'auto' : top + 'px';
      panel.style.maxHeight = panelMaxHeight + 'px';
      panel.style.width     = panelWidth + 'px';
    }

    panel.adjustPosition = adjustPanelPosition;

    return {
      fab,
      panel,
      statusEl:       document.getElementById('fluvio-status'),
      callButton:     document.getElementById('fluvio-call-button'),
      callText:       document.getElementById('fluvio-call-text'),
      callIcon:       document.getElementById('fluvio-call-icon'),
      chatContainer:  document.getElementById('fluvio-chat-container'),
      chatMessages:   document.getElementById('fluvio-chat-messages'),
      chatInput:      document.getElementById('fluvio-chat-input'),
      chatSend:       document.getElementById('fluvio-chat-send'),
      typingIndicator:document.getElementById('fluvio-typing-indicator'),
      voiceContainer: document.getElementById('fluvio-voice-container'),
      modeSelector:   document.getElementById('fluvio-mode-selector'),
      modeLanding:    document.getElementById('fluvio-mode-landing'),
      backBtn:        document.getElementById('fluvio-back'),
      timerEl:        document.getElementById('fluvio-timer'),
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

    const orbEl    = document.getElementById('fluvio-orb-wrapper');
    const orbLabel = document.getElementById('fluvio-orb-label');

    // ── Timer ──────────────────────────────────────────────────────────────────
    let timerInterval = null;
    let elapsedSeconds = 0;

    function formatTime(s) {
      return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    }
    function startTimer() {
      elapsedSeconds = 0;
      if (elements.timerEl) elements.timerEl.textContent = '00:00';
      timerInterval = setInterval(() => {
        elapsedSeconds++;
        if (elements.timerEl) elements.timerEl.textContent = formatTime(elapsedSeconds);
      }, 1000);
    }
    function stopTimer() {
      clearInterval(timerInterval);
      timerInterval = null;
      elapsedSeconds = 0;
      if (elements.timerEl) elements.timerEl.textContent = '00:00';
    }

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
      if (elements.modeSelector) {
        elements.modeSelector.querySelectorAll('.fluvio-mode-btn').forEach(btn => {
          const active = btn.dataset.mode === mode;
          btn.classList.toggle('active', active);
          btn.setAttribute('aria-selected', active);
        });
      }
      if (elements.voiceContainer) {
        elements.voiceContainer.classList.toggle('active', mode === 'voice');
      }
      if (elements.chatContainer) {
        elements.chatContainer.classList.toggle('active', mode === 'chat');
        if (mode === 'chat') ensureChatGreeting();
      }
    }

    function switchView(view) {
      const landing = elements.modeLanding;
      const back    = elements.backBtn;
      if (landing) landing.classList.toggle('active', view === 'landing');
      if (elements.modeSelector) elements.modeSelector.style.display = view !== 'landing' ? 'flex' : 'none';
      if (back) back.style.display = (view === 'chat' && config.mode === 'dual') ? 'flex' : 'none';
      if (view === 'landing') {
        if (elements.voiceContainer) elements.voiceContainer.classList.remove('active');
        if (elements.chatContainer)  elements.chatContainer.classList.remove('active');
      } else {
        switchMode(view);
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

    function closePanel() {
      if (isCallActive) {
        if (client && client.stopCall) client.stopCall();
        isCallActive = false;
        elements.callButton.className = 'start';
        elements.callButton.disabled = false;
        elements.callText.textContent = 'Start to call';
        elements.callIcon.innerHTML = createIcon('Phone');
        setOrbState('idle');
        elements.statusEl.textContent = 'Offline';
        elements.statusEl.className = 'offline';
        stopTimer();
      }
      elements.panel.style.display = 'none';
      elements.fab.setAttribute('aria-expanded', 'false');
      elements.fab.focus();
    }

    function openPanel() {
      if (elements.panel.adjustPosition) elements.panel.adjustPosition();
      elements.panel.style.display = 'flex';
      elements.fab.setAttribute('aria-expanded', 'true');
      if (config.mode === 'dual') {
        switchView('landing');
      } else {
        switchMode(config.mode);
      }
      const closeBtn = document.getElementById('fluvio-close');
      if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
    }

    elements.fab.addEventListener('click', () => {
      elements.panel.style.display === 'flex' ? closePanel() : openPanel();
    });

    elements.fab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elements.fab.click(); }
    });

    // M5: Escape key closes panel
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.panel.style.display === 'flex') closePanel();
    });

    // Landing card clicks
    if (elements.modeLanding) {
      elements.modeLanding.addEventListener('click', (e) => {
        const card = e.target.closest('.fluvio-mode-card');
        if (card) switchView(card.dataset.mode);
      });
    }

    // Back button → return to landing
    if (elements.backBtn) {
      elements.backBtn.addEventListener('click', () => switchView('landing'));
    }

    // H5: Throttled resize/scroll with RAF
    let rafPending = false;
    function throttledAdjust() {
      if (rafPending || elements.panel.style.display !== 'flex') return;
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
        
        if (elements.panel.style.display === 'flex' && elements.panel.adjustPosition) {
          setTimeout(() => {
            elements.panel.adjustPosition();
          }, 10);
        }
      });
    } else {
    }

    // In single chat mode show greeting shortly after init
    if (config.mode === 'chat') {
      setTimeout(() => ensureChatGreeting(), 500);
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
            elements.callText.textContent = 'End call';
            elements.callIcon.innerHTML = createIcon('PhoneOff');
            setOrbState('listening');
            startTimer();
            setTimeout(() => { setOrbState('talking'); }, 1500);
            setTimeout(() => { setOrbState('listening'); }, 4000);
          }, 1500);
        } else {
          elements.statusEl.textContent = 'Offline';
          elements.statusEl.className = 'offline';
          isCallActive = false;
          elements.callButton.className = 'start';
          elements.callButton.disabled = false;
          elements.callText.textContent = 'Start to call';
          elements.callIcon.innerHTML = createIcon('Phone');
          setOrbState('idle');
          stopTimer();
        }
        return;
      }

      // Real Retell functionality
      if (!isCallActive) {
        try {
          elements.statusEl.textContent = 'Connecting...';
          elements.statusEl.className = 'connecting';
          elements.callButton.disabled = true;

          if (config.webhook.includes('your-webhook') || config.webhook.includes('httpbin.org')) {
            setTimeout(() => {
              elements.statusEl.textContent = 'Connected (Demo)';
              elements.statusEl.className = 'online';
              isCallActive = true;
              elements.callButton.className = 'end';
              elements.callButton.disabled = false;
              elements.callText.textContent = 'End call';
              elements.callIcon.innerHTML = createIcon('PhoneOff');
              setOrbState('listening');
              startTimer();
              setTimeout(() => { setOrbState('talking'); }, 1500);
              setTimeout(() => { setOrbState('listening'); }, 4000);
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
          elements.statusEl.textContent = 'Offline';
          elements.statusEl.className = 'offline';
          isCallActive = false;
          elements.callButton.className = 'start';
          elements.callButton.disabled = false;
          elements.callText.textContent = 'Start to call';
          elements.callIcon.innerHTML = createIcon('Phone');
          stopTimer();
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
        elements.callText.textContent = 'End call';
        elements.callIcon.innerHTML = createIcon('PhoneOff');
        setOrbState('listening');
        startTimer();
      });

      client.on('call_ended', () => {
        elements.statusEl.textContent = 'Offline';
        elements.statusEl.className = 'offline';
        isCallActive = false;
        elements.callButton.className = 'start';
        elements.callButton.disabled = false;
        elements.callText.textContent = 'Start to call';
        elements.callIcon.innerHTML = createIcon('Phone');
        setOrbState('idle');
        stopTimer();
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
        elements.callText.textContent = 'Start to call';
        elements.callIcon.innerHTML = createIcon('Phone');
        setOrbState('idle');
        stopTimer();
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