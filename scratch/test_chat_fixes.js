const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactsDir = 'C:\\Users\\Pongo\\.gemini\\antigravity-ide\\brain\\513f7fc2-b4fa-424c-ae7c-36fb8443509f';

function sendCommand(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (msg) => {
      const res = JSON.parse(msg.data);
      if (res.id === id) {
        ws.removeEventListener('message', handler);
        if (res.error) reject(res.error);
        else resolve(res.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function run() {
  console.log('--- Starting Verification of Chat & Window Fixes ---');
  const port = 9277;
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const versionData = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/json/version`, res => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });

  const browserWs = new WebSocket(versionData.webSocketDebuggerUrl);
  await new Promise(r => browserWs.onopen = r);

  const { targetId } = await sendCommand(browserWs, 'Target.createTarget', { url: 'http://localhost:8088/index.html' });
  const { sessionId } = await sendCommand(browserWs, 'Target.attachToTarget', { targetId, flatten: true });

  function sendPage(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 1000000);
      const handler = (msg) => {
        const res = JSON.parse(msg.data);
        if (res.id === id) {
          browserWs.removeEventListener('message', handler);
          if (res.error) reject(res.error);
          else resolve(res.result);
        }
      };
      browserWs.addEventListener('message', handler);
      browserWs.send(JSON.stringify({ id, sessionId, method, params }));
    });
  }

  await sendPage('Page.enable');
  await sendPage('Runtime.enable');
  await sendPage('DOM.enable');

  async function captureScreenshot(filepath, clip = null) {
    const params = { format: 'png' };
    if (clip) params.clip = clip;
    const res = await sendPage('Page.captureScreenshot', params);
    fs.writeFileSync(filepath, Buffer.from(res.data, 'base64'));
    console.log(`Saved screenshot: ${filepath}`);
  }

  async function evaluate(expression) {
    const res = await sendPage('Runtime.evaluate', { expression, returnByValue: true });
    return res.result ? res.result.value : null;
  }

  // Set desktop viewport
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await sendPage('Page.navigate', { url: 'http://localhost:8088/index.html?v=test_' + Date.now() });
  await new Promise(r => setTimeout(r, 2000));

  console.log('\n--- 1. Testing Chat Header & Button Uniformity ---');
  // Open chat popup
  await evaluate(`(() => {
    const btn = document.getElementById('nexusFloatingChatBtn');
    if (btn) btn.click();
  })()`);
  await new Promise(r => setTimeout(r, 600));

  const chatHeaderData = await evaluate(`(() => {
    const popup = document.getElementById('chatPopup');
    const nameEl = popup.querySelector('.chat-bot-name');
    const pillEl = popup.querySelector('.chat-tag-pill');
    const nameRect = nameEl.getBoundingClientRect();
    const pillRect = pillEl.getBoundingClientRect();
    const gap = pillRect.left - nameRect.right;

    const btns = Array.from(popup.querySelectorAll('.chat-header-ctrls button')).map(b => {
      const r = b.getBoundingClientRect();
      const cs = window.getComputedStyle(b);
      return {
        id: b.id,
        className: b.className,
        width: Math.round(r.width * 10) / 10,
        height: Math.round(r.height * 10) / 10,
        aspectRatio: (r.width / r.height).toFixed(2),
        borderRadius: cs.borderRadius
      };
    });

    return {
      open: popup.classList.contains('open'),
      name: nameEl.textContent,
      pill: pillEl.textContent,
      gapBetweenNameAndPill: gap,
      buttons: btns
    };
  })()`);

  console.log('Chat Header Details:', JSON.stringify(chatHeaderData, null, 2));

  // Capture close-up screenshot of chat header
  const chatPopupClip = await evaluate(`(() => {
    const popup = document.getElementById('chatPopup');
    const r = popup.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: 80, scale: 1 };
  })()`);
  await captureScreenshot(path.join(artifactsDir, 'qa_chat_header_buttons_desktop.png'), chatPopupClip);

  console.log('\n--- 2. Testing Chat Window Maximize & Restore ---');
  // Click maximize
  await evaluate(`(() => {
    const maxBtn = document.getElementById('chatMaximizeBtn');
    if (maxBtn) maxBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));

  const chatMaximizedData = await evaluate(`(() => {
    const popup = document.getElementById('chatPopup');
    const r = popup.getBoundingClientRect();
    const maxBtn = document.getElementById('chatMaximizeBtn');
    const iconMax = maxBtn.querySelector('.icon-max');
    const iconRestore = maxBtn.querySelector('.icon-restore');
    const options = Array.from(popup.querySelectorAll('.chat-opt-chip')).map(c => {
      const cr = c.getBoundingClientRect();
      return { text: c.textContent.trim(), width: Math.round(cr.width), height: Math.round(cr.height) };
    });

    return {
      isMaximized: popup.classList.contains('is-maximized'),
      width: Math.round(r.width),
      height: Math.round(r.height),
      iconMaxDisplay: window.getComputedStyle(iconMax).display,
      iconRestoreDisplay: window.getComputedStyle(iconRestore).display,
      optionsCount: options.length,
      sampleOption: options[0]
    };
  })()`);
  console.log('Chat Maximized Details:', JSON.stringify(chatMaximizedData, null, 2));

  await captureScreenshot(path.join(artifactsDir, 'qa_chat_maximized.png'));

  // Restore chat
  await evaluate(`(() => {
    const maxBtn = document.getElementById('chatMaximizeBtn');
    if (maxBtn) maxBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 400));

  console.log('\n--- 3. Testing Help Popup & Estimator Cards ---');
  // Close chat and open help via overlayHelpBtn
  await evaluate(`(() => {
    const chatClose = document.getElementById('chatCloseBtn');
    if (chatClose) chatClose.click();
    const helpBtn = document.getElementById('overlayHelpBtn');
    if (helpBtn) helpBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 600));

  // Switch to estimator tab
  await evaluate(`(() => {
    const estTab = document.querySelector('.help-tab-btn[data-tab="estimator"]');
    if (estTab) estTab.click();
  })()`);
  await new Promise(r => setTimeout(r, 400));

  const estimatorMinimalData = await evaluate(`(() => {
    const popup = document.getElementById('helpPopup');
    const cards = Array.from(popup.querySelectorAll('.estimator-card')).map(c => {
      const r = c.getBoundingClientRect();
      const meta = c.querySelector('.est-meta');
      const strong = c.querySelector('.est-meta strong');
      const span = c.querySelector('.est-meta span');
      return {
        service: c.getAttribute('data-service'),
        cardWidth: Math.round(r.width),
        cardHeight: Math.round(r.height),
        title: strong.textContent.trim(),
        metaText: span.textContent.trim()
      };
    });

    const btns = Array.from(popup.querySelectorAll('.window-ctrl-group button')).map(b => {
      const r = b.getBoundingClientRect();
      const cs = window.getComputedStyle(b);
      return {
        id: b.id,
        width: Math.round(r.width * 10) / 10,
        height: Math.round(r.height * 10) / 10,
        aspectRatio: (r.width / r.height).toFixed(2),
        borderRadius: cs.borderRadius
      };
    });

    return {
      isMaximized: popup.classList.contains('is-maximized'),
      cards,
      buttons: btns
    };
  })()`);
  console.log('Help Estimator (Default/Minimal Window):', JSON.stringify(estimatorMinimalData, null, 2));

  await captureScreenshot(path.join(artifactsDir, 'qa_help_estimator_minimal.png'));

  // Now Maximize Help Popup!
  console.log('\n--- 4. Testing Help Popup Maximized (Card Grid Transformation) ---');
  await evaluate(`(() => {
    const maxBtn = document.getElementById('helpMaximizeBtn');
    if (maxBtn) maxBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));

  const estimatorMaximizedData = await evaluate(`(() => {
    const popup = document.getElementById('helpPopup');
    const r = popup.getBoundingClientRect();
    const cards = Array.from(popup.querySelectorAll('.estimator-card')).map(c => {
      const cr = c.getBoundingClientRect();
      const icon = c.querySelector('.est-icon');
      return {
        service: c.getAttribute('data-service'),
        cardWidth: Math.round(cr.width),
        cardHeight: Math.round(cr.height),
        iconFontSize: window.getComputedStyle(icon).fontSize,
        aspectRatio: (cr.width / cr.height).toFixed(2)
      };
    });

    return {
      isMaximized: popup.classList.contains('is-maximized'),
      windowWidth: Math.round(r.width),
      windowHeight: Math.round(r.height),
      cards
    };
  })()`);
  console.log('Help Estimator (Maximized Window):', JSON.stringify(estimatorMaximizedData, null, 2));

  await captureScreenshot(path.join(artifactsDir, 'qa_help_estimator_maximized.png'));

  // Switch to Warranty Tab in Maximized mode
  await evaluate(`(() => {
    const wTab = document.querySelector('.help-tab-btn[data-tab="warranty"]');
    if (wTab) wTab.click();
  })()`);
  await new Promise(r => setTimeout(r, 400));
  await captureScreenshot(path.join(artifactsDir, 'qa_help_warranty_maximized.png'));

  // Mobile Viewport Test (390x844)
  console.log('\n--- 5. Testing Mobile Viewport (390x844) ---');
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 500));

  // Reset window position / restore
  await evaluate(`(() => {
    const resetBtn = document.getElementById('helpResetPosBtn');
    if (resetBtn) resetBtn.click();
    const estTab = document.querySelector('.help-tab-btn[data-tab="estimator"]');
    if (estTab) estTab.click();
  })()`);
  await new Promise(r => setTimeout(r, 600));

  const mobileEstimatorData = await evaluate(`(() => {
    const popup = document.getElementById('helpPopup');
    const cards = Array.from(popup.querySelectorAll('.estimator-card')).map(c => {
      const cr = c.getBoundingClientRect();
      return {
        service: c.getAttribute('data-service'),
        cardWidth: Math.round(cr.width),
        cardHeight: Math.round(cr.height),
        textGepengCheck: cr.height >= 50
      };
    });
    return { cards };
  })()`);
  console.log('Mobile Estimator Cards:', JSON.stringify(mobileEstimatorData, null, 2));

  await captureScreenshot(path.join(artifactsDir, 'qa_mobile_help_estimator_390px.png'));

  // Also open mobile chat
  await evaluate(`(() => {
    const helpClose = document.getElementById('helpCloseBtn');
    if (helpClose) helpClose.click();
    const chatBtn = document.getElementById('nexusFloatingChatBtn');
    if (chatBtn) chatBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 600));
  await captureScreenshot(path.join(artifactsDir, 'qa_mobile_chat_390px.png'));

  console.log('\n--- All Automated Verification Tests Finished Successfully! ---');
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
