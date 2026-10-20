const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

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
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9229',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const versionData = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9229/json/version', res => {
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
  await sendPage('DOM.enable');

  // Test at 755px
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 755,
    height: 730,
    deviceScaleFactor: 1,
    mobile: true
  });

  await new Promise(r => setTimeout(r, 1500));

  // 1. Click fabTrigger to open left dock
  console.log('1. Clicking fabTrigger...');
  await sendPage('Runtime.evaluate', {
    expression: "(() => { document.getElementById('fabTrigger').click(); })()"
  });
  await new Promise(r => setTimeout(r, 600));

  let shot = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/interact_1_dock_open_755px.png', Buffer.from(shot.data, 'base64'));

  const dockState = await sendPage('Runtime.evaluate', {
    expression: "(() => { const dock = document.getElementById('toolsOverlay'); const rect = dock.getBoundingClientRect(); return { class: dock.className, rect: { left: Math.round(rect.left), right: Math.round(rect.right), top: Math.round(rect.top), bottom: Math.round(rect.bottom) } }; })()",
    returnByValue: true
  });
  console.log('Dock opened state:', dockState.result.value);

  // 2. Click overlayHelpBtn from the opened dock
  console.log('2. Clicking overlayHelpBtn...');
  await sendPage('Runtime.evaluate', {
    expression: "(() => { document.getElementById('overlayHelpBtn').click(); })()"
  });
  await new Promise(r => setTimeout(r, 600));

  shot = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/interact_2_help_open_755px.png', Buffer.from(shot.data, 'base64'));

  const helpState = await sendPage('Runtime.evaluate', {
    expression: "(() => { const popup = document.getElementById('helpPopup'); const cs = window.getComputedStyle(popup); const rect = popup.getBoundingClientRect(); return { open: popup.classList.contains('open'), display: cs.display, opacity: cs.opacity, rect: { left: Math.round(rect.left), right: Math.round(rect.right), top: Math.round(rect.top), bottom: Math.round(rect.bottom) } }; })()",
    returnByValue: true
  });
  console.log('Help popup state:', helpState.result.value);

  // 3. Click switch to chat inside help popup
  console.log('3. Clicking helpSwitchToChatBtn...');
  await sendPage('Runtime.evaluate', {
    expression: "(() => { document.getElementById('helpSwitchToChatBtn').click(); })()"
  });
  await new Promise(r => setTimeout(r, 600));

  shot = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/interact_3_chat_switched_755px.png', Buffer.from(shot.data, 'base64'));

  const chatState = await sendPage('Runtime.evaluate', {
    expression: "(() => { const chat = document.getElementById('chatPopup'); const cs = window.getComputedStyle(chat); return { open: chat.classList.contains('open'), display: cs.display, opacity: cs.opacity }; })()",
    returnByValue: true
  });
  console.log('Chat popup state after switch:', chatState.result.value);

  chrome.kill();
  console.log('All interaction tests completed successfully!');
  process.exit(0);
}

run().catch(console.error);
