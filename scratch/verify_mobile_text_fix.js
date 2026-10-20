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
  console.log('--- Starting Reality-Check Verification of Mobile Text Overlap Fix ---');
  const port = 9288;
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
  await sendPage('CSS.enable');

  // Helper to capture screenshot of element
  async function captureElement(selector, filename) {
    const res = await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector('${selector}');
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      })()`,
      returnByValue: true
    });
    const clip = res.result.value;
    if (!clip || clip.width <= 0) return null;

    const screenRes = await sendPage('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: Math.max(0, clip.x - 4),
        y: Math.max(0, clip.y - 4),
        width: clip.width + 8,
        height: clip.height + 8,
        scale: 1
      }
    });
    const buf = Buffer.from(screenRes.data, 'base64');
    const outPath = path.join(artifactsDir, filename);
    fs.writeFileSync(outPath, buf);
    console.log(`Saved screenshot: ${outPath} (${buf.length} bytes)`);
    return outPath;
  }

  async function testViewport(width, height) {
    console.log(`\n========================================`);
    console.log(`Testing Viewport: ${width}x${height}`);
    console.log(`========================================`);

    await sendPage('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sendPage('Page.reload');
    await new Promise(r => setTimeout(r, 1200));

    // 1. TEST CHAT POPUP
    console.log('\n--- Evaluating #chatPopup Header ---');
    await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const chatPopup = document.getElementById('chatPopup');
        chatPopup.classList.add('open');
        chatPopup.style.display = 'flex';
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    const chatHeaderMetrics = await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const header = document.querySelector('.nexus-chat-popup .chat-header');
        const botName = document.querySelector('.chat-bot-name');
        const pill = document.querySelector('.chat-tag-pill');
        const subtitle = document.querySelector('.chat-subtitle');
        const ctrls = document.querySelector('.chat-header-ctrls');
        const resetBtn = document.getElementById('chatResetPosBtn');
        const maxBtn = document.getElementById('chatMaximizeBtn');
        const closeBtn = document.getElementById('chatCloseBtn');

        const rectHeader = header.getBoundingClientRect();
        const rectName = botName.getBoundingClientRect();
        const rectPill = pill.getBoundingClientRect();
        const rectSub = subtitle.getBoundingClientRect();
        const rectCtrls = ctrls.getBoundingClientRect();
        const rectClose = closeBtn.getBoundingClientRect();

        const isResetHidden = window.getComputedStyle(resetBtn).display === 'none';
        const isMaxHidden = window.getComputedStyle(maxBtn).display === 'none';

        // Check horizontal overlap between text elements and control buttons
        const pillRight = rectPill.right;
        const ctrlsLeft = rectCtrls.left;
        const subRight = rectSub.right;

        return {
          headerWidth: rectHeader.width,
          name: { text: botName.textContent.trim(), right: rectName.right },
          pill: { text: pill.textContent.trim(), left: rectPill.left, right: rectPill.right },
          subtitle: { text: subtitle.innerText.trim(), right: rectSub.right },
          ctrls: { left: rectCtrls.left, width: rectCtrls.width },
          gapPillToCtrls: ctrlsLeft - pillRight,
          gapSubToCtrls: ctrlsLeft - subRight,
          isResetHidden,
          isMaxHidden,
          hasPillOverlap: pillRight > ctrlsLeft,
          hasSubOverlap: subRight > ctrlsLeft
        };
      })()`,
      returnByValue: true
    });

    console.log('Chat Header Metrics:', JSON.stringify(chatHeaderMetrics.result.value, null, 2));
    await captureElement('.nexus-chat-popup .chat-header', `qa_chat_header_${width}px.png`);

    // 2. TEST HELP POPUP
    console.log('\n--- Evaluating #helpPopup Header ---');
    await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const chatPopup = document.getElementById('chatPopup');
        chatPopup.classList.remove('open');
        chatPopup.style.display = 'none';

        const helpPopup = document.getElementById('helpPopup');
        helpPopup.classList.add('open');
        helpPopup.style.display = 'flex';
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    const helpHeaderMetrics = await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const header = document.querySelector('.nexus-help-popup .help-header');
        const title = document.querySelector('.help-title-text');
        const pill = document.querySelector('.help-tag-pill');
        const subtitle = document.querySelector('.help-subtitle');
        const ctrlGroup = document.querySelector('.nexus-help-popup .window-ctrl-group');
        const resetBtn = document.getElementById('helpResetPosBtn');
        const maxBtn = document.getElementById('helpMaximizeBtn');
        const closeBtn = document.getElementById('helpCloseBtn');

        const rectHeader = header.getBoundingClientRect();
        const rectTitle = title.getBoundingClientRect();
        const rectPill = pill.getBoundingClientRect();
        const rectSub = subtitle.getBoundingClientRect();
        const rectGroup = ctrlGroup.getBoundingClientRect();
        const rectClose = closeBtn.getBoundingClientRect();

        const isResetHidden = window.getComputedStyle(resetBtn).display === 'none';
        const isMaxHidden = window.getComputedStyle(maxBtn).display === 'none';

        const pillRight = rectPill.right;
        const groupLeft = rectGroup.left;
        const subRight = rectSub.right;

        return {
          headerWidth: rectHeader.width,
          title: { text: title.textContent.trim(), right: rectTitle.right },
          pill: { text: pill.textContent.trim(), left: rectPill.left, right: rectPill.right },
          subtitle: { text: subtitle.innerText.trim(), right: rectSub.right },
          ctrlGroup: { left: rectGroup.left, width: rectGroup.width },
          gapPillToCtrlGroup: groupLeft - pillRight,
          gapSubToCtrlGroup: groupLeft - subRight,
          isResetHidden,
          isMaxHidden,
          hasPillOverlap: pillRight > groupLeft,
          hasSubOverlap: subRight > groupLeft
        };
      })()`,
      returnByValue: true
    });

    console.log('Help Header Metrics:', JSON.stringify(helpHeaderMetrics.result.value, null, 2));
    await captureElement('.nexus-help-popup .help-header', `qa_help_header_${width}px.png`);
  }

  try {
    await testViewport(360, 800);
    await testViewport(320, 650);
    await testViewport(390, 844);
    await testViewport(1280, 800);
  } finally {
    try { browserWs.close(); } catch (_) {}
    try { chrome.kill(); } catch (_) {}
  }

  console.log('\n--- Verification Completed Successfully ---');
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
