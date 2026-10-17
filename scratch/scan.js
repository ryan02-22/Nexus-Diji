const fs = require('fs');

const transContent = fs.readFileSync('assets/js/translations.js', 'utf8');
const transMatches = [...transContent.matchAll(/"([^"]+)":\s*"/g)].map(m => m[1]);
const transSet = new Set(transMatches);

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
  'HDMI', 'USB', 'BIOS', 'UEFI', 'NVMe', 'SATA', 'DDR4', 'DDR5'
]);

const allMissing = {};

for (const p of pages) {
  const content = fs.readFileSync(p, 'utf8');
  const textTokens = content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .split(/>([^<]+)</g)
    .filter((_, idx) => idx % 2 === 1)
    .map(t => t.trim())
    .filter(t => t.length > 2 && !/^[\d\s.,\-\/+:()]+$/.test(t) && !t.startsWith('http') && !t.includes('@'));

  const unmapped = [...new Set(textTokens.filter(t => !transSet.has(t) && !ignored.has(t)))];
  console.log(`${p}: ${unmapped.length} unmapped`);
  if (unmapped.length > 0) {
    allMissing[p] = unmapped;
  }
}

fs.writeFileSync('scratch/missing.json', JSON.stringify(allMissing, null, 2), 'utf8');
console.log('Saved all missing strings to scratch/missing.json');
