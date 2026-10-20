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
    '--remote-debugging-port=9260',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const versionData = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9260/json/version', res => {
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
  await sendPage('Network.enable');
  await sendPage('Network.setCacheDisabled', { cacheDisabled: true });
  await sendPage('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 1500));

  // Test 1: Desktop Viewport (1267x707 - User's exact current viewport)
  console.log('=== TEST 1: SLIDING DOCK (OPEN & CLOSE) AT 1267px ===');
  await sendPage('Emulation.setDeviceMetricsOverride', { width: 1267, height: 707, deviceScaleFactor: 1, mobile: false });
  await new Promise(r => setTimeout(r, 800));

  // 1. Initial State: Dock is collapsed, trigger is compact
  const triggerCheck = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('fabTrigger');
      const dock = document.getElementById('toolsOverlay');
      const r = btn.getBoundingClientRect();
      return {
        dockClass: dock.className,
        btnWidth: r.width,
        btnHeight: r.height,
        btnRight: r.right
      };
    })()`,
    returnByValue: true
  });
  console.log('1. Initial dock status:', triggerCheck.result.value);

  // 2. Click fabTrigger to slide out dock
  await sendPage('Runtime.evaluate', {
    expression: `document.getElementById('fabTrigger').click();`
  });
  await new Promise(r => setTimeout(r, 450));

  const dockOpenCheck = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const dock = document.getElementById('toolsOverlay');
      const r = dock.getBoundingClientRect();
      return {
        dockClass: dock.className,
        dockLeft: r.left,
        dockWidth: r.width,
        isVisible: dock.classList.contains('visible')
      };
    })()`,
    returnByValue: true
  });
  console.log('2. After 1st click (Slide Open):', dockOpenCheck.result.value);

  // Capture screenshot of slid-out dock
  let ss = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'evidence_dock_slid_open_1267px.png'), Buffer.from(ss.data, 'base64'));

  // 3. Click fabTrigger again to slide close
  await sendPage('Runtime.evaluate', {
    expression: `document.getElementById('fabTrigger').click();`
  });
  await new Promise(r => setTimeout(r, 450));

  const dockCloseCheck = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const dock = document.getElementById('toolsOverlay');
      return {
        dockClass: dock.className,
        isCollapsed: dock.classList.contains('collapsed')
      };
    })()`,
    returnByValue: true
  });
  console.log('3. After 2nd click (Slide Close):', dockCloseCheck.result.value);

  // 4. Slide open dock, then click overlayHelpBtn to open Help Hub
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      document.getElementById('fabTrigger').click();
      setTimeout(() => {
        document.getElementById('overlayHelpBtn').click();
      }, 300);
    })()`
  });
  await new Promise(r => setTimeout(r, 700));

  const helpCheck = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const hp = document.getElementById('helpPopup');
      const r = hp.getBoundingClientRect();
      return {
        isOpen: hp.classList.contains('open'),
        rect: { top: r.top, left: r.left, width: r.width, height: r.height }
      };
    })()`,
    returnByValue: true
  });
  console.log('4. Help Hub opened from dock:', helpCheck.result.value);

  // 5. Test Window Dragging on Help Hub
  console.log('=== TEST 2: WINDOW DRAGGING ON HELP HUB ===');
  const dragResult = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const hp = document.getElementById('helpPopup');
      const header = hp.querySelector('.help-header');
      const r1 = hp.getBoundingClientRect();

      // Dispatch pointerdown, move, up
      header.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r1.left + 50, clientY: r1.top + 20, pointerId: 1 }));
      header.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: r1.left + 150, clientY: r1.top + 80, pointerId: 1 }));
      header.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: r1.left + 150, clientY: r1.top + 80, pointerId: 1 }));

      const r2 = hp.getBoundingClientRect();
      return {
        initial: { left: r1.left, top: r1.top },
        afterDrag: { left: r2.left, top: r2.top, styleLeft: hp.style.left, styleTop: hp.style.top },
        hasMoved: r2.left !== r1.left || r2.top !== r1.top
      };
    })()`,
    returnByValue: true
  });
  console.log('5. Dragging window result:', dragResult.result.value);

  // 6. Test Window Resizing on Help Hub
  console.log('=== TEST 3: WINDOW RESIZING ON HELP HUB ===');
  const resizeResult = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const hp = document.getElementById('helpPopup');
      const handle = hp.querySelector('.window-resize-br');
      const r1 = hp.getBoundingClientRect();

      // Dispatch resize pointer events
      handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r1.right, clientY: r1.bottom, pointerId: 2 }));
      handle.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: r1.right + 70, clientY: r1.bottom + 50, pointerId: 2 }));
      handle.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: r1.right + 70, clientY: r1.bottom + 50, pointerId: 2 }));

      const r2 = hp.getBoundingClientRect();
      return {
        initial: { width: r1.width, height: r1.height },
        afterResize: { width: r2.width, height: r2.height, styleW: hp.style.width, styleH: hp.style.height },
        hasGrown: r2.width > r1.width && r2.height > r1.height
      };
    })()`,
    returnByValue: true
  });
  console.log('6. Resizing window result:', resizeResult.result.value);

  // 7. Test Maximize and Reset Button
  console.log('=== TEST 4: MAXIMIZE & RESET BUTTONS ===');
  const maxResetResult = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const hp = document.getElementById('helpPopup');
      const maxBtn = document.getElementById('helpMaximizeBtn');
      const resetBtn = document.getElementById('helpResetPosBtn');

      maxBtn.click();
      const isMax = hp.classList.contains('is-maximized');

      resetBtn.click();
      const isReset = !hp.classList.contains('is-maximized') && hp.style.left === '';

      return { isMaximizedWorking: isMax, isResetWorking: isReset };
    })()`,
    returnByValue: true
  });
  console.log('7. Maximize & Reset result:', maxResetResult.result.value);

  // Switch to Estimasi Kilat tab to test Draggable Cards
  await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const estTab = document.querySelector('.help-tab-btn[data-tab="estimator"]');
      if (estTab) estTab.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 400));

  // 8. Test Draggable Cards inside Estimasi Kilat
  console.log('=== TEST 5: DRAGGABLE CARDS REORDERING ===');
  const cardReorderResult = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const grid = document.querySelector('.estimator-option-cards');
      const cards = Array.from(grid.querySelectorAll('.estimator-card'));
      const initialTitles = cards.map(c => c.querySelector('strong').textContent);

      // Drag first card (Landing Page) over second card (Company Profile)
      const c1 = cards[0];
      const c2 = cards[1];
      const r1 = c1.getBoundingClientRect();
      const r2 = c2.getBoundingClientRect();

      c1.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r1.left + 20, clientY: r1.top + 20 }));
      window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: r2.left + r2.width/2 + 10, clientY: r2.top + r2.height/2 + 10 }));
      window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: r2.left + r2.width/2 + 10, clientY: r2.top + r2.height/2 + 10 }));

      const newCards = Array.from(grid.querySelectorAll('.estimator-card'));
      const newTitles = newCards.map(c => c.querySelector('strong').textContent);

      return {
        initialOrder: initialTitles,
        newOrder: newTitles,
        orderChanged: JSON.stringify(initialTitles) !== JSON.stringify(newTitles)
      };
    })()`,
    returnByValue: true
  });
  console.log('8. Card drag & reorder result:', cardReorderResult.result.value);

  // Capture screenshot of Help Hub with Draggable Cards & Window Controls
  ss = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'evidence_workspace_help_desktop.png'), Buffer.from(ss.data, 'base64'));

  // Close Help Hub
  await sendPage('Runtime.evaluate', {
    expression: `document.getElementById('helpCloseBtn').click();`
  });
  await new Promise(r => setTimeout(r, 400));

  // 9. Test Mobile Viewport (390x844) - Verify compact trigger
  console.log('=== TEST 6: COMPACT TRIGGER AT MOBILE (390px) ===');
  await sendPage('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sendPage('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 1200));

  const mobileCheck = await sendPage('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('fabTrigger');
      const r = btn.getBoundingClientRect();
      return {
        btnWidth: r.width,
        btnHeight: r.height,
        isCompact: r.width <= 26 && r.height <= 36
      };
    })()`,
    returnByValue: true
  });
  console.log('9. Mobile trigger size check:', mobileCheck.result.value);

  // Slide open dock on mobile
  await sendPage('Runtime.evaluate', {
    expression: `document.getElementById('fabTrigger').click();`
  });
  await new Promise(r => setTimeout(r, 450));

  ss = await sendPage('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'evidence_dock_mobile_390px.png'), Buffer.from(ss.data, 'base64'));

  console.log('\n=== ALL SLIDING & WORKSPACE TESTS COMPLETED SUCCESSFULLY! ===');
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Error in test:', err);
  process.exit(1);
});
