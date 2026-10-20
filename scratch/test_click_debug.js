const http = require('http');
const { spawn } = require('child_process');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', '--disable-gpu', '--remote-debugging-port=9252', 'about:blank'
]);

setTimeout(async () => {
  try {
    const versionData = await new Promise(r => http.get('http://127.0.0.1:9252/json/version', res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => r(JSON.parse(d)));
    }));
    const ws = new WebSocket(versionData.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    const sendRaw = (method, params = {}) => new Promise((resolve, reject) => {
      const cur = id++;
      const h = (m) => {
        const res = JSON.parse(m.data);
        if (res.id === cur) {
          ws.removeEventListener('message', h);
          if (res.error) reject(res.error);
          else resolve(res.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: cur, method, params }));
    });

    const t = await sendRaw('Target.createTarget', { url: 'http://localhost:8088/index.html' });
    const { sessionId } = await sendRaw('Target.attachToTarget', { targetId: t.targetId, flatten: true });

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const cur = id++;
      const h = (m) => {
        const res = JSON.parse(m.data);
        if (res.id === cur) {
          ws.removeEventListener('message', h);
          if (res.error) reject(res.error);
          else resolve(res.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: cur, sessionId, method, params }));
    });

    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1267, height: 707, deviceScaleFactor: 1, mobile: false });
    await new Promise(r => setTimeout(r, 2000));

    // Check state before click
    const before = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.getElementById('fabTrigger');
        const overlay = document.getElementById('toolsOverlay');
        const hp = document.getElementById('helpPopup');
        return {
          btnTag: btn ? btn.tagName : null,
          overlayClass: overlay ? overlay.className : null,
          overlayRect: overlay ? overlay.getBoundingClientRect() : null,
          btnRect: btn ? btn.getBoundingClientRect() : null,
          hpDisplay: hp ? hp.style.display : null,
          hpClass: hp ? hp.className : null
        };
      })()`,
      returnByValue: true
    });
    console.log('BEFORE CLICK:', JSON.stringify(before.result.value, null, 2));

    // Click fabTrigger via DOM click
    const afterClick = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.getElementById('fabTrigger');
        btn.click();
        const hp = document.getElementById('helpPopup');
        const cs = window.getComputedStyle(hp);
        return {
          hpClass: hp.className,
          hpDisplay: cs.display,
          hpOpacity: cs.opacity,
          isOpen: hp.classList.contains('open'),
          bodyClass: document.body.className
        };
      })()`,
      returnByValue: true
    });
    console.log('AFTER CLICK:', JSON.stringify(afterClick.result.value, null, 2));

    // Wait 300ms and check again
    await new Promise(r => setTimeout(r, 300));
    const afterWait = await send('Runtime.evaluate', {
      expression: `(() => {
        const hp = document.getElementById('helpPopup');
        const cs = window.getComputedStyle(hp);
        return {
          hpClass: hp.className,
          hpDisplay: cs.display,
          hpOpacity: cs.opacity,
          isOpen: hp.classList.contains('open')
        };
      })()`,
      returnByValue: true
    });
    console.log('AFTER 300MS WAIT:', JSON.stringify(afterWait.result.value, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
    process.exit(0);
  }
}, 1500);
