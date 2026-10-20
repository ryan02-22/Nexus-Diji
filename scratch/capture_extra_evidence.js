const http = require('http');
const fs = require('fs');
const path = require('path');
const artifactDir = 'C:\\Users\\Pongo\\.gemini\\antigravity-ide\\brain\\513f7fc2-b4fa-424c-ae7c-36fb8443509f';

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const list = JSON.parse(data);
    const target = list.find(t => t.url && (t.url.includes('8088') || t.url.includes('index.html'))) || list[0];
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = Math.floor(Math.random() * 1000000);
        const handler = (evt) => {
          const resp = JSON.parse(evt.data);
          if (resp.id === id) {
            ws.removeEventListener('message', handler);
            resolve(resp.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    ws.onopen = async () => {
      await send('Emulation.setDeviceMetricsOverride', { width: 1267, height: 707, deviceScaleFactor: 1, mobile: false });
      await send('Page.reload', { ignoreCache: true });
      await new Promise(r => setTimeout(r, 1200));

      // Open Help Hub and click maximize
      await send('Runtime.evaluate', { expression: `document.getElementById('overlayHelpBtn').click();` });
      await new Promise(r => setTimeout(r, 300));
      await send('Runtime.evaluate', { expression: `document.getElementById('helpMaximizeBtn').click();` });
      await new Promise(r => setTimeout(r, 400));

      let ss = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(artifactDir, 'evidence_help_maximized.png'), Buffer.from(ss.data, 'base64'));

      // Restore and switch to Chatbot
      await send('Runtime.evaluate', { expression: `document.getElementById('helpMaximizeBtn').click();` });
      await new Promise(r => setTimeout(r, 200));
      await send('Runtime.evaluate', { expression: `document.getElementById('helpCloseBtn').click();` });
      await new Promise(r => setTimeout(r, 200));

      // Open Chatbot and position it cleanly
      await send('Runtime.evaluate', { expression: `document.getElementById('overlayChatBtn').click();` });
      await new Promise(r => setTimeout(r, 400));
      await send('Runtime.evaluate', {
        expression: `(() => {
          const cp = document.getElementById('chatPopup');
          cp.style.left = '320px';
          cp.style.top = '40px';
          cp.style.width = '420px';
        })()`
      });
      await new Promise(r => setTimeout(r, 400));

      ss = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(artifactDir, 'evidence_chat_workspace_desktop.png'), Buffer.from(ss.data, 'base64'));

      console.log('Extra evidence captures saved successfully!');
      process.exit(0);
    };
  });
});
