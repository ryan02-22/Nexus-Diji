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
      ws.send(JSON.stringify({ id: 3, method: 'Emulation.setDeviceMetricsOverride', params: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true } }));
      setTimeout(() => {
        ws.send(JSON.stringify({ id: 4, method: 'Page.reload', params: { ignoreCache: true } }));
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 5,
            method: 'Runtime.evaluate',
            params: {
              expression: `(() => {
                const b = document.getElementById('fabTrigger');
                const cs = window.getComputedStyle(b);
                const r = b.getBoundingClientRect();
                const matchedRules = [];
                for (const sheet of document.styleSheets) {
                  try {
                    for (const rule of sheet.cssRules || []) {
                      if (rule.selectorText && (rule.selectorText.includes('fab-trigger') || rule.selectorText.includes('fabTrigger'))) {
                        matchedRules.push({ media: rule.parentRule ? rule.parentRule.media.mediaText : '', text: rule.cssText });
                      } else if (rule.cssRules) {
                        for (const sub of rule.cssRules) {
                          if (sub.selectorText && (sub.selectorText.includes('fab-trigger') || sub.selectorText.includes('fabTrigger'))) {
                            matchedRules.push({ media: rule.media ? rule.media.mediaText : '', text: sub.cssText });
                          }
                        }
                      }
                    }
                  } catch (_) {}
                }
                return {
                  w: r.width,
                  h: r.height,
                  csH: cs.height,
                  csW: cs.width,
                  matchedRules
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
        console.log('Reloaded Mobile Rect & Computed:', resp.result.result.value);
        process.exit(0);
      }
    };
  });
});
