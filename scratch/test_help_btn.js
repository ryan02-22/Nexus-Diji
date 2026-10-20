const http = require('http');
const { spawn } = require('child_process');

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
    '--remote-debugging-port=9237',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const versionData = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9237/json/version', res => {
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

  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 1267,
    height: 707,
    deviceScaleFactor: 1,
    mobile: false
  });

  await new Promise(r => setTimeout(r, 2000));

  // Check event listeners on overlayHelpBtn
  const evalRes = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('overlayHelpBtn');
      const popup = document.getElementById('helpPopup');
      return {
        btnExists: !!btn,
        popupExists: !!popup,
        btnRect: btn ? btn.getBoundingClientRect() : null,
        popupDisplay: popup ? window.getComputedStyle(popup).display : null,
        popupOpacity: popup ? window.getComputedStyle(popup).opacity : null,
        popupClasses: popup ? popup.className : null
      };
    })()`,
    returnByValue: true
  });

  console.log('OVERLAY HELP BTN STATE:', JSON.stringify(evalRes.result.value, null, 2));

  // Now click overlayHelpBtn via JS
  await sendPage('Runtime.evaluate', {
    expression: "document.getElementById('overlayHelpBtn').click()"
  });

  await new Promise(r => setTimeout(r, 500));

  const afterClick = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const popup = document.getElementById('helpPopup');
      return {
        popupDisplay: popup ? window.getComputedStyle(popup).display : null,
        popupOpacity: popup ? window.getComputedStyle(popup).opacity : null,
        popupClasses: popup ? popup.className : null,
        bodyClasses: document.body.className
      };
    })()`,
    returnByValue: true
  });

  console.log('AFTER CLICKING overlayHelpBtn:', JSON.stringify(afterClick.result.value, null, 2));

  chrome.kill();
  process.exit(0);
}

run().catch(console.error);
