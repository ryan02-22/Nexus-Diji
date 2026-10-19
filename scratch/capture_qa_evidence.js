const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9223',
    'about:blank'
  ]);

  await sleep(1500);

  const versionData = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9223/json/version', res => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });

  const browserWs = new WebSocket(versionData.webSocketDebuggerUrl);
  await new Promise(r => browserWs.onopen = r);

  // Create a new target page
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
  await sendPage('Runtime.enable');

  console.log('Navigating to http://localhost:8088/index.html...');
  await sendPage('Page.navigate', { url: 'http://localhost:8088/index.html' });
  await sleep(2000);

  async function takeScreenshot(filename) {
    const { data } = await sendPage('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(__dirname, filename);
    fs.writeFileSync(fullPath, Buffer.from(data, 'base64'));
    console.log('Saved screenshot:', fullPath);
  }

  // 1. MOBILE TEST (390 x 844)
  console.log('--- 1. MOBILE TEST (390 x 844) ---');
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(500);

  // Scroll down 600px
  await sendPage('Runtime.evaluate', { expression: 'window.scrollTo(0, 600);' });
  await sleep(800);
  await takeScreenshot('evidence_mobile_formation.png');

  // Open Help Popup
  await sendPage('Runtime.evaluate', { expression: "document.getElementById('overlayHelpBtn').click();" });
  await sleep(600);
  await takeScreenshot('evidence_mobile_help_popup.png');

  // Click Estimator Tab
  await sendPage('Runtime.evaluate', { expression: "document.querySelector('[data-tab=\"estimator\"]').click();" });
  await sleep(400);
  // Select Aplikasi Mobile
  await sendPage('Runtime.evaluate', { expression: "document.querySelectorAll('.estimator-card')[2].click();" });
  await sleep(400);
  await takeScreenshot('evidence_mobile_estimator_tab.png');

  // Switch to Chatbot
  await sendPage('Runtime.evaluate', { expression: "document.getElementById('helpSwitchToChatBtn').click();" });
  await sleep(600);
  await takeScreenshot('evidence_mobile_chat_popup.png');

  // Close Chat
  await sendPage('Runtime.evaluate', { expression: "document.getElementById('chatCloseBtn').click();" });
  await sleep(400);

  // 2. DESKTOP TEST (1440 x 900)
  console.log('--- 2. DESKTOP TEST (1440 x 900) ---');
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sleep(500);

  // Scroll down 600px
  await sendPage('Runtime.evaluate', { expression: 'window.scrollTo(0, 600);' });
  await sleep(800);
  await takeScreenshot('evidence_desktop_formation.png');

  // Open Help Popup
  await sendPage('Runtime.evaluate', { expression: "document.getElementById('overlayHelpBtn').click();" });
  await sleep(600);
  await takeScreenshot('evidence_desktop_help_popup.png');

  // Click Estimator Tab & Select Option
  await sendPage('Runtime.evaluate', { expression: "document.querySelector('[data-tab=\"estimator\"]').click();" });
  await sleep(400);
  await sendPage('Runtime.evaluate', { expression: "document.querySelectorAll('.estimator-card')[1].click();" });
  await sleep(400);
  await takeScreenshot('evidence_desktop_estimator_tab.png');

  console.log('All QA evidence captured successfully!');
  browserWs.close();
  chrome.kill();
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
