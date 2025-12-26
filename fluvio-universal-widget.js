/**
 * Fluvio Universal Voice Widget
 * Deploy to any website with a single script tag
 * 
 * Usage:
 * <script src="https://your-domain.com/fluvio-universal-widget.js" 
 *         data-webhook="https://hook.us2.make.com/your-webhook"
 *         data-agent-id="agent_your_agent_id"></script>
 */

(function() {
  'use strict';

  // Configuration from script tag attributes
  const currentScript = document.currentScript || document.querySelector('script[src*="fluvio-universal-widget"]');
  const config = {
    webhook: currentScript?.getAttribute('data-webhook') || '',
    agentId: currentScript?.getAttribute('data-agent-id') || '',
    color: currentScript?.getAttribute('data-color') || '#347D9B',
    position: currentScript?.getAttribute('data-position') || 'bottom-right',
    title: currentScript?.getAttribute('data-title') || 'Voice Assistant',
    subtitle: currentScript?.getAttribute('data-subtitle') || 'Live Voice Agent',
    showTranscript: currentScript?.getAttribute('data-show-transcript') === 'true', // Default false
    // Dynamic variables support
    companyName: currentScript?.getAttribute('data-company-name') || '',
    companyNumber: currentScript?.getAttribute('data-company-number') || '',
    companyHours: currentScript?.getAttribute('data-company-hours') || '',
    agentName: currentScript?.getAttribute('data-agent-name') || '',
    agentTitle: currentScript?.getAttribute('data-agent-title') || '',
    companyAddress: currentScript?.getAttribute('data-company-address') || '',
    greeting: currentScript?.getAttribute('data-greeting') || ''
  };

  // Prevent multiple instances
  if (window.FluvioWidgetLoaded) {
    console.warn('Fluvio Widget already loaded');
    return;
  }
  window.FluvioWidgetLoaded = true;

  console.log('🎧 Fluvio Universal Widget Loading...');

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

      #fluvio-close:hover {
        background: rgba(255,255,255,0.1);
      }

      #fluvio-content {
        padding: 32px 24px 24px;
        text-align: center;
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

      #fluvio-call-icon {
        font-size: 18px;
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
          width: calc(100vw - 32px);
          right: 16px;
          left: 16px;
          bottom: 80px;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
        }

        #fluvio-header {
          padding: 16px 20px;
        }

        #fluvio-content {
          padding: 24px 20px 20px;
        }

        #fluvio-instruction {
          font-size: 15px;
          margin-bottom: 24px;
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
          width: calc(100vw - 24px);
          right: 12px;
          left: 12px;
          bottom: 72px;
          border-radius: 16px;
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
    fab.innerHTML = '💬';
    fab.setAttribute('aria-label', 'Open voice assistant');
    fab.setAttribute('role', 'button');
    fab.setAttribute('tabindex', '0');

    // Create panel
    const panel = document.createElement('div');
    panel.id = 'fluvio-panel';
    panel.innerHTML = `
      <div id="fluvio-header">
        <div id="fluvio-header-content">
          <div id="fluvio-header-icon">🎧</div>
          <div id="fluvio-header-text">
            <h4>${config.title}</h4>
            <p>${config.subtitle}</p>
          </div>
        </div>
        <button id="fluvio-close" aria-label="Close">×</button>
      </div>
      <div id="fluvio-content">
        <div id="fluvio-instruction">
          Tap the call button to start talking.
        </div>
        <div id="fluvio-status-section">
          <span id="fluvio-status-label">Status:</span>
          <span id="fluvio-status" class="offline">Loading...</span>
        </div>
        <button id="fluvio-call-button" class="start" disabled>
          <span id="fluvio-call-icon">📞</span>
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
    `;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    return {
      fab,
      panel,
      statusEl: document.getElementById('fluvio-status'),
      callButton: document.getElementById('fluvio-call-button'),
      callText: document.getElementById('fluvio-call-text'),
      callIcon: document.getElementById('fluvio-call-icon'),
      transcriptContainer: document.getElementById('fluvio-transcript-container')
    };
  }

  // Load Retell SDK
  function loadRetellSDK() {
    return new Promise((resolve, reject) => {
      console.log('🎧 Attempting to load Retell SDK from unpkg...');
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/retell-client-js-sdk@latest/dist/retell-client-js-sdk.min.js';
      
      script.onload = () => {
        console.log('🎧 Retell SDK loaded from unpkg');
        resolve();
      };
      
      script.onerror = () => {
        console.log('🎧 unpkg failed, trying jsdelivr...');
        // Fallback to jsdelivr
        const script2 = document.createElement('script');
        script2.src = 'https://cdn.jsdelivr.net/npm/retell-client-js-sdk@latest/dist/retell-client-js-sdk.min.js';
        
        script2.onload = () => {
          console.log('🎧 Retell SDK loaded from jsdelivr');
          resolve();
        };
        
        script2.onerror = () => {
          console.log('🎧 jsdelivr failed, trying skypack...');
          // Fallback to skypack with dynamic import
          import('https://cdn.skypack.dev/retell-client-js-sdk')
            .then(({ RetellWebClient }) => {
              window.RetellWebClient = RetellWebClient;
              console.log('🎧 Retell SDK loaded from skypack');
              resolve();
            })
            .catch(err => {
              console.log('🎧 skypack failed, trying esm.sh...');
              // Final fallback to esm.sh
              import('https://esm.sh/retell-client-js-sdk')
                .then(({ RetellWebClient }) => {
                  window.RetellWebClient = RetellWebClient;
                  console.log('🎧 Retell SDK loaded from esm.sh');
                  resolve();
                })
                .catch(finalErr => {
                  console.error('🎧 All SDK loading methods failed');
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
    let transcriptEnabled = config.showTranscript; // Track transcript state

    try {
      // Try to find RetellWebClient
      if (window.RetellSDK && window.RetellSDK.RetellWebClient) {
        RetellWebClient = window.RetellSDK.RetellWebClient;
        console.log('🎧 Found RetellWebClient in window.RetellSDK');
      } else if (window.RetellWebClient) {
        RetellWebClient = window.RetellWebClient;
        console.log('🎧 Found RetellWebClient in window');
      } else if (window.Retell && window.Retell.RetellWebClient) {
        RetellWebClient = window.Retell.RetellWebClient;
        console.log('🎧 Found RetellWebClient in window.Retell');
      } else {
        console.warn('🎧 RetellWebClient not found - enabling demo mode');
        demoMode = true;
      }

      if (!demoMode) {
        client = new RetellWebClient();
      }

      // Update status
      elements.statusEl.textContent = demoMode ? 'Demo Mode' : 'Offline';
      elements.statusEl.className = demoMode ? 'connecting' : 'offline';
      elements.callButton.disabled = false;

      console.log('🎧 Widget initialized successfully' + (demoMode ? ' (Demo Mode)' : ''));

    } catch (error) {
      console.warn('🎧 SDK initialization failed, enabling demo mode:', error);
      demoMode = true;
      elements.statusEl.textContent = 'Demo Mode';
      elements.statusEl.className = 'connecting';
      elements.callButton.disabled = false;
    }

    // Event handlers
elements.fab.addEventListener('click', (e) => {
  console.log('🎧 FAB clicked');
  
  // FIX: Check if the style IS 'block'. 
  // If it is empty string (initial load) or 'none', this returns false.
  const isVisible = elements.panel.style.display === 'block';
  
  elements.panel.style.display = isVisible ? 'none' : 'block';
});

    // Keyboard support
    elements.fab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        console.log('🎧 FAB keyboard activated');
        elements.fab.click();
      }
    });

    document.getElementById('fluvio-close').addEventListener('click', (e) => {
      console.log('🎧 Close button clicked');
      elements.panel.style.display = 'none';
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
      
      console.log('🎧 Transcript toggled:', transcriptEnabled ? 'ON' : 'OFF');
    });

    elements.callButton.addEventListener('click', async (e) => {
      console.log('🎧 Call button clicked');
      
      // Ensure button is not disabled
      if (elements.callButton.disabled) {
        console.log('🎧 Call button is disabled, ignoring click');
        return;
      }
      
      if (demoMode) {
        // Demo mode simulation
        if (!isCallActive) {
          console.log('🎧 Demo: Starting simulated call...');
          elements.statusEl.textContent = 'Connecting...';
          elements.statusEl.className = 'connecting';
          elements.callButton.disabled = true;

          // Simulate connection delay
          setTimeout(() => {
            elements.statusEl.textContent = 'Connected (Demo)';
            elements.statusEl.className = 'online';
            isCallActive = true;
            elements.callButton.className = 'end';
            elements.callButton.disabled = false;
            elements.callText.textContent = 'End Call';
            elements.transcriptContainer.classList.add('show');
            
            // Add demo transcript only if enabled
            if (transcriptEnabled) {
              const transcriptDiv = document.getElementById('fluvio-transcript');
              transcriptDiv.textContent = 'Demo Mode: This is a simulation.\n\nIn production, this would show real-time conversation transcripts between you and the AI agent.\n\nThe actual voice calls work with your Retell AI agent when the SDK loads properly.';
            }
            
            console.log('🎧 Demo: Call connected');
          }, 1500);
        } else {
          console.log('🎧 Demo: Ending simulated call...');
          elements.statusEl.textContent = 'Demo Mode';
          elements.statusEl.className = 'connecting';
          isCallActive = false;
          elements.callButton.className = 'start';
          elements.callButton.disabled = false;
          elements.callText.textContent = 'Call';
        }
        return;
      }

      // Real Retell functionality
      if (!isCallActive) {
        try {
          console.log('🎧 Starting real call...');
          elements.statusEl.textContent = 'Connecting...';
          elements.statusEl.className = 'connecting';
          elements.callButton.disabled = true;

          const response = await fetch(config.webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              agent_id: config.agentId,
              // Include dynamic variables from script tag if provided
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
            throw new Error(`HTTP ${response.status}`);
          }

          const responseText = await response.text();
          let webhookData;
          
          // Try to parse as JSON first (for dynamic variables)
          try {
            webhookData = JSON.parse(responseText);
          } catch (e) {
            // If not JSON, treat as raw token string (backward compatibility)
            webhookData = { access_token: responseText.trim() };
          }

          const accessToken = webhookData.access_token || responseText.trim();
          
          if (!accessToken) {
            throw new Error('No access token received');
          }

          // Prepare call options
          const callOptions = {
            accessToken: accessToken,
            sampleRate: 24000,
            enableUpdate: true
          };

          // Add dynamic variables if they exist in the webhook response
          if (webhookData.call_inbound && webhookData.call_inbound.dynamic_variables) {
            callOptions.retell_llm_dynamic_variables = webhookData.call_inbound.dynamic_variables;
            console.log('🎧 Dynamic variables included:', webhookData.call_inbound.dynamic_variables);
          }

          console.log('🎧 Starting call with options:', callOptions);
          await client.startCall(callOptions);

        } catch (error) {
          console.error('🎧 Call failed:', error);
          elements.statusEl.textContent = 'Connection failed';
          elements.statusEl.className = 'offline';
          elements.callButton.disabled = false;
        }
      } else {
        console.log('🎧 Ending real call...');
        client.stopCall();
      }
    });

    // Retell event listeners (only if not in demo mode)
    if (!demoMode && client) {
      client.on('call_started', () => {
        console.log('🎧 Call started');
        elements.statusEl.textContent = 'Connected';
        elements.statusEl.className = 'online';
        isCallActive = true;
        elements.callButton.className = 'end';
        elements.callButton.disabled = false;
        elements.callText.textContent = 'End Call';
        elements.transcriptContainer.classList.add('show');
      });

      client.on('call_ended', () => {
        console.log('🎧 Call ended');
        elements.statusEl.textContent = 'Offline';
        elements.statusEl.className = 'offline';
        isCallActive = false;
        elements.callButton.className = 'start';
        elements.callButton.disabled = false;
        elements.callText.textContent = 'Call';
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
        console.error('🎧 Retell error:', error);
        elements.statusEl.textContent = 'Error occurred';
        elements.statusEl.className = 'offline';
        isCallActive = false;
        elements.callButton.className = 'start';
        elements.callButton.disabled = false;
        elements.callText.textContent = 'Call';
      });
    }
  }

  // Main initialization
  async function init() {
    if (!config.webhook) {
      console.error('🎧 Missing data-webhook attribute');
      return;
    }

    try {
      // Inject styles
      injectStyles();

      // Create UI
      const elements = createWidget();

      // Try to load SDK, but continue even if it fails
      try {
        await loadRetellSDK();
        console.log('🎧 SDK loaded successfully, initializing with full functionality');
      } catch (error) {
        console.warn('🎧 SDK loading failed, initializing in demo mode:', error.message);
      }

      // Initialize widget (will auto-detect if SDK is available)
      initializeWidget(elements);

      console.log('🎧 Retell Universal Widget ready!');
    } catch (error) {
      console.error('🎧 Widget initialization failed:', error);
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