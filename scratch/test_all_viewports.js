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
    '--remote-debugging-port=9228',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const versionData = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9228/json/version', res => {
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

  const viewports = [
    { name: '755x730_tablet', w: 755, h: 730 },
    { name: '766x730_tablet', w: 766, h: 730 },
    { name: '390x844_mobile', w: 390, h: 844 },
    { name: '1440x900_desktop', w: 1440, h: 900 }
  ];

  for (const vp of viewports) {
    await sendPage('Emulation.setDeviceMetricsOverride', {
      width: vp.w,
      height: vp.h,
      deviceScaleFactor: 1,
      mobile: vp.w < 1000
    });

    await new Promise(r => setTimeout(r, 1200));

    const evalRes = await sendPage('Runtime.evaluate', {
      expression: `(() => {
        function getInfo(id) {
          const el = document.getElementById(id);
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          const cs = window.getComputedStyle(el);
          return {
            id,
            class: el.className,
            display: cs.display,
            position: cs.position,
            top: cs.top,
            bottom: cs.bottom,
            left: cs.left,
            right: cs.right,
            rect: { top: Math.round(rect.top), left: Math.round(rect.left), right: Math.round(rect.right), bottom: Math.round(rect.bottom), width: Math.round(rect.width), height: Math.round(rect.height) }
          };
        }
        return {
          toolsOverlay: getInfo('toolsOverlay'),
          fabTrigger: getInfo('fabTrigger'),
          mascotBtn: getInfo('nexusFloatingChatBtn'),
          backToTop: getInfo('backToTop')
        };
      })()`,
      returnByValue: true
    });

    console.log('=== VIEWPORT ' + vp.name + ' ===');
    console.log(JSON.stringify(evalRes.result.value, null, 2));

    const screenshot = await sendPage('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/vp_' + vp.name + '.png', Buffer.from(screenshot.data, 'base64'));
  }

  chrome.kill();
  process.exit(0);
}

run().catch(console.error);
