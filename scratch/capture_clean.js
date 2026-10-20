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
  console.log('--- Capturing Accurate QA Screenshots of Tech Ecosystem ---');
  const port = 9333;
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

  const { targetId } = await sendCommand(browserWs, 'Target.createTarget', { url: 'http://localhost:8088/pages/layanan.html' });
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

  async function captureView(name, width, height, isMobile) {
    console.log(`\nCapturing: ${name} (${width}x${height})`);
    await sendPage('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: isMobile
    });
    await sendPage('Page.reload');
    await new Promise(r => setTimeout(r, 1400));

    // Scroll element into view with header breathing room
    await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const section = document.getElementById('teknologi');
        if (section) {
          section.scrollIntoView({ behavior: 'instant', block: 'start' });
          window.scrollBy(0, -20);
          section.classList.add('visible');
          section.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        }
      })()`
    });
    await new Promise(r => setTimeout(r, 800));

    // Viewport screenshot
    const shot = await sendPage('Page.captureScreenshot', { format: 'png' });
    const filename = `view_${name}.png`;
    fs.writeFileSync(path.join(artifactsDir, filename), Buffer.from(shot.data, 'base64'));
    console.log(`Saved viewport screenshot: ${filename}`);

    // Also get full element capture if desired
    const rectRes = await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const section = document.getElementById('teknologi');
        const r = section.getBoundingClientRect();
        return {
          x: Math.round(r.x + window.scrollX),
          y: Math.round(r.y + window.scrollY),
          width: Math.round(r.width),
          height: Math.round(r.height)
        };
      })()`,
      returnByValue: true
    });
    const rect = rectRes.result.value;

    const fullElShot = await sendPage('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        scale: 1
      }
    });
    const fullFilename = `section_${name}.png`;
    fs.writeFileSync(path.join(artifactsDir, fullFilename), Buffer.from(fullElShot.data, 'base64'));
    console.log(`Saved full element screenshot: ${fullFilename}`);
  }

  try {
    await captureView('desktop_1280px', 1280, 950, false);
    await captureView('tablet_768px', 768, 1024, true);
    await captureView('mobile_390px', 390, 844, true);
  } finally {
    try { browserWs.close(); } catch (_) {}
    try { chrome.kill(); } catch (_) {}
  }

  console.log('--- All captures complete ---');
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
