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
  console.log('--- Testing Dock Tooltip Clearance ("Teks Tertutup" Fix) ---');
  const port = 9288;
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

  // Set viewport
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await sendPage('Page.navigate', { url: 'http://localhost:8088/index.html?v=test_' + Date.now() });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Open the sliding dock by clicking fabTrigger
  console.log('1. Opening sliding dock via fabTrigger click...');
  await evaluate(`(() => {
    const trigger = document.getElementById('fabTrigger');
    if (trigger) trigger.click();
  })()`);
  await new Promise(r => setTimeout(r, 600));

  // 2. Move mouse onto overlayHelpBtn via CDP
  console.log('2. Hovering #overlayHelpBtn (Pusat Bantuan)...');
  const btnCoords = await evaluate(`(() => {
    const btn = document.getElementById('overlayHelpBtn');
    const r = btn.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  })()`);

  await sendPage('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: btnCoords.x,
    y: btnCoords.y
  });
  await new Promise(r => setTimeout(r, 600));

  const measurement = await evaluate(`(() => {
    const dock = document.getElementById('toolsOverlay');
    const dockRect = dock.getBoundingClientRect();
    const trigger = document.getElementById('fabTrigger');
    const triggerRect = trigger.getBoundingClientRect();
    const helpBtn = document.getElementById('overlayHelpBtn');
    const helpBtnRect = helpBtn.getBoundingClientRect();
    const tooltip = helpBtn.querySelector('.tool-tooltip');
    const tooltipRect = tooltip.getBoundingClientRect();

    const clearance = tooltipRect.left - triggerRect.right;
    const isCovered = tooltipRect.left < triggerRect.right;

    return {
      dockRight: Math.round(dockRect.right),
      triggerRight: Math.round(triggerRect.right),
      triggerWidth: Math.round(triggerRect.width),
      tooltipText: tooltip.textContent.trim(),
      tooltipLeft: Math.round(tooltipRect.left),
      tooltipRight: Math.round(tooltipRect.right),
      tooltipWidth: Math.round(tooltipRect.width),
      clearanceGapPx: Math.round(clearance),
      isCoveredByTrigger: isCovered
    };
  })()`);

  console.log('Measurement Results:', JSON.stringify(measurement, null, 2));

  // Capture close-up screenshot of dock, trigger and tooltip
  const clip = await evaluate(`(() => {
    const dock = document.getElementById('toolsOverlay');
    const r = dock.getBoundingClientRect();
    return {
      x: 0,
      y: Math.max(0, r.top - 30),
      width: 260,
      height: r.height + 60,
      scale: 1
    };
  })()`);

  await captureScreenshot(path.join(artifactsDir, 'qa_dock_tooltip_clearance.png'), clip);

  // 3. Also hover overlayChatBtn
  console.log('3. Hovering #overlayChatBtn (Nexus AI Chat)...');
  const chatBtnCoords = await evaluate(`(() => {
    const btn = document.getElementById('overlayChatBtn');
    const r = btn.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  })()`);

  await sendPage('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: chatBtnCoords.x,
    y: chatBtnCoords.y
  });
  await new Promise(r => setTimeout(r, 600));

  await captureScreenshot(path.join(artifactsDir, 'qa_dock_chat_tooltip.png'), clip);

  console.log('--- Test Finished Successfully! ---');
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
