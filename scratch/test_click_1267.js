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
    '--remote-debugging-port=9234',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const versionData = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9234/json/version', res => {
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

  // Test at 1267x707 (User's exact current viewport!)
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 1267,
    height: 707,
    deviceScaleFactor: 1,
    mobile: false
  });

  await new Promise(r => setTimeout(r, 2000));

  // Get initial state of toolsOverlay
  const s1 = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const el = document.getElementById('toolsOverlay');
      return {
        class: el.className,
        style: el.getAttribute('style'),
        csTransform: window.getComputedStyle(el).transform,
        rect: el.getBoundingClientRect()
      };
    })()`,
    returnByValue: true
  });
  console.log('1. INITIAL AT 1267px:', s1.result.value);

  // Send real mouse click to the center of fabTrigger
  const btn = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const r = document.getElementById('fabTrigger').getBoundingClientRect();
      return { x: r.left + r.width/2, y: r.top + r.height/2 };
    })()`,
    returnByValue: true
  });
  console.log('2. fabTrigger center point:', btn.result.value);

  await sendPage('Input.dispatchMouseEvent', { type: 'mousePressed', x: btn.result.value.x, y: btn.result.value.y, button: 'left', clickCount: 1 });
  await sendPage('Input.dispatchMouseEvent', { type: 'mouseReleased', x: btn.result.value.x, y: btn.result.value.y, button: 'left', clickCount: 1 });

  await new Promise(r => setTimeout(r, 300));

  const s2 = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const el = document.getElementById('toolsOverlay');
      return {
        class: el.className,
        csTransform: window.getComputedStyle(el).transform,
        rect: el.getBoundingClientRect()
      };
    })()`,
    returnByValue: true
  });
  console.log('3. AFTER MOUSE CLICK AT 1267px:', s2.result.value);

  chrome.kill();
  process.exit(0);
}

run().catch(console.error);
