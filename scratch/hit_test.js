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
    '--remote-debugging-port=9232',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const versionData = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9232/json/version', res => {
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
    width: 755,
    height: 730,
    deviceScaleFactor: 1,
    mobile: true
  });

  await new Promise(r => setTimeout(r, 2000));

  const listenersRes = await sendPage('Runtime.evaluate', {
    expression: "(() => {" +
      "const btn = document.getElementById('fabTrigger');" +
      "const rect = btn.getBoundingClientRect();" +
      "const elAtPoint = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);" +
      "return {" +
        "btnRect: rect," +
        "elAtPointTag: elAtPoint ? elAtPoint.tagName + '#' + elAtPoint.id + '.' + elAtPoint.className : null," +
        "isSameOrChild: elAtPoint ? btn.contains(elAtPoint) : false," +
        "btnPointerEvents: window.getComputedStyle(btn).pointerEvents," +
        "dockPointerEvents: window.getComputedStyle(document.getElementById('toolsOverlay')).pointerEvents," +
        "dockTransform: window.getComputedStyle(document.getElementById('toolsOverlay')).transform," +
        "dockClasses: document.getElementById('toolsOverlay').className" +
      "};" +
    "})()",
    returnByValue: true
  });

  console.log('FAB TRIGGER HIT TEST:\n', JSON.stringify(listenersRes.result.value, null, 2));

  chrome.kill();
  process.exit(0);
}

run().catch(console.error);
