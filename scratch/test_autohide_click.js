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
    '--remote-debugging-port=9235',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const versionData = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9235/json/version', res => {
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

  // Test at 1267x707
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 1267,
    height: 707,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Wait 6 seconds so auto-hide timer has collapsed it!
  await new Promise(r => setTimeout(r, 6500));

  // Screenshot when collapsed
  let shot = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/collapsed_before_click.png', Buffer.from(shot.data, 'base64'));

  const s1 = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const el = document.getElementById('toolsOverlay');
      const r = document.getElementById('fabTrigger').getBoundingClientRect();
      return {
        class: el.className,
        rect: el.getBoundingClientRect(),
        btnRect: r,
        btnCenter: { x: r.left + r.width/2, y: r.top + r.height/2 }
      };
    })()`,
    returnByValue: true
  });
  console.log('1. STATE AT 6.5s (should be collapsed):', s1.result.value);

  // Click on the button at its exact coordinates
  const { x, y } = s1.result.value.btnCenter;
  console.log(`2. Clicking at (${x}, ${y})...`);
  await sendPage('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await sendPage('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });

  await new Promise(r => setTimeout(r, 500));

  shot = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/after_click.png', Buffer.from(shot.data, 'base64'));

  const s2 = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const el = document.getElementById('toolsOverlay');
      return {
        class: el.className,
        rect: el.getBoundingClientRect(),
        helpPopupOpen: document.getElementById('helpPopup').classList.contains('open'),
        chatPopupOpen: document.getElementById('chatPopup').classList.contains('open')
      };
    })()`,
    returnByValue: true
  });
  console.log('3. STATE AFTER CLICK:', s2.result.value);

  chrome.kill();
  process.exit(0);
}

run().catch(console.error);
