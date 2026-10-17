import fs from 'fs';
import { TRANSLATIONS } from '../assets/js/translations.js';

const html = fs.readFileSync('index.html', 'utf8');

// Strip script, style, svg
const clean = html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<svg[\s\S]*?<\/svg>/gi, '');

// Extract every text chunk between tags: > text <
const tokens = clean.split(/>([^<]+)</g)
  .filter((_, idx) => idx % 2 === 1)
  .map(t => {
    return t
      .replace(/&amp;/g, '&')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&copy;/g, '©')
      .replace(/\s+/g, ' ')
      .trim();
  })
  .filter(t => t.length > 1 && !/^[\d\s.,\-\/+:()•*#%|–—"']+$/.test(t) && !t.startsWith('http') && !t.includes('@'));

const missed = [];
for (const t of tokens) {
  if (!TRANSLATIONS[t]) {
    missed.push(t);
  }
}

const uniqueMissed = [...new Set(missed)];
console.log('Unique missed text nodes in index.html:', uniqueMissed.length);
uniqueMissed.forEach(m => console.log('MISSING:', JSON.stringify(m)));
