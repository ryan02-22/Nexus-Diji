const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const chrome = spawn(chromePath, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--window-size=390,844',
    'about:blank'
  ]);

  // Wait 1.5s for Chrome to start
  await new Promise(r => setTimeout(r, 1500));

  // Get websocket debugger URL
  http.get('http://127.0.0.1:9222/json/version', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      try {
        const info = JSON.parse(data);
        console.log('Chrome CDP ready:', info.webSocketDebuggerUrl);
        chrome.kill();
      } catch (e) {
        console.error(e);
        chrome.kill();
      }
    });
  }).on('error', (err) => {
    console.error('HTTP error:', err);
    chrome.kill();
  });
}

run();
