/**
 * Fluvio Button Widget - Simple Call Button
 * Place anywhere on your website - just initiates voice calls
 * 
 * Usage:
 * <button class="fluvio-call-btn" 
 *         data-webhook="https://hook.us2.make.com/your-webhook"
 *         data-project-id="your-project-id">Call Now</button>
 * <script src="https://your-domain.com/fluvio-button-widget.js"></script>
 */

(function() {
  'use strict';

  // Prevent multiple instances
  if (window.FluvioButtonLoaded) {
    console.warn('Fluvio Button Widget already loaded');
    return;
  }
  window.FluvioButtonLoaded = true;


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
        resolve();
      };
      
      script.onerror = () => {
        resolve(); // Continue without icons
      };
      
      document.head.appendChild(script);
    });
  }

  let retellClient = null;
  let isCallActive = false;
  let currentButton = null;

  // Load Retell SDK via esm.sh, pinned (same URL as fluvio-universal-widget-v2.js).
  // The old unpkg/jsdelivr "@latest/dist/retell-client-js-sdk.min.js" URL 404s since SDK 3.x
  // dropped that file. Pinning livekit-client stops esm.sh floating the caret range.
  // CSP requirement: script-src https://esm.sh
  const RETELL_SDK_URL = 'https://esm.sh/retell-client-js-sdk@3.0.2?deps=livekit-client@2.5.1';

  async function loadRetellSDK() {
    if (window.RetellWebClient) return;
    const mod = await Promise.race([
      import(RETELL_SDK_URL),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Retell SDK load timed out')), 15000)),
    ]);
    if (!mod || !mod.RetellWebClient) throw new Error('RetellWebClient not found in SDK module');
    window.RetellWebClient = mod.RetellWebClient;
    console.info('[Fluvio Button] Retell SDK loaded:', RETELL_SDK_URL);
  }

  // Get access token from webhook
  async function getAccessToken(webhook, projectId, dynamicVariables = {}) {
    try {
      const payload = { 
        project_id: projectId,
        mode: 'voice'
      };
      
      // Add dynamic variables if provided
      if (Object.keys(dynamicVariables).length > 0) {
        payload.dynamic_variables = dynamicVariables;
      }

      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }

      const responseText = await response.text();

      try {
        const data = JSON.parse(responseText);
        
        // Handle different response formats
        if (data.access_token) {
          return {
            accessToken: data.access_token,
            transport: data.transport,
            callId: data.call_id,
            iceServers: data.ice_servers,
            dynamicVariables: data.call_inbound?.dynamic_variables || {}
          };
        } else {
          // Raw token response
          return {
            accessToken: responseText.replace(/"/g, ''),
            dynamicVariables: {}
          };
        }
      } catch (e) {
        // Raw token response
        return {
          accessToken: responseText.replace(/"/g, ''),
          dynamicVariables: {}
        };
      }
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }

  // Extract dynamic variables from button attributes
  function getDynamicVariables(button) {
    const variables = {};
    
    const companyName = button.getAttribute('data-company-name');
    const agentName = button.getAttribute('data-agent-name');
    const agentTitle = button.getAttribute('data-agent-title');
    const companyNumber = button.getAttribute('data-company-number');
    const companyHours = button.getAttribute('data-company-hours');
    const companyAddress = button.getAttribute('data-company-address');
    const greeting = button.getAttribute('data-greeting');
    
    if (companyName) variables.company_name = companyName;
    if (agentName) variables.AI_agent = agentName;
    if (agentTitle) variables.AI_agent_title = agentTitle;
    if (companyNumber) variables.company_number = companyNumber;
    if (companyHours) variables.company_hours = companyHours;
    if (companyAddress) variables.company_address = companyAddress;
    if (greeting) variables.greeting = greeting;
    
    return variables;
  }

  // Start call
  async function startCall(button) {
    if (isCallActive) {
      return;
    }

    const webhook = button.getAttribute('data-webhook');
    const projectId = button.getAttribute('data-project-id');

    if (!webhook || !projectId) {
      console.error('Missing webhook or project-id attributes');
      alert('Button configuration error: Missing webhook or project-id');
      return;
    }

    const originalText = button.textContent;
    try {
      currentButton = button;
      
      // Update button state
      button.textContent = 'Connecting...';
      button.disabled = true;

      // Get dynamic variables from button attributes
      const dynamicVariables = getDynamicVariables(button);

      // Get access token
      const { accessToken, transport, callId, iceServers, dynamicVariables: webhookVariables } = await getAccessToken(webhook, projectId, dynamicVariables);

      // Merge dynamic variables (webhook takes priority)
      const finalVariables = { ...dynamicVariables, ...webhookVariables };

      // Initialize Retell client if needed
      if (!retellClient) {
        retellClient = new window.RetellWebClient();
        
        retellClient.on('call_started', () => {
          isCallActive = true;
          button.textContent = 'End Call';
          button.disabled = false;
        });

        retellClient.on('call_ended', () => {
          isCallActive = false;
          button.textContent = originalText;
          button.disabled = false;
          currentButton = null;
        });

        retellClient.on('error', (error) => {
          console.error('Call error:', error);
          isCallActive = false;
          button.textContent = originalText;
          button.disabled = false;
          currentButton = null;
          alert('Call failed: ' + ((error && error.message) || error));
        });
      }

      // Start the call
      const callOptions = { accessToken };

      // Retell v3 issues a WHIP "gateway" token; the SDK can't tell it from a LiveKit one,
      // so the webhook must pass through transport + call_id (+ ice_servers).
      if (transport === 'gateway' || transport === 'livekit') callOptions.transport = transport;
      if (callId) callOptions.callId = callId;
      if (transport === 'gateway') {
        if (!callId) throw new Error('Webhook returned transport "gateway" without call_id');
        if (Array.isArray(iceServers) && iceServers.every(function (s) { return s && s.urls; })) {
          callOptions.iceServers = iceServers;
        }
      }
      
      // Add dynamic variables if available
      if (Object.keys(finalVariables).length > 0) {
        callOptions.retell_llm_dynamic_variables = finalVariables;
      }

      await retellClient.startCall(callOptions);

    } catch (error) {
      console.error('Failed to start call:', error);
      button.textContent = originalText;
      button.disabled = false;
      currentButton = null;
      alert('Failed to start call: ' + error.message);
    }
  }

  // End call
  async function endCall(button) {
    if (!isCallActive || !retellClient) {
      return;
    }

    try {
      await retellClient.stopCall();
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  }

  // Handle button clicks
  function handleButtonClick(event) {
    const button = event.currentTarget; // Use currentTarget instead of target
    
    
    // Ensure button is not disabled
    if (button.disabled) {
      return;
    }
    
    if (isCallActive && button === currentButton) {
      endCall(button);
    } else if (!isCallActive) {
      startCall(button);
    }
  }

  // Initialize widget
  async function init() {
    try {
      // Load Lucide icons first
      await loadLucideIcons();
      
      // Load Retell SDK
      await loadRetellSDK();
      
      if (!window.RetellWebClient) {
        // Enable demo mode instead of failing
        enableDemoMode();
        return;
      }


      // Initialize buttons with retry mechanism
      initializeButtons();

    } catch (error) {
      enableDemoMode();
    }
  }

  // Initialize buttons with retry mechanism
  function initializeButtons() {
    const maxRetries = 5;
    let retryCount = 0;

    function tryInitialize() {
      // Find all Fluvio call buttons and attach event listeners
      const buttons = document.querySelectorAll('.fluvio-call-btn');
      
      if (buttons.length === 0 && retryCount < maxRetries) {
        retryCount++;
        setTimeout(tryInitialize, 100);
        return;
      }

      if (buttons.length === 0) {
        return;
      }

      buttons.forEach(button => {
        // Skip if already initialized
        if (button.hasAttribute('data-fluvio-initialized')) {
          return;
        }
        
        // Add click handler - use simple approach
        button.addEventListener('click', handleButtonClick);
        
        // Mark as initialized to prevent duplicate initialization
        button.setAttribute('data-fluvio-initialized', 'true');
        
        // Add basic styling if not already styled
        if (!button.style.cursor) {
          button.style.cursor = 'pointer';
        }
        
      });

      // Watch for dynamically added buttons
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              const newButtons = node.querySelectorAll ? 
                node.querySelectorAll('.fluvio-call-btn') : 
                (node.classList?.contains('fluvio-call-btn') ? [node] : []);
              
              newButtons.forEach(button => {
                if (!button.hasAttribute('data-fluvio-initialized')) {
                  // Add click handler
                  button.addEventListener('click', handleButtonClick);
                  button.setAttribute('data-fluvio-initialized', 'true');
                }
              });
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });

    }

    tryInitialize();
  }

  // Demo mode for when SDK fails to load
  function enableDemoMode() {
    
    const maxRetries = 5;
    let retryCount = 0;

    function tryInitializeDemo() {
      const buttons = document.querySelectorAll('.fluvio-call-btn');
      
      if (buttons.length === 0 && retryCount < maxRetries) {
        retryCount++;
        setTimeout(tryInitializeDemo, 100);
        return;
      }

      if (buttons.length === 0) {
        return;
      }

      buttons.forEach(button => {
        // Skip if already initialized
        if (button.hasAttribute('data-fluvio-demo-initialized')) {
          return;
        }

        // Remove any existing listeners to prevent duplicates
        button.removeEventListener('click', demoClickHandler);
        
        button.addEventListener('click', demoClickHandler);
        button.setAttribute('data-fluvio-demo-initialized', 'true');
        
        if (!button.style.cursor) {
          button.style.cursor = 'pointer';
        }
        
      });

    }

    function demoClickHandler(e) {
      const button = e.currentTarget; // Use currentTarget instead of target
      
      
      // Ensure button is not disabled
      if (button.disabled) {
        return;
      }
      
      const originalText = button.textContent;
      button.textContent = 'Demo Mode';
      button.disabled = true;
      
      setTimeout(() => {
        alert('Demo Mode: In production, this would start a real voice call with your Fluvio agent.\n\nTo enable real calls, ensure the Retell SDK loads properly.');
        button.textContent = originalText;
        button.disabled = false;
      }, 1000);
    }

    tryInitializeDemo();
  }

  // Initialize when DOM is ready
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