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

  // Configuration from script tag attributes
  const currentScript = document.currentScript || document.querySelector('script[src*="fluvio-universal-widget"]');
  const config = {
    webhook: currentScript?.getAttribute('data-webhook') || '',
    // Updated to use project_id instead of agent_id
    projectId: currentScript?.getAttribute('data-project-id') || '',
    // Legacy support for backward compatibility
    agentId: currentScript?.getAttribute('data-agent-id') || '', // Deprecated - use project-id
    voiceAgentId: currentScript?.getAttribute('data-voice-agent-id') || '', // Deprecated - use project-id
    chatAgentId: currentScript?.getAttribute('data-chat-agent-id') || '', // Deprecated - use project-id
    // UI Configuration
    color: currentScript?.getAttribute('data-color') || '#347D9B',
    position: currentScript?.getAttribute('data-position') || 'bottom-right',
    title: currentScript?.getAttribute('data-title') || 'AI Assistant',
    subtitle: currentScript?.getAttribute('data-subtitle') || 'Voice & Chat Support',
    showTranscript: currentScript?.getAttribute('data-show-transcript') === 'true',
    // Mode configuration
    mode: currentScript?.getAttribute('data-mode') || 'dual', // 'voice', 'chat', or 'dual'
    defaultMode: currentScript?.getAttribute('data-default-mode') || 'voice', // Default active mode
    // Dynamic variables support
    companyName: currentScript?.getAttribute('data-company-name') || '',
    companyNumber: currentScript?.getAttribute('data-company-number') || '',
    companyHours: currentScript?.getAttribute('data-company-hours') || '',
    agentName: currentScript?.getAttribute('data-agent-name') || '',
    agentTitle: currentScript?.getAttribute('data-agent-title') || '',
    companyAddress: currentScript?.getAttribute('data-company-address') || '',
    greeting: currentScript?.getAttribute('data-greeting') || '',
    // Chat UI configuration
    chatGreeting: currentScript?.getAttribute('data-chat-greeting') || ''
  };

  // Prevent multiple instances
  if (window.FluvioWidgetLoaded) {
    console.warn('Fluvio Widget already loaded');
    return;
  }
  window.FluvioWidgetLoaded = true;

  console.log('Fluvio Universal Widget Loading...');

  // Load Lucide Icons
  function loadLucideIcons() {
    return new Promise((resolve, reject) => {
      if (window.lucide) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/lucide@latest/dist/umd/lucide.js';
      
      script.onload = () => {
        console.log('Lucide icons loaded successfully');
        resolve();
      };
      
      script.onerror = () => {
        console.warn('Failed to load Lucide icons, using fallback');
        resolve(); // Continue without icons
      };
      
      document.head.appendChild(script);
    });
  }

  // Create Lucide icon element
  function createIcon(iconName, className = '') {
    if (window.lucide && window.lucide.createElement) {
      try {
        const iconElement = window.lucide.createElement(window.lucide[iconName] || window.lucide.MessageCircle);
        if (className) {
          iconElement.className = className;
        }
        return iconElement.outerHTML;
      } catch (e) {
        console.warn('Failed to create Lucide icon:', iconName);
      }
    }
    
    // Fallback to data attributes for Lucide
    return `<i data-lucide="${iconName}" class="${className}"></i>`;
  }

  // Initialize Lucide icons in DOM
  function initializeLucideIcons() {
    if (window.lucide && window.lucide.createIcons) {
      try {
        window.lucide.createIcons();
      } catch (e) {
        console.warn('Failed to initialize Lucide icons:', e);
      }
    }
  }

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
        padding: 20px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      #fluvio-header-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      #fluvio-header-icon {
        width: 32px;
        height: 32px;
        background: rgba(255,255,255,0.2);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      }

      #fluvio-header-icon svg {
        width: 16px;
        height: 16px;
      }

      #fluvio-header-text h4 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        line-height: 1.2;
      }

      #fluvio-header-text p {
        margin: 2px 0 0 0;
        font-size: 14px;
        opacity: 0.9;
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
        padding: 24px 20px 16px;
        text-align: center;
        max-height: calc(100vh - 180px);
        overflow-y: auto;
      }

      #fluvio-mode-selector {
        display: flex;
        background: #F3F4F6;
        border-radius: 8px;
        padding: 4px;
        margin-bottom: 24px;
        gap: 4px;
      }

      .fluvio-mode-btn {
        flex: 1;
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        background: transparent;
        color: #6B7280;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .fluvio-mode-btn svg {
        width: 16px;
        height: 16px;
      }

      .fluvio-mode-btn.active {
        background: ${config.color};
        color: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .fluvio-mode-btn:hover:not(.active) {
        background: #E5E7EB;
        color: #374151;
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
        min-height: 20px;
        max-height: 80px;
        font-family: inherit;
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
        padding: 12px 24px 16px;
        text-align: center;
        border-top: 1px solid #F3F4F6;
        background: #FAFAFA;
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
        margin-bottom: 24px;
        padding: 16px 20px;
        background: #F9FAFB;
        border-radius: 12px;
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

      #fluvio-transcript-container {
        margin-top: 24px;
        display: none;
      }

      #fluvio-transcript-container.show {
        display: block;
      }

      #fluvio-transcript-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      #fluvio-transcript-label {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
      }

      #fluvio-transcript-toggle {
        position: relative;
        width: 44px;
        height: 24px;
        background: #E5E7EB;
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.2s ease;
        border: none;
        outline: none;
      }

      #fluvio-transcript-toggle.active {
        background: ${config.color};
      }

      #fluvio-transcript-toggle::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        transition: transform 0.2s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      #fluvio-transcript-toggle.active::after {
        transform: translateX(20px);
      }

      #fluvio-transcript {
        background: #F9FAFB;
        border-radius: 12px;
        padding: 16px;
        max-height: 200px;
        overflow-y: auto;
        font-size: 14px;
        line-height: 1.6;
        color: #374151;
        white-space: pre-wrap;
        border: 1px solid #E5E7EB;
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
          max-height: 60px !important;
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
    fab.setAttribute('aria-label', 'Open voice assistant');
    fab.setAttribute('role', 'button');
    fab.setAttribute('tabindex', '0');

    // Create panel
    const panel = document.createElement('div');
    panel.id = 'fluvio-panel';
    
    // Determine which modes to show
    const showVoice = config.mode === 'voice' || config.mode === 'dual';
    const showChat = config.mode === 'chat' || config.mode === 'dual';
    const showModeSelector = config.mode === 'dual';
    
    panel.innerHTML = `
      <div id="fluvio-header">
        <div id="fluvio-header-content">
          <div id="fluvio-header-icon">${createIcon('Bot')}</div>
          <div id="fluvio-header-text">
            <h4>${config.title}</h4>
            <p>${config.subtitle}</p>
          </div>
        </div>
        <button id="fluvio-close" aria-label="Close">${createIcon('X')}</button>
      </div>
      <div id="fluvio-content">
        ${showModeSelector ? `
        <div id="fluvio-mode-selector">
          <button class="fluvio-mode-btn ${config.defaultMode === 'voice' ? 'active' : ''}" data-mode="voice">
            ${createIcon('Phone')} Voice Call
          </button>
          <button class="fluvio-mode-btn ${config.defaultMode === 'chat' ? 'active' : ''}" data-mode="chat">
            ${createIcon('MessageCircle')} Text Chat
          </button>
        </div>
        ` : ''}
        
        <div id="fluvio-voice-container" class="${!showModeSelector || config.defaultMode === 'voice' ? 'active' : ''}">
          <div id="fluvio-instruction">
            Tap the call button to start talking.
          </div>
          <div id="fluvio-status-section">
            <span id="fluvio-status-label">Status:</span>
            <span id="fluvio-status" class="offline">Loading...</span>
          </div>
          <button id="fluvio-call-button" class="start" disabled>
            <span id="fluvio-call-icon">${createIcon('Phone')}</span>
            <span id="fluvio-call-text">Call</span>
          </button>
          <div id="fluvio-transcript-container">
            <div id="fluvio-transcript-header">
              <span id="fluvio-transcript-label">Live Transcript</span>
              <button id="fluvio-transcript-toggle" class="${config.showTranscript ? 'active' : ''}" 
                      aria-label="Toggle transcript" title="Toggle live transcript"></button>
            </div>
            <div id="fluvio-transcript" style="display: ${config.showTranscript ? 'block' : 'none'}"></div>
          </div>
        </div>

        <div id="fluvio-chat-container" class="${!showModeSelector || config.defaultMode === 'chat' ? 'active' : ''}">
          <div id="fluvio-chat-messages"></div>
          <div class="fluvio-typing-indicator" id="fluvio-typing-indicator">
            <span>${(config.agentName || 'AI')} is typing...</span>
            <div class="fluvio-typing-dots">
              <div class="fluvio-typing-dot"></div>
              <div class="fluvio-typing-dot"></div>
              <div class="fluvio-typing-dot"></div>
            </div>
          </div>
          <div id="fluvio-chat-input-container">
            <textarea id="fluvio-chat-input" placeholder="Type your message..." rows="1"></textarea>
            <button id="fluvio-chat-send">${createIcon('Send')}</button>
          </div>
        </div>
      </div>
      <div id="fluvio-footer">
        <a href="https://fluvio.ai" target="_blank" id="fluvio-branding">Powered by FluvioAI</a>
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
      transcriptContainer: document.getElementById('fluvio-transcript-container'),
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
  // Load Retell SDK
  function loadRetellSDK() {
    return new Promise((resolve, reject) => {
      console.log('Attempting to load Retell SDK from unpkg...');
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/retell-client-js-sdk@latest/dist/retell-client-js-sdk.min.js';
      
      script.onload = () => {
        console.log('Retell SDK loaded from unpkg');
        resolve();
      };
      
      script.onerror = () => {
        console.log('unpkg failed, trying jsdelivr...');
        // Fallback to jsdelivr
        const script2 = document.createElement('script');
        script2.src = 'https://cdn.jsdelivr.net/npm/retell-client-js-sdk@latest/dist/retell-client-js-sdk.min.js';
        
        script2.onload = () => {
          console.log('Retell SDK loaded from jsdelivr');
          resolve();
        };
        
        script2.onerror = () => {
          console.log('jsdelivr failed, trying skypack...');
          // Fallback to skypack with dynamic import
          import('https://cdn.skypack.dev/retell-client-js-sdk')
            .then(({ RetellWebClient }) => {
              window.RetellWebClient = RetellWebClient;
              console.log('Retell SDK loaded from skypack');
              resolve();
            })
            .catch(err => {
              console.log('skypack failed, trying esm.sh...');
              // Final fallback to esm.sh
              import('https://esm.sh/retell-client-js-sdk')
                .then(({ RetellWebClient }) => {
                  window.RetellWebClient = RetellWebClient;
                  console.log('Retell SDK loaded from esm.sh');
                  resolve();
                })
                .catch(finalErr => {
                  console.error('All SDK loading methods failed');
                  console.error('unpkg error:', script.error);
                  console.error('jsdelivr error:', script2.error);
                  console.error('skypack error:', err);
                  console.error('esm.sh error:', finalErr);
                  reject(new Error('Failed to load Retell SDK from all sources'));
                });
            });
        };
        
        document.head.appendChild(script2);
      };
      
      document.head.appendChild(script);
    });
  }

  // Initialize widget functionality
  function initializeWidget(elements) {
    let RetellWebClient;
    let client;
    let isCallActive = false;
    let demoMode = false;
    let transcriptEnabled = config.showTranscript;
    let currentMode = config.defaultMode;
    let currentChatId = null;
    let chatHistory = [];
    let hasShownChatGreeting = false;

    function getAgentDisplayName() {
      const name = (config.agentName || '').trim();
      return name || 'AI';
    }

    function ensureChatGreeting() {
      if (hasShownChatGreeting) return;

      // Prefer dedicated chat greeting, fall back to legacy greeting.
      const greeting = ((config.chatGreeting || config.greeting) || '').trim();
      if (!greeting) return;

      // Only show greeting when entering chat the first time.
      addChatMessage(greeting, 'agent');
      hasShownChatGreeting = true;
    }

    // Chat functionality
    async function startChatSession() {
      try {
        console.log('Creating new chat session...');
        const response = await fetch(config.webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            project_id: config.projectId,
            mode: 'chat',
            action: 'create_session',
            dynamic_variables: {
              ...(config.companyName && { company_name: config.companyName }),
              ...(config.companyNumber && { company_number: config.companyNumber }),
              ...(config.companyHours && { company_hours: config.companyHours }),
              ...(config.agentName && { AI_agent: config.agentName }),
              ...(config.agentTitle && { AI_agent_title: config.agentTitle }),
              ...(config.companyAddress && { company_address: config.companyAddress }),
              ...(config.greeting && { greeting: config.greeting })
            }
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        currentChatId = data.chat_id;
        
        if (!currentChatId) {
          throw new Error('No chat ID received from webhook');
        }

        console.log('Chat session created:', currentChatId);
        return currentChatId;
      } catch (error) {
        console.error('Failed to start chat session:', error);
        throw error;
      }
    }

    async function sendChatMessage(message) {
      try {
        console.log('Sending chat message:', message, 'to chat_id:', currentChatId);
        
        const response = await fetch(config.webhook, {
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

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Chat response received:', data);
        
        // Return the messages array from the response
        return data.messages || [];
      } catch (error) {
        console.error('Failed to send chat message:', error);
        throw error;
      }
    }

    function addChatMessage(content, role = 'user') {
      console.log('Adding chat message:', { content, role, hasMessagesContainer: !!elements.chatMessages });
      
      if (!elements.chatMessages) {
        console.error('Chat messages container not found!');
        return;
      }

      // Check if chat container is visible
      const chatContainer = elements.chatContainer;
      const computedStyle = window.getComputedStyle(chatContainer);
      console.log('Chat container visibility check:', {
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        className: chatContainer.className
      });

      const messageDiv = document.createElement('div');
      messageDiv.className = `fluvio-message ${role}`;
      
      // Use Lucide icons for avatars
      const avatarIcon = role === 'agent' ? createIcon('Bot') : createIcon('User');
      const contentHtml = role === 'agent' 
        ? `<div class="fluvio-message-avatar">${avatarIcon}</div><div class="fluvio-message-content" style="background: white !important; color: #1F2937 !important;">${content}</div>`
        : `<div class="fluvio-message-avatar">${avatarIcon}</div><div class="fluvio-message-content">${content}</div>`;
      
      messageDiv.innerHTML = contentHtml;
      
      elements.chatMessages.appendChild(messageDiv);
      elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
      
      // Initialize icons in the new message
      setTimeout(() => {
        initializeLucideIcons();
      }, 10);
      
      chatHistory.push({ role, content, timestamp: Date.now() });
      console.log('Message added to chat. Total messages:', elements.chatMessages.children.length);
      console.log('Message element created:', messageDiv.outerHTML);
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

      console.log('Chat message being sent:', message);

      // Add user message to UI
      addChatMessage(message, 'user');
      elements.chatInput.value = '';
      elements.chatInput.style.height = 'auto';
      elements.chatSend.disabled = true;
      
      showTypingIndicator();

      try {
        // Check if we're in demo mode
        if (demoMode || !config.projectId || config.projectId.includes('demo') || config.webhook.includes('httpbin.org')) {
          console.log('Chat running in demo mode');
          setTimeout(() => {
            hideTypingIndicator();
            
            const demoResponses = [
              `Thank you for your message! I understand you said: "${message}". How can I help you further?`,
              `I received your message about "${message}". This is a demo response - in production, I would connect to your Retell chat agent.`,
              `Great question! Regarding "${message}" - I'm currently in demo mode. Your actual chat agent would provide real responses here.`,
              `I see you mentioned "${message}". In production mode, I would process this through your configured AI agent and provide personalized assistance.`
            ];
            
            const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
            addChatMessage(randomResponse, 'agent');
            elements.chatSend.disabled = false;
          }, 1000 + Math.random() * 2000);
          return;
        }

        // Real chat implementation
        console.log('Starting real chat session...');
        
        // Create chat session if we don't have one
        if (!currentChatId) {
          console.log('No existing chat session, creating new one...');
          await startChatSession();
        }

        // Send message and get response
        console.log('Sending message to chat session...');
        const response = await sendChatMessage(message);
        
        hideTypingIndicator();
        
        // Process and display agent responses
        console.log('Processing chat response:', response);
        
        if (response && response.length > 0) {
          console.log(`Processing ${response.length} messages`);
          response.forEach((msg, index) => {
            console.log(`Processing message ${index}:`, msg);
            if (msg.role === 'agent' && msg.content) {
              console.log('Adding agent message to chat:', msg.content);
              addChatMessage(msg.content, 'agent');
            } else {
              console.log('Skipping message - role:', msg.role, 'has content:', !!msg.content);
            }
          });
        } else {
          console.log('No messages in response, using fallback');
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
      console.log('Switching to mode:', mode);
      
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
        console.log('Voice container display:', elements.voiceContainer.style.display);
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
        console.log('Chat container display:', elements.chatContainer.style.display);
        console.log('Chat container classes:', elements.chatContainer.className);
      }
      
      console.log('Mode switched to:', mode);
    }

    try {
      // Try to find RetellWebClient
      if (window.RetellSDK && window.RetellSDK.RetellWebClient) {
        RetellWebClient = window.RetellSDK.RetellWebClient;
        console.log('Found RetellWebClient in window.RetellSDK');
      } else if (window.RetellWebClient) {
        RetellWebClient = window.RetellWebClient;
        console.log('Found RetellWebClient in window');
      } else if (window.Retell && window.Retell.RetellWebClient) {
        RetellWebClient = window.Retell.RetellWebClient;
        console.log('Found RetellWebClient in window.Retell');
      } else {
        console.warn('RetellWebClient not found - enabling demo mode');
        demoMode = true;
      }

      if (!demoMode) {
        client = new RetellWebClient();
      }

      // Update status
      elements.statusEl.textContent = demoMode ? 'Demo Mode' : 'Offline';
      elements.statusEl.className = demoMode ? 'connecting' : 'offline';
      elements.callButton.disabled = false;

      console.log('Widget initialized successfully' + (demoMode ? ' (Demo Mode)' : ''));

    } catch (error) {
      console.warn('SDK initialization failed, enabling demo mode:', error);
      demoMode = true;
      elements.statusEl.textContent = 'Demo Mode';
      elements.statusEl.className = 'connecting';
      elements.callButton.disabled = false;
    }

    // Event handlers
    elements.fab.addEventListener('click', (e) => {
      console.log('FAB clicked');
      
      const isVisible = elements.panel.style.display === 'block';
      if (isVisible) {
        elements.panel.style.display = 'none';
      } else {
        // Adjust position before showing
        if (elements.panel.adjustPosition) {
          elements.panel.adjustPosition();
        }
        elements.panel.style.display = 'block';
      }
    });

    // Keyboard support
    elements.fab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        console.log('FAB keyboard activated');
        elements.fab.click();
      }
    });

    // Add window resize listener to adjust panel position
    window.addEventListener('resize', () => {
      if (elements.panel.style.display === 'block' && elements.panel.adjustPosition) {
        elements.panel.adjustPosition();
      }
    });

    // Add scroll listener to adjust panel position
    window.addEventListener('scroll', () => {
      if (elements.panel.style.display === 'block' && elements.panel.adjustPosition) {
        elements.panel.adjustPosition();
      }
    });

    document.getElementById('fluvio-close').addEventListener('click', (e) => {
      console.log('Close button clicked');
      elements.panel.style.display = 'none';
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
      console.log('Attaching chat send button event handler');
      elements.chatSend.addEventListener('click', handleChatMessage);
    } else {
      console.warn('Chat send button not found');
    }

    if (elements.chatInput) {
      console.log('Attaching chat input event handlers');
      elements.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          console.log('Enter key pressed in chat input');
          handleChatMessage();
        }
      });

      // Auto-resize textarea
      elements.chatInput.addEventListener('input', (e) => {
        e.target.style.height = 'auto';
        const newHeight = Math.min(e.target.scrollHeight, 30); // Reduced from 100px to 80px
        e.target.style.height = newHeight + 'px';
        
        // Reposition panel if it's visible and might overflow
        if (elements.panel.style.display === 'block' && elements.panel.adjustPosition) {
          setTimeout(() => {
            elements.panel.adjustPosition();
          }, 10);
        }
      });
    } else {
      console.warn('Chat input not found');
    }

    // Initialize chat greeting if chat is the default mode.
    if (currentMode === 'chat' || config.mode === 'chat') {
      console.log('Initializing chat greeting');
      setTimeout(() => {
        ensureChatGreeting();
      }, 500);
    }

    console.log('Widget initialization complete', {
      currentMode,
      hasVoiceContainer: !!elements.voiceContainer,
      hasChatContainer: !!elements.chatContainer,
      hasChatSend: !!elements.chatSend,
      hasChatInput: !!elements.chatInput
    });

    // Transcript toggle functionality
    const transcriptToggle = document.getElementById('fluvio-transcript-toggle');
    const transcriptDiv = document.getElementById('fluvio-transcript');
    
    transcriptToggle.addEventListener('click', (e) => {
      e.preventDefault();
      transcriptEnabled = !transcriptEnabled;
      
      // Update toggle appearance
      transcriptToggle.classList.toggle('active', transcriptEnabled);
      
      // Show/hide transcript
      transcriptDiv.style.display = transcriptEnabled ? 'block' : 'none';
      
      console.log('Transcript toggled:', transcriptEnabled ? 'ON' : 'OFF');
    });

    elements.callButton.addEventListener('click', async (e) => {
      console.log('Call button clicked');
      
      if (elements.callButton.disabled) {
        console.log('Call button is disabled, ignoring click');
        return;
      }
      
      if (demoMode) {
        // Demo mode simulation
        if (!isCallActive) {
          console.log('Demo: Starting simulated call...');
          elements.statusEl.textContent = 'Connecting...';
          elements.statusEl.className = 'connecting';
          elements.callButton.disabled = true;

          setTimeout(() => {
            elements.statusEl.textContent = 'Connected (Demo)';
            elements.statusEl.className = 'online';
            isCallActive = true;
            elements.callButton.className = 'end';
            elements.callButton.disabled = false;
            elements.callText.textContent = 'End Call';
            elements.callIcon.innerHTML = createIcon('PhoneOff');
            elements.transcriptContainer.classList.add('show');
            
            // Initialize new icons
            setTimeout(() => {
              initializeLucideIcons();
            }, 10);
            
            if (transcriptEnabled) {
              const transcriptDiv = document.getElementById('fluvio-transcript');
              transcriptDiv.textContent = 'Demo Mode: This is a simulation.\n\nIn production, this would show real-time conversation transcripts between you and the AI agent.\n\nThe actual voice calls work with your Retell AI agent when the SDK loads properly.';
            }
            
            console.log('Demo: Call connected');
          }, 1500);
        } else {
          console.log('Demo: Ending simulated call...');
          elements.statusEl.textContent = 'Demo Mode';
          elements.statusEl.className = 'connecting';
          isCallActive = false;
          elements.callButton.className = 'start';
          elements.callButton.disabled = false;
          elements.callText.textContent = 'Call';
          elements.callIcon.innerHTML = createIcon('Phone');
          
          // Initialize new icons
          setTimeout(() => {
            initializeLucideIcons();
          }, 10);
        }
        return;
      }

      // Real Retell functionality
      if (!isCallActive) {
        try {
          console.log('Starting real call...');
          elements.statusEl.textContent = 'Connecting...';
          elements.statusEl.className = 'connecting';
          elements.callButton.disabled = true;

          // Check if webhook URL is a placeholder
          if (config.webhook.includes('your-webhook') || config.webhook.includes('httpbin.org')) {
            console.log('Demo webhook detected, simulating call...');
            // Simulate demo call for testing
            setTimeout(() => {
              elements.statusEl.textContent = 'Connected (Demo)';
              elements.statusEl.className = 'online';
              isCallActive = true;
              elements.callButton.className = 'end';
              elements.callButton.disabled = false;
              elements.callText.textContent = 'End Call';
              elements.callIcon.innerHTML = createIcon('PhoneOff');
              elements.transcriptContainer.classList.add('show');
              
              // Initialize new icons
              setTimeout(() => {
                initializeLucideIcons();
              }, 10);
              
              if (transcriptEnabled) {
                const transcriptDiv = document.getElementById('fluvio-transcript');
                transcriptDiv.textContent = 'Demo Mode: Voice call simulation.\n\nTo use real voice calls:\n1. Replace webhook URL with your actual Make.com webhook\n2. Configure your voice agent ID\n3. Ensure Retell SDK loads properly\n\nThis demo shows the UI and flow without making real API calls.';
              }
            }, 1500);
            return;
          }

          const response = await fetch(config.webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              project_id: config.projectId,
              mode: 'voice',
              dynamic_variables: {
                ...(config.companyName && { company_name: config.companyName }),
                ...(config.companyNumber && { company_number: config.companyNumber }),
                ...(config.companyHours && { company_hours: config.companyHours }),
                ...(config.agentName && { AI_agent: config.agentName }),
                ...(config.agentTitle && { AI_agent_title: config.agentTitle }),
                ...(config.companyAddress && { company_address: config.companyAddress }),
                ...(config.greeting && { greeting: config.greeting })
              }
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const responseText = await response.text();
          let webhookData;
          
          try {
            webhookData = JSON.parse(responseText);
          } catch (e) {
            webhookData = { access_token: responseText.trim() };
          }

          const accessToken = webhookData.access_token || responseText.trim();
          
          if (!accessToken) {
            throw new Error('No access token received from webhook');
          }

          const callOptions = {
            accessToken: accessToken,
            sampleRate: 24000,
            enableUpdate: true
          };

          if (webhookData.call_inbound && webhookData.call_inbound.dynamic_variables) {
            callOptions.retell_llm_dynamic_variables = webhookData.call_inbound.dynamic_variables;
            console.log('Dynamic variables included:', webhookData.call_inbound.dynamic_variables);
          }

          console.log('Starting call with options:', callOptions);
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
        console.log('Ending real call...');
        if (client && client.stopCall) {
          client.stopCall();
        } else {
          // Manual cleanup for demo mode
          elements.statusEl.textContent = 'Offline';
          elements.statusEl.className = 'offline';
          isCallActive = false;
          elements.callButton.className = 'start';
          elements.callButton.disabled = false;
          elements.callText.textContent = 'Call';
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
        console.log('Call started');
        elements.statusEl.textContent = 'Connected';
        elements.statusEl.className = 'online';
        isCallActive = true;
        elements.callButton.className = 'end';
        elements.callButton.disabled = false;
        elements.callText.textContent = 'End Call';
        elements.callIcon.innerHTML = createIcon('PhoneOff');
        elements.transcriptContainer.classList.add('show');
        
        // Initialize new icons
        setTimeout(() => {
          initializeLucideIcons();
        }, 10);
      });

      client.on('call_ended', () => {
        console.log('Call ended');
        elements.statusEl.textContent = 'Offline';
        elements.statusEl.className = 'offline';
        isCallActive = false;
        elements.callButton.className = 'start';
        elements.callButton.disabled = false;
        elements.callText.textContent = 'Call';
        elements.callIcon.innerHTML = createIcon('Phone');
        
        // Initialize new icons
        setTimeout(() => {
          initializeLucideIcons();
        }, 10);
      });

      client.on('agent_start_talking', () => {
        elements.statusEl.textContent = 'Agent speaking...';
        elements.statusEl.className = 'online';
      });

      client.on('agent_stop_talking', () => {
        elements.statusEl.textContent = 'Listening...';
        elements.statusEl.className = 'online';
      });

      client.on('update', (update) => {
        if (transcriptEnabled && update.transcript && update.transcript.length > 0) {
          const transcriptDiv = document.getElementById('fluvio-transcript');
          const transcriptText = update.transcript
            .map(t => `${t.role === 'agent' ? 'Agent' : 'You'}: ${t.content}`)
            .join('\n\n');
          transcriptDiv.textContent = transcriptText;
          transcriptDiv.scrollTop = transcriptDiv.scrollHeight;
        }
      });

      client.on('error', (error) => {
        console.error('Retell error:', error);
        elements.statusEl.textContent = 'Error occurred';
        elements.statusEl.className = 'offline';
        isCallActive = false;
        elements.callButton.className = 'start';
        elements.callButton.disabled = false;
        elements.callText.textContent = 'Call';
        elements.callIcon.innerHTML = createIcon('Phone');
        
        // Initialize new icons
        setTimeout(() => {
          initializeLucideIcons();
        }, 10);
      });
    }
  }

  // Main initialization
  async function init() {
    if (!config.webhook) {
      console.error('Missing data-webhook attribute');
      return;
    }

    // Validate agent configuration
    if (config.mode === 'voice' || config.mode === 'dual' || config.mode === 'chat') {
      if (!config.projectId) {
        console.error('Missing project ID (data-project-id)');
        return;
      }
    }

    try {
      // Load Lucide icons first
      await loadLucideIcons();
      
      // Inject styles
      injectStyles();

      // Create UI
      const elements = createWidget();

      // Try to load SDK for voice functionality
      if (config.mode === 'voice' || config.mode === 'dual') {
        try {
          await loadRetellSDK();
          console.log('SDK loaded successfully, voice functionality enabled');
        } catch (error) {
          console.warn('SDK loading failed, voice will run in demo mode:', error.message);
        }
      }

      // Initialize widget
      initializeWidget(elements);

      console.log('Fluvio Universal Widget ready!', {
        mode: config.mode,
        projectId: config.projectId,
        defaultMode: config.defaultMode
      });
    } catch (error) {
      console.error('Widget initialization failed:', error);
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