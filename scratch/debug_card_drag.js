const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const list = JSON.parse(data);
    const target = list.find(t => t.url && (t.url.includes('8088') || t.url.includes('index.html'))) || list[0];
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: 'Network.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Network.setCacheDisabled', params: { cacheDisabled: true } }));
      ws.send(JSON.stringify({ id: 3, method: 'Emulation.setDeviceMetricsOverride', params: { width: 1267, height: 707, deviceScaleFactor: 1, mobile: false } }));
      setTimeout(() => {
        ws.send(JSON.stringify({ id: 4, method: 'Page.reload', params: { ignoreCache: true } }));
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 5,
            method: 'Runtime.evaluate',
            params: {
              expression: `(() => {
                // Open Help Hub
                const overlayHelpBtn = document.getElementById('overlayHelpBtn');
                if (overlayHelpBtn) overlayHelpBtn.click();
                const estTab = document.querySelector('.help-tab-btn[data-tab="estimator"]');
                if (estTab) estTab.click();

                const grid = document.querySelector('.estimator-option-cards');
                const cards = Array.from(grid.querySelectorAll('.estimator-card'));
                const initialTitles = cards.map(c => c.querySelector('strong').textContent);

                const c1 = cards[0];
                const c2 = cards[1];
                const r1 = { left: c1.offsetLeft, top: c1.offsetTop, width: c1.offsetWidth, height: c1.offsetHeight, bc: c1.getBoundingClientRect() };
                const r2 = { left: c2.offsetLeft, top: c2.offsetTop, width: c2.offsetWidth, height: c2.offsetHeight, bc: c2.getBoundingClientRect() };

                // Dispatch pointerdown, pointermove, pointerup
                c1.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r1.bc.left + 20, clientY: r1.bc.top + 20 }));
                window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: r2.bc.left + r2.bc.width/2 + 10, clientY: r2.bc.top + r2.bc.height/2 + 10 }));
                window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: r2.bc.left + r2.bc.width/2 + 10, clientY: r2.bc.top + r2.bc.height/2 + 10 }));

                const newCards = Array.from(grid.querySelectorAll('.estimator-card'));
                const newTitles = newCards.map(c => c.querySelector('strong').textContent);

                return {
                  initialTitles,
                  newTitles,
                  debugLog: window.__debug || [],
                  orderChanged: JSON.stringify(initialTitles) !== JSON.stringify(newTitles)
                };
              })()`,
              returnByValue: true
            }
          }));
        }, 1200);
      }, 300);
    };
    ws.onmessage = (evt) => {
      const resp = JSON.parse(evt.data);
      if (resp.id === 5) {
        console.log('Card Drag Test Result:', JSON.stringify(resp.result.result.value, null, 2));
        process.exit(0);
      }
    };
  });
});
