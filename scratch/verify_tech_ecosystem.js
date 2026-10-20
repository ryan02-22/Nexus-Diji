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
  console.log('--- Starting Verification of 3D Tech Ecosystem Showcase ---');
  const port = 9311;
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

  async function testView(name, width, height, isMobile) {
    console.log(`\n========================================`);
    console.log(`Testing View: ${name} (${width}x${height})`);
    console.log(`========================================`);

    await sendPage('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: isMobile
    });
    await sendPage('Page.reload');
    await new Promise(r => setTimeout(r, 1400));

    // Scroll directly to top of #teknologi and activate visible class
    await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const section = document.getElementById('teknologi');
        if (section) {
          const top = section.getBoundingClientRect().top + window.scrollY;
          window.scrollTo(0, top);
          section.classList.add('visible');
          section.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        }
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    const metrics = await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const section = document.getElementById('teknologi');
        const cards = Array.from(document.querySelectorAll('.tech-card'));
        const images = Array.from(document.querySelectorAll('.tech-card__img'));
        
        const cardMetrics = cards.map(c => {
          const r = c.getBoundingClientRect();
          const title = c.querySelector('.tech-card__title')?.textContent.trim();
          return { title, width: Math.round(r.width), height: Math.round(r.height) };
        });

        const imageStatuses = images.map(img => ({
          alt: img.alt,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete
        }));

        const sectionRect = section.getBoundingClientRect();

        return {
          cardCount: cards.length,
          allImagesLoaded: imageStatuses.every(i => i.complete && i.naturalWidth > 0),
          cardMetrics,
          imageStatuses,
          sectionRect: { x: sectionRect.x, y: sectionRect.y, width: sectionRect.width, height: sectionRect.height }
        };
      })()`,
      returnByValue: true
    });

    console.log('Metrics:', JSON.stringify(metrics.result.value, null, 2));

    // Capture screenshot of the #teknologi section
    const res = await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const el = document.getElementById('teknologi');
        const rect = el.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      })()`,
      returnByValue: true
    });
    const clip = res.result.value;

    const screenRes = await sendPage('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: Math.max(0, clip.x),
        y: Math.max(0, clip.y),
        width: clip.width,
        height: Math.min(clip.height, isMobile ? 1800 : 1050),
        scale: 1
      }
    });

    const filename = `qa_tech_ecosystem_${name}.png`;
    const outPath = path.join(artifactsDir, filename);
    fs.writeFileSync(outPath, Buffer.from(screenRes.data, 'base64'));
    console.log(`Saved screenshot: ${filename}`);
  }

  try {
    await testView('desktop_1280px', 1280, 900, false);
    await testView('tablet_768px', 768, 1024, true);
    await testView('mobile_360px', 360, 800, true);
  } finally {
    try { browserWs.close(); } catch (_) {}
    try { chrome.kill(); } catch (_) {}
  }

  console.log('\n--- All QA Screenshots Captured ---');
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
