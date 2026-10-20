const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const list = JSON.parse(data);
    const target = list.find(t => t.url && (t.url.includes('8088') || t.url.includes('index.html'))) || list[0];
    if (!target) {
      console.log('No Chrome target found');
      return;
    }
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Emulation.setDeviceMetricsOverride',
        params: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }
      }));
      setTimeout(() => {
        ws.send(JSON.stringify({
          id: 2,
          method: 'Runtime.evaluate',
          params: {
            expression: `(() => {
              const b = document.getElementById('fabTrigger');
              if (!b) return { error: 'not found' };
              const cs = window.getComputedStyle(b);
              const rect = b.getBoundingClientRect();
              return {
                width: cs.width,
                height: cs.height,
                rectW: rect.width,
                rectH: rect.height,
                winW: window.innerWidth,
                winH: window.innerHeight,
                rules: Array.from(document.styleSheets).flatMap(s => {
                  try {
                    return Array.from(s.cssRules || []).filter(r => r.selectorText && r.selectorText.includes('fab-trigger')).map(r => ({
                      media: r.parentRule ? r.parentRule.media ? r.parentRule.media.mediaText : '' : '',
                      css: r.cssText
                    }));
                  } catch (_) { return []; }
                })
              };
            })()`,
            returnByValue: true
          }
        }));
      }, 500);
    };
    ws.onmessage = (evt) => {
      const resp = JSON.parse(evt.data);
      if (resp.id === 2) {
        console.log('Inspection result:', JSON.stringify(resp.result.result.value, null, 2));
        process.exit(0);
      }
    };
  });
});
