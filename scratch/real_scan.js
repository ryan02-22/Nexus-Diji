const fs = require('fs');
const path = require('path');

// Read translations.js and extract the object
const fileContent = fs.readFileSync('assets/js/translations.js', 'utf8');

// Use a regex that extracts both 'key' and "key"
const keyRegex = /^\s*['"](.+?)['"]\s*:/gm;
const keys = new Set();
let match;
while ((match = keyRegex.exec(fileContent)) !== null) {
  // unescape if needed
  const k = match[1].replace(/\\'/g, "'").replace(/\\"/g, '"');
  keys.add(k);
}

console.log('Total keys loaded from translations.js:', keys.size);

const pages = [
  'index.html',
  'pages/layanan.html',
  'pages/portfolio.html',
  'pages/harga.html',
  'pages/blog.html',
  'pages/tentang-kami.html',
  'pages/kontak.html',
  'pages/tim-kami.html',
  'pages/privacy.html',
  'pages/blog-1.html',
  'pages/blog-2.html',
  'pages/blog-3.html'
];

const ignored = new Set([
  'Nexus Diji', 'Faryta Studio', 'WhatsApp', 'Instagram', 'LinkedIn', 'TikTok',
  'CSS3', 'HTML5', 'Next.js', 'React', 'Vue.js', 'Node.js', 'Python', 'Tailwind CSS',
  'Figma', 'Flutter', 'Express', 'FastAPI', 'PostgreSQL', 'MySQL', 'MongoDB', 'Docker',
  'AWS', 'Linux', 'Vercel', 'Netlify', 'GitHub', 'GitLab', 'JavaScript', 'TypeScript',
  'WordPress', 'Shopify', 'Laravel', 'PHP', 'Supabase', 'Firebase', 'GraphQL',
  'REST API', 'UI/UX', 'SEO', 'PWA', 'JAMstack', 'Bcrypt', 'JWT', 'OAuth',
  'Android', 'iOS', 'Windows', 'macOS', 'Ubuntu', 'Debian', 'CentOS',
  'ND', 'ID', 'EN', 'PT', 'CV', 'CEO', 'CTO', 'COO', 'CFO', 'CMO', 'UI', 'UX',
  'Rp', 'IDR', 'USD', 'PDF', 'PNG', 'JPG', 'JPEG', 'SVG', 'WebP', 'GIF',
  'API', 'SDK', 'SSD', 'RAM', 'HDD', 'CPU', 'GPU', 'PSU', 'LAN', 'WLAN', 'WiFi',
  'HDMI', 'USB', 'BIOS', 'UEFI', 'NVMe', 'SATA', 'DDR4', 'DDR5',
  'Ryan', 'Fajar', 'Arya', 'Taufiq', 'Ahmad', 'John Doe',
  'ryan02-22', '02', '22', '2026', '2025', '2024',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '100%', '24/7', '4.9/5', '100+', '50+', '10+'
]);

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&copy;/g, '©')
    .replace(/&times;/g, '×')
    .replace(/&bull;/g, '•')
    .replace(/&nbsp;/g, ' ');
}

const missingPerPage = {};
let grandTotal = 0;

for (const p of pages) {
  const html = fs.readFileSync(p, 'utf8');
  // Strip head, scripts, styles, svg
  const bodyMatch = html.match(/<body[\s\S]*<\/body>/i);
  const content = bodyMatch ? bodyMatch[0] : html;

  const textTokens = content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .split(/>([^<]+)</g)
    .filter((_, idx) => idx % 2 === 1)
    .map(t => decodeEntities(t).replace(/\s+/g, ' ').trim())
    .filter(t => t.length > 0 && !/^[\d\s.,\-\/+:()•*#%|–—"']+$/.test(t) && !t.startsWith('http') && !t.includes('@'));

  const unmapped = [];
  for (const t of textTokens) {
    if (!keys.has(t) && !ignored.has(t)) {
      unmapped.push(t);
    }
  }

  const unique = [...new Set(unmapped)];
  if (unique.length > 0) {
    missingPerPage[p] = unique;
    grandTotal += unique.length;
    console.log(`[!] ${p}: ${unique.length} unmapped strings`);
  } else {
    console.log(`[OK] ${p}: 100% COVERED`);
  }
}

fs.writeFileSync('scratch/real_missing.json', JSON.stringify(missingPerPage, null, 2), 'utf8');
console.log(`\nScan finished. Total unmapped strings across all pages: ${grandTotal}`);
