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

async function run() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9245',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const versionData = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9245/json/version', res => {
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

  // Viewports to test
  const viewports = [
    { name: 'desktop_1267x707', width: 1267, height: 707, mobile: false },
    { name: 'tablet_755x730', width: 755, height: 730, mobile: false },
    { name: 'mobile_390x844', width: 390, height: 844, mobile: true }
  ];

  for (const vp of viewports) {
    console.log(`\n=================== TESTING VIEWPORT: ${vp.name} ===================`);
    await sendPage('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.mobile
    });

    await new Promise(r => setTimeout(r, 1200));

    // Check fabTrigger coordinates
    const btnData = await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.getElementById('fabTrigger');
        if (!btn) return { error: 'fabTrigger not found' };
        const r = btn.getBoundingClientRect();
        return {
          id: btn.id,
          tag: btn.tagName,
          rect: { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right },
          center: { x: r.left + r.width/2, y: r.top + r.height/2 }
        };
      })()`,
      returnByValue: true
    });
    console.log(`[${vp.name}] fabTrigger pos:`, JSON.stringify(btnData.result.value));

    // Click fabTrigger using real mouse event
    const cx = btnData.result.value.center.x;
    const cy = btnData.result.value.center.y;
    await sendPage('Input.dispatchMouseEvent', { type: 'mousePressed', x: cx, y: cy, button: 'left', clickCount: 1 });
    await sendPage('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx, y: cy, button: 'left', clickCount: 1 });

    // Wait a brief tick (instant popup)
    await new Promise(r => setTimeout(r, 350));

    // Verify helpPopup status
    const helpStatus = await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const hp = document.getElementById('helpPopup');
        if (!hp) return { error: 'helpPopup not found' };
        const cs = window.getComputedStyle(hp);
        const r = hp.getBoundingClientRect();
        return {
          isOpen: hp.classList.contains('open'),
          display: cs.display,
          opacity: cs.opacity,
          visibility: cs.visibility,
          ariaHidden: hp.getAttribute('aria-hidden'),
          bodyHelpActive: document.body.classList.contains('help-active'),
          rect: { top: r.top, left: r.left, width: r.width, height: r.height }
        };
      })()`,
      returnByValue: true
    });
    console.log(`[${vp.name}] helpPopup status after click:`, JSON.stringify(helpStatus.result.value, null, 2));

    // Capture screenshot of help modal
    const ss = await sendPage('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, `evidence_fab_help_${vp.name}.png`), Buffer.from(ss.data, 'base64'));
    console.log(`Saved screenshot: evidence_fab_help_${vp.name}.png`);

    // Now click close button
    await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const closeBtn = document.getElementById('helpCloseBtn');
        if (closeBtn) closeBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 350));

    // Now test opening chatPopup via floatingChatBtn
    const chatBtnData = await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const cb = document.getElementById('nexusFloatingChatBtn');
        if (!cb) return { error: 'nexusFloatingChatBtn not found' };
        cb.click();
        const cp = document.getElementById('chatPopup');
        return {
          isOpen: cp.classList.contains('open'),
          display: window.getComputedStyle(cp).display,
          bodyChatActive: document.body.classList.contains('chat-active')
        };
      })()`,
      returnByValue: true
    });
    console.log(`[${vp.name}] chatPopup opened:`, JSON.stringify(chatBtnData.result.value));

    // Close chat
    await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const cc = document.getElementById('chatCloseBtn');
        if (cc) cc.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 350));
  }

  console.log('\nAll tests completed successfully!');
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
