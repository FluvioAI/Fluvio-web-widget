/**
 * Fluvio Button Widget - Simple Call Button
 * Place anywhere on your website - just initiates voice calls
 * 
 * Usage:
 * <button class="fluvio-call-btn" 
 *         data-webhook="https://hook.us2.make.com/your-webhook"
 *         data-agent-id="agent_your_agent_id">Call Now</button>
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

  console.log('🎧 Fluvio Button Widget Loading...');

  let retellClient = null;
  let isCallActive = false;
  let currentButton = null;

  // Load Retell SDK
  function loadRetellSDK() {
    return new Promise((resolve, reject) => {
      if (window.RetellWebClient) {
        resolve();
        return;
      }

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
              console.error('🎧 All SDK loading methods failed:', err);
              reject(new Error('Failed to load Retell SDK'));
            });
        };
        
        document.head.appendChild(script2);
      };
      
      document.head.appendChild(script);
    });
  }

  // Get access token from webhook
  async function getAccessToken(webhook, agentId, dynamicVariables = {}) {
    try {
      const payload = { agent_id: agentId };
      
      // Add dynamic variables if provided
      if (Object.keys(dynamicVariables).length > 0) {
        payload.dynamic_variables = dynamicVariables;
        console.log('🎧 Including dynamic variables:', dynamicVariables);
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
      console.log('🎧 Webhook response received');

      try {
        const data = JSON.parse(responseText);
        
        // Handle different response formats
        if (data.access_token) {
          return {
            accessToken: data.access_token,
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
      console.error('🎧 Webhook error:', error);
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
      console.log('🎧 Call already active');
      return;
    }

    const webhook = button.getAttribute('data-webhook');
    const agentId = button.getAttribute('data-agent-id');

    if (!webhook || !agentId) {
      console.error('🎧 Missing webhook or agent-id attributes');
      alert('Button configuration error: Missing webhook or agent-id');
      return;
    }

    try {
      currentButton = button;
      
      // Update button state
      const originalText = button.textContent;
      button.textContent = 'Connecting...';
      button.disabled = true;

      // Get dynamic variables from button attributes
      const dynamicVariables = getDynamicVariables(button);

      // Get access token
      const { accessToken, dynamicVariables: webhookVariables } = await getAccessToken(webhook, agentId, dynamicVariables);

      // Merge dynamic variables (webhook takes priority)
      const finalVariables = { ...dynamicVariables, ...webhookVariables };

      // Initialize Retell client if needed
      if (!retellClient) {
        retellClient = new window.RetellWebClient();
        
        retellClient.on('call_started', () => {
          console.log('🎧 Call started');
          isCallActive = true;
          button.textContent = 'End Call';
          button.disabled = false;
        });

        retellClient.on('call_ended', () => {
          console.log('🎧 Call ended');
          isCallActive = false;
          button.textContent = originalText;
          button.disabled = false;
          currentButton = null;
        });

        retellClient.on('error', (error) => {
          console.error('🎧 Call error:', error);
          isCallActive = false;
          button.textContent = originalText;
          button.disabled = false;
          currentButton = null;
          alert('Call failed: ' + error.message);
        });
      }

      // Start the call
      const callOptions = { accessToken };
      
      // Add dynamic variables if available
      if (Object.keys(finalVariables).length > 0) {
        callOptions.retell_llm_dynamic_variables = finalVariables;
        console.log('🎧 Starting call with dynamic variables:', finalVariables);
      }

      await retellClient.startCall(callOptions);

    } catch (error) {
      console.error('🎧 Failed to start call:', error);
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
      console.error('🎧 Failed to end call:', error);
    }
  }

  // Handle button clicks
  function handleButtonClick(event) {
    const button = event.currentTarget; // Use currentTarget instead of target
    
    console.log('🎧 Button click detected:', button);
    
    // Ensure button is not disabled
    if (button.disabled) {
      console.log('🎧 Button is disabled, ignoring click');
      return;
    }
    
    if (isCallActive && button === currentButton) {
      console.log('🎧 Ending active call');
      endCall(button);
    } else if (!isCallActive) {
      console.log('🎧 Starting new call');
      startCall(button);
    }
  }

  // Initialize widget
  async function init() {
    try {
      // Load Retell SDK
      await loadRetellSDK();
      
      if (!window.RetellWebClient) {
        console.warn('🎧 RetellWebClient not available, enabling demo mode');
        // Enable demo mode instead of failing
        enableDemoMode();
        return;
      }

      console.log('🎧 Retell SDK ready');

      // Initialize buttons with retry mechanism
      initializeButtons();

    } catch (error) {
      console.warn('🎧 Failed to load Retell SDK, enabling demo mode:', error);
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
        console.log(`🎧 No buttons found, retrying... (${retryCount}/${maxRetries})`);
        setTimeout(tryInitialize, 100);
        return;
      }

      if (buttons.length === 0) {
        console.log('🎧 No Fluvio buttons found after retries');
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
        
        console.log('🎧 Button initialized:', button);
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
                  console.log('🎧 Dynamic button initialized:', button);
                }
              });
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });

      console.log('🎧 Fluvio Button Widget ready!');
    }

    tryInitialize();
  }

  // Demo mode for when SDK fails to load
  function enableDemoMode() {
    console.log('🎧 Demo mode enabled');
    
    const maxRetries = 5;
    let retryCount = 0;

    function tryInitializeDemo() {
      const buttons = document.querySelectorAll('.fluvio-call-btn');
      
      if (buttons.length === 0 && retryCount < maxRetries) {
        retryCount++;
        console.log(`🎧 Demo mode: No buttons found, retrying... (${retryCount}/${maxRetries})`);
        setTimeout(tryInitializeDemo, 100);
        return;
      }

      if (buttons.length === 0) {
        console.log('🎧 Demo mode: No Fluvio buttons found after retries');
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
        
        console.log('🎧 Button initialized in demo mode:', button);
      });

      console.log('🎧 Fluvio Button Widget ready (Demo Mode)!');
    }

    function demoClickHandler(e) {
      const button = e.currentTarget; // Use currentTarget instead of target
      
      console.log('🎧 Demo button click detected:', button);
      
      // Ensure button is not disabled
      if (button.disabled) {
        console.log('🎧 Demo button is disabled, ignoring click');
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