/**
 * Nexus Diji - AI Assistant Chatbot Engine (v2.0)
 * Mascot: robot-nd.webp
 * Features:
 *  - Rich structured knowledge base (Web, App, PC/Laptop Repair, Pricing, Portfolio, Contact)
 *  - Bilingual support (Indonesian & English) synced with active language
 *  - Intelligent intent matcher for free-text inquiries
 *  - Animated typing wave indicator and smooth micro-interactions
 *  - Responsive bottom-sheet / floating drawer design
 */

const WA_NUMBER = '6285711171508';

function getMascotPath() {
  if (typeof window === 'undefined') return './assets/images/robot-nd.webp';
  const isSubpage = window.location.pathname.includes('/pages/') ||
    (document.querySelector('base') && document.querySelector('base').href.includes('/pages/'));
  return isSubpage ? '../assets/images/robot-nd.webp' : './assets/images/robot-nd.webp';
}

function getPortfolioLink() {
  if (typeof window === 'undefined') return './pages/portfolio.html';
  const isSubpage = window.location.pathname.includes('/pages/');
  return isSubpage ? './portfolio.html' : './pages/portfolio.html';
}

/* ═══════════════════════════════════════════════════════════════
   KNOWLEDGE BASE DICTIONARY (BILINGUAL ID & EN)
   ═══════════════════════════════════════════════════════════════ */
const KNOWLEDGE = {
  id: {
    welcome: {
      text: `Halo! 👋 Saya <strong>Nexus AI Assistant</strong>, asisten cerdas dari <strong>Nexus Diji</strong>.<br><br>
Ada yang bisa saya bantu wujudkan hari ini? Kami siap membantu solusi digital &amp; teknologi Anda:
<ul class="chat-feature-list">
  <li>🌐 <strong>Jasa Pembuatan Website</strong> (Landing Page, Company Profile, Toko Online)</li>
  <li>📱 <strong>Aplikasi Custom</strong> (Mobile App Android/iOS, Web App, Kasir/POS)</li>
  <li>💻 <strong>Servis PC &amp; Laptop</strong> (Upgrade SSD/RAM, Overheat, Instalasi OS)</li>
  <li>💰 <strong>Paket Harga &amp; Promo Spesial</strong> (Mulai Rp 499.000)</li>
</ul>
Pilih opsi cepat di bawah atau ketik langsung pertanyaan Anda! 👇`,
      chips: [
        { id: "website", label: "🌐 Pembuatan Website", query: "Bisa jelaskan layanan pembuatan website di Nexus Diji?" },
        { id: "aplikasi", label: "📱 Aplikasi Custom", query: "Saya butuh info tentang pembuatan aplikasi custom." },
        { id: "servis", label: "💻 Servis Laptop & PC", query: "Laptop/PC saya bermasalah, apa saja layanan servisnya?" },
        { id: "harga", label: "💰 Paket Harga & Promo", query: "Berapa estimasi harga layanan dan promo saat ini?" },
        { id: "portfolio", label: "⭐ Portofolio Proyek", query: "Bisa lihat contoh portofolio proyek Nexus Diji?" },
        { id: "kontak", label: "💬 Chat via WhatsApp", query: "Halo Nexus Diji, saya ingin konsultasi langsung via WhatsApp." }
      ]
    },
    topics: {
      website: {
        text: `<strong>🌐 Layanan Pembuatan Website Profesional Nexus Diji:</strong><br><br>
Kami merancang website modern yang cepat, elegan, dan berorientasi pada peningkatan penjualan:
<div class="chat-info-card">
  <div class="card-item"><strong>1. Landing Page Kilat (3–5 Hari)</strong><br>
  Fokus konversi iklan &amp; promosi produk, copywriting persuasif, formulir WhatsApp/leads langsung.</div>
  <div class="card-item"><strong>2. Company Profile Korporat</strong><br>
  Meningkatkan kredibilitas &amp; branding bisnis, multi-halaman, integrasi maps, SEO Google.</div>
  <div class="card-item"><strong>3. Toko Online / E-Commerce</strong><br>
  Katalog produk, payment gateway otomatis (QRIS, VA, E-Wallet), hitung ongkir otomatis.</div>
  <div class="card-item"><strong>4. Web App &amp; Portal Custom</strong><br>
  Dashboard admin, backend database, sistem membership/pelanggan.</div>
</div>
⚡ <strong>Keunggulan:</strong> Loading di bawah 2 detik (Core Web Vitals A+), responsive di semua layar, gratis domain &amp; hosting tahun pertama!`,
        followUps: [
          { id: "harga", label: "💰 Cek Harga Website", query: "Berapa harga pembuatan website?" },
          { id: "wa_website", label: "💬 Konsultasi Website via WA", isWA: true, msg: "Halo Nexus Diji, saya ingin konsultasi pembuatan website untuk bisnis saya." },
          { id: "menu", label: "↩️ Menu Utama", isReset: true }
        ]
      },
      aplikasi: {
        text: `<strong>📱 Pengembangan Aplikasi Custom &amp; Mobile:</strong><br><br>
Solusi aplikasi khusus yang disesuaikan dengan alur operasional bisnis Anda:
<div class="chat-info-card">
  <div class="card-item">🚀 <strong>Mobile Apps (Android &amp; iOS)</strong><br>
  Dibangun dengan Flutter / React Native: 1 kode untuk 2 platform, hemat biaya dan performa native tinggi.</div>
  <div class="card-item">📊 <strong>Aplikasi Kasir (POS) &amp; Inventaris</strong><br>
  Pencatatan transaksi, cetak struk bluetooth, kontrol stok barang, laporan laba rugi otomatis.</div>
  <div class="card-item">🏢 <strong>Sistem ERP &amp; CRM Internal</strong><br>
  Manajemen karyawan, absensi, approval bertingkat, analitik penjualan real-time.</div>
</div>
🔒 Dilengkapi keamanan enkripsi data, cloud database, serta garansi pemeliharaan &amp; bug-fixing.`,
        followUps: [
          { id: "wa_app", label: "💬 Diskusikan Kebutuhan Aplikasi via WA", isWA: true, msg: "Halo Nexus Diji, saya ingin mendiskusikan pembuatan aplikasi custom/mobile." },
          { id: "harga", label: "💰 Estimasi Biaya", query: "Berapa estimasi biaya aplikasi?" },
          { id: "menu", label: "↩️ Menu Utama", isReset: true }
        ]
      },
      servis: {
        text: `<strong>💻 Servis, Maintenance &amp; Perbaikan PC / Laptop:</strong><br><br>
Perangkat lambat, rusak, atau overheat? Tim teknisi profesional kami siap menangani:
<div class="chat-info-card">
  <div class="card-item">⚡ <strong>Upgrade SSD &amp; RAM</strong><br>
  Bikin laptop/PC lama ngebut hingga 10x lipat! Booting hanya 5–10 detik, bebas lemot.</div>
  <div class="card-item">❄️ <strong>Deep Cleaning &amp; Ganti Thermal Paste</strong><br>
  Pembersihan debu kipas, ganti pasta termal premium (anti panas &amp; cegah mati mendadak).</div>
  <div class="card-item">💿 <strong>Instal Ulang OS &amp; Software Esensial</strong><br>
  Windows 10/11 &amp; Linux clean install, driver resmi, Office, antivirus tanpa bloatware.</div>
  <div class="card-item">🔧 <strong>Ganti Sparepart &amp; Hardware</strong><br>
  Ganti LCD pecah/flicker, baterai drop, keyboard macet, perbaikan engsel laptop patah.</div>
  <div class="card-item">🛡️ <strong>Recovery Data &amp; Pembersihan Virus</strong><br>
  Penyelamatan dokumen penting dari storage error/terhapus.</div>
</div>
💡 <strong>Konsultasi &amp; Pengecekan Awal 100% GRATIS!</strong> Biaya jasa mulai dari Rp 50.000 dengan garansi perbaikan.`,
        followUps: [
          { id: "wa_servis", label: "💬 Konsultasi Keluhan Laptop/PC via WA", isWA: true, msg: "Halo teknisi Nexus Diji, laptop/PC saya mengalami kendala dan ingin konsultasi servis." },
          { id: "harga", label: "💰 Biaya Servis", query: "Berapa kisaran biaya servis laptop?" },
          { id: "menu", label: "↩️ Menu Utama", isReset: true }
        ]
      },
      harga: {
        text: `<strong>💰 Paket Harga &amp; Promo Spesial Nexus Diji:</strong><br><br>
Kami menawarkan harga transparan tanpa biaya tersembunyi:
<div class="chat-info-card">
  <div class="card-item"><strong>🌐 Website Starter (Rp 499.000)</strong><br>
  Landing page 1 halaman, desain modern responsif, integrasi tombol WhatsApp, gratis domain .my.id &amp; hosting 1 tahun.</div>
  <div class="card-item"><strong>💼 Website Business Pro (Rp 999.000 - Rp 1.499.000)</strong><br>
  Company Profile lengkap (hingga 5 halaman), email bisnis (@namabisnis.com), domain .com, SEO Google, garansi maintenance 3 bulan.</div>
  <div class="card-item"><strong>🛍️ E-Commerce / Custom App (Mulai Rp 1.999.000)</strong><br>
  Katalog produk, otomatis hitung ongkir kurir, payment gateway (QRIS/VA), CMS admin mandiri.</div>
  <div class="card-item"><strong>💻 Servis PC &amp; Laptop (Mulai Rp 50.000)</strong><br>
  Pengecekan GRATIS! Jasa instalasi &amp; cleaning mulai Rp 50rb - Rp 150rb. Hardware sesuai tipe part.</div>
</div>
🎉 <strong>PROMO BULAN INI:</strong> Dapatkan diskon 20% untuk pembuatan website &amp; aplikasi custom!`,
        followUps: [
          { id: "wa_promo", label: "🎁 Klaim Diskon Promo 20% via WA", isWA: true, msg: "Halo Nexus Diji, saya ingin klaim diskon promo 20% untuk layanan digital." },
          { id: "website", label: "🌐 Rincian Fitur Website", query: "Jelaskan fitur website" },
          { id: "menu", label: "↩️ Menu Utama", isReset: true }
        ]
      },
      portfolio: {
        text: `<strong>⭐ Portofolio &amp; Rekam Jejak Nexus Diji:</strong><br><br>
Kami telah menyelesaikan lebih dari <strong>100+ proyek digital</strong> untuk UMKM, startup, dan personal brand dengan tingkat kepuasan <strong>99%</strong>.<br><br>
Beberapa kategori karya unggulan kami:
<ul class="chat-feature-list">
  <li>🛍️ <em>E-Commerce Fashion &amp; Retail</em> dengan sistem checkout kilat</li>
  <li>🏢 <em>Company Profile Korporat &amp; Firma Hukum</em> modern &amp; elegan</li>
  <li>🍽️ <em>Landing Page Resto &amp; F&amp;B</em> dengan menu digital interaktif</li>
  <li>🏥 <em>Sistem Informasi Reservasi Klinik &amp; Salon</em></li>
</ul>
Ingin melihat preview studi kasus atau demo langsung?`,
        followUps: [
          { id: "view_portfolio_page", label: "📂 Buka Halaman Portfolio", isLink: true, url: getPortfolioLink() },
          { id: "wa_porto", label: "💬 Minta Contoh Proyek Sejenis di WA", isWA: true, msg: "Halo Nexus Diji, bolehkah saya melihat contoh portofolio proyek yang mirip dengan rencana bisnis saya?" },
          { id: "menu", label: "↩️ Menu Utama", isReset: true }
        ]
      },
      kontak: {
        text: `<strong>💬 Hubungi Tim Nexus Diji Langsung:</strong><br><br>
Tim kami siap mendengarkan ide dan memberikan solusi terbaik untuk Anda:
<div class="chat-info-card">
  <div class="card-item">📞 <strong>WhatsApp Resmi:</strong> <a href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener" style="color:#10b981;font-weight:700;">+62 857-1117-1508</a></div>
  <div class="card-item">✉️ <strong>Email:</strong> support@nexus-diji.com</div>
  <div class="card-item">🕒 <strong>Jam Kerja:</strong> Senin – Sabtu (08.00 – 21.00 WIB)</div>
  <div class="card-item">📍 <strong>Layanan:</strong> Online seluruh Indonesia &amp; Onsite Servis Hardware</div>
</div>
Klik tombol di bawah untuk terhubung langsung ke WhatsApp kami! 👇`,
        followUps: [
          { id: "wa_direct", label: "💬 Buka WhatsApp Sekarang", isWA: true, msg: "Halo tim Nexus Diji, saya ingin konsultasi kebutuhan digital saya." },
          { id: "menu", label: "↩️ Menu Utama", isReset: true }
        ]
      }
    }
  },
  en: {
    welcome: {
      text: `Hello! 👋 I'm <strong>Nexus AI Assistant</strong>, your digital guide at <strong>Nexus Diji</strong>.<br><br>
How can we help your business today? We specialize in:
<ul class="chat-feature-list">
  <li>🌐 <strong>Custom Website Development</strong> (Landing Pages, Corporate Profiles, E-Commerce)</li>
  <li>📱 <strong>Custom Application Dev</strong> (Mobile Apps Android/iOS, Web Apps, POS)</li>
  <li>💻 <strong>Laptop &amp; PC Hardware/Software Service</strong> (Upgrades, Overheating, OS setup)</li>
  <li>💰 <strong>Transparent Pricing &amp; Active Promo</strong> (Starting from IDR 499K)</li>
</ul>
Choose a quick topic below or type your question! 👇`,
      chips: [
        { id: "website", label: "🌐 Website Services", query: "Could you tell me about your web development services?" },
        { id: "aplikasi", label: "📱 Custom Apps", query: "Tell me about your custom mobile and web application development." },
        { id: "servis", label: "💻 PC & Laptop Repair", query: "My PC/laptop needs servicing. What are your repair services?" },
        { id: "harga", label: "💰 Pricing & Discounts", query: "What are your package pricing and active offers?" },
        { id: "portfolio", label: "⭐ Portfolio & Projects", query: "Can I see some of Nexus Diji's past work and projects?" },
        { id: "kontak", label: "💬 Connect on WhatsApp", query: "Hello Nexus Diji, I would like to chat with your team on WhatsApp." }
      ]
    },
    topics: {
      website: {
        text: `<strong>🌐 Professional Web Development by Nexus Diji:</strong><br><br>
We build fast, secure, and conversion-focused websites:
<div class="chat-info-card">
  <div class="card-item"><strong>1. High-Converting Landing Pages (3–5 Days)</strong><br>Designed for ad campaigns, persuasive copywriting, and instant WhatsApp/lead capture.</div>
  <div class="card-item"><strong>2. Corporate Company Profiles</strong><br>Elevate credibility, multi-page layout, interactive maps, and Google SEO ready.</div>
  <div class="card-item"><strong>3. E-Commerce &amp; Online Stores</strong><br>Product catalog, automated payment gateways (QRIS, VA, Cards), and automated shipping calculation.</div>
  <div class="card-item"><strong>4. Custom Web Applications</strong><br>Admin dashboard, cloud database, secure user roles, and API integrations.</div>
</div>
⚡ <strong>Specs:</strong> Core Web Vitals A+ rating (under 2s load time), 100% responsive, free 1-year domain &amp; hosting!`,
        followUps: [
          { id: "harga", label: "💰 Check Web Pricing", query: "What are web pricing plans?" },
          { id: "wa_website", label: "💬 Consult Web via WhatsApp", isWA: true, msg: "Hello Nexus Diji, I want to discuss a website project for my business." },
          { id: "menu", label: "↩️ Main Menu", isReset: true }
        ]
      },
      aplikasi: {
        text: `<strong>📱 Custom Application &amp; Mobile Development:</strong><br><br>
Tailor-made software to streamline your operations:
<div class="chat-info-card">
  <div class="card-item">🚀 <strong>Mobile Apps (Android &amp; iOS)</strong><br>Built with Flutter / React Native: single codebase, cost-efficient, and smooth native performance.</div>
  <div class="card-item">📊 <strong>POS &amp; Inventory Systems</strong><br>Record transactions, thermal receipt printing, stock tracking, and automated P&amp;L reports.</div>
  <div class="card-item">🏢 <strong>Enterprise ERP &amp; CRM</strong><br>Employee management, attendance, multi-level approvals, and real-time sales analytics.</div>
</div>
🔒 End-to-end data encryption, cloud backup, and post-launch maintenance warranty.`,
        followUps: [
          { id: "wa_app", label: "💬 Discuss Custom App on WA", isWA: true, msg: "Hello Nexus Diji, I would like to discuss building a custom application." },
          { id: "harga", label: "💰 Cost Estimate", query: "How much does custom app development cost?" },
          { id: "menu", label: "↩️ Main Menu", isReset: true }
        ]
      },
      servis: {
        text: `<strong>💻 PC &amp; Laptop Hardware / Software Repair:</strong><br><br>
Slow device, damaged hardware, or overheating issues? Our technicians can fix it:
<div class="chat-info-card">
  <div class="card-item">⚡ <strong>SSD &amp; RAM Upgrades</strong><br>Boost performance up to 10x! 5-second boot time, zero lag.</div>
  <div class="card-item">❄️ <strong>Deep Cleaning &amp; Thermal Paste</strong><br>Fan dust removal, premium thermal paste replacement (prevents shutdown and throttling).</div>
  <div class="card-item">💿 <strong>Clean OS &amp; Software Setup</strong><br>Windows 10/11 &amp; Linux clean installation, official drivers, essential software without bloatware.</div>
  <div class="card-item">🔧 <strong>Hardware Replacement</strong><br>Cracked LCD, depleted battery, stuck keyboard, broken laptop hinge repair.</div>
  <div class="card-item">🛡️ <strong>Data Recovery &amp; Virus Cleanup</strong><br>Rescue critical files from failing storage drives and remove harmful malware.</div>
</div>
💡 <strong>Initial diagnostics are 100% FREE!</strong> Service rates start from IDR 50,000 with warranty.`,
        followUps: [
          { id: "wa_servis", label: "💬 Chat Technician on WA", isWA: true, msg: "Hello Nexus Diji technician, my PC/laptop has an issue and I need repair consultation." },
          { id: "harga", label: "💰 Service Rates", query: "How much is laptop service?" },
          { id: "menu", label: "↩️ Main Menu", isReset: true }
        ]
      },
      harga: {
        text: `<strong>💰 Transparent Pricing &amp; Active Promo:</strong><br><br>
Clear, value-driven pricing without hidden fees:
<div class="chat-info-card">
  <div class="card-item"><strong>🌐 Starter Website (from IDR 499,000)</strong><br>1-page landing page, modern responsive layout, WhatsApp lead trigger, free domain &amp; 1-year hosting.</div>
  <div class="card-item"><strong>💼 Business Pro Website (IDR 999K - 1.49M)</strong><br>Full company profile (up to 5 pages), custom corporate email, .com domain, Google SEO, 3-month support.</div>
  <div class="card-item"><strong>🛍️ E-Commerce / Custom App (from IDR 1,999,000)</strong><br>Product catalog, automated payments (QRIS/VA), admin control panel.</div>
  <div class="card-item"><strong>💻 Hardware &amp; PC Service (from IDR 50,000)</strong><br>FREE diagnostic! Repair &amp; cleanup from IDR 50K - 150K. Parts based on hardware model.</div>
</div>
🎉 <strong>THIS MONTH'S PROMO:</strong> Enjoy 20% OFF for website and custom software development!`,
        followUps: [
          { id: "wa_promo", label: "🎁 Claim 20% Discount on WA", isWA: true, msg: "Hello Nexus Diji, I would like to claim the 20% discount offer for digital services." },
          { id: "website", label: "🌐 Web Features", query: "Tell me about website features" },
          { id: "menu", label: "↩️ Main Menu", isReset: true }
        ]
      },
      portfolio: {
        text: `<strong>⭐ Track Record &amp; Portfolio:</strong><br><br>
We have successfully delivered over <strong>100+ digital projects</strong> across retail, corporate, and individual businesses with a <strong>99% satisfaction rate</strong>.<br><br>
Featured project categories:
<ul class="chat-feature-list">
  <li>🛍️ <em>Fashion &amp; Retail E-Commerce</em> with instant mobile checkout</li>
  <li>🏢 <em>Corporate Profiles &amp; Law Firms</em> with sleek aesthetics</li>
  <li>🍽️ <em>F&amp;B &amp; Restaurant Landing Pages</em> with interactive online menus</li>
  <li>🏥 <em>Clinic &amp; Beauty Salon Appointment Systems</em></li>
</ul>
Would you like to explore live previews?`,
        followUps: [
          { id: "view_portfolio_page", label: "📂 View Full Portfolio Page", isLink: true, url: getPortfolioLink() },
          { id: "wa_porto", label: "💬 Request Similar Case Studies on WA", isWA: true, msg: "Hello Nexus Diji, can you share examples of projects similar to my business idea?" },
          { id: "menu", label: "↩️ Main Menu", isReset: true }
        ]
      },
      kontak: {
        text: `<strong>💬 Direct Contact Channels:</strong><br><br>
Connect with our experts right away:
<div class="chat-info-card">
  <div class="card-item">📞 <strong>Official WhatsApp:</strong> <a href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener" style="color:#10b981;font-weight:700;">+62 857-1117-1508</a></div>
  <div class="card-item">✉️ <strong>Email:</strong> support@nexus-diji.com</div>
  <div class="card-item">🕒 <strong>Hours:</strong> Mon – Sat (08:00 – 21:00 WIB)</div>
  <div class="card-item">📍 <strong>Service:</strong> Remote worldwide &amp; On-site hardware repair</div>
</div>
Click below to open WhatsApp directly! 👇`,
        followUps: [
          { id: "wa_direct", label: "💬 Open WhatsApp Chat", isWA: true, msg: "Hello Nexus Diji team, I want to discuss a service inquiry." },
          { id: "menu", label: "↩️ Main Menu", isReset: true }
        ]
      }
    }
  }
};

/* ═══════════════════════════════════════════════════════════════
   INTENT RESOLVER (NATURAL LANGUAGE MATCHING)
   ═══════════════════════════════════════════════════════════════ */
function resolveIntent(query) {
  if (!query) return null;
  const q = query.toLowerCase().trim();

  // Greetings
  if (/^(halo|hai|hi|hello|hey|selamat|assalam|pagi|siang|malam|woi|oi)\b/.test(q)) {
    return 'welcome';
  }
  // Website
  if (/web|landing|company profile|compro|toko online|ecommerce|e-commerce|bikin web|buat web|domain|hosting|seo|wordpress|react/.test(q)) {
    return 'website';
  }
  // Apps
  if (/aplikasi|app|mobile|android|ios|flutter|kasir|pos|erp|crm|software|program|database|sistem/.test(q)) {
    return 'aplikasi';
  }
  // Hardware / Service
  if (/servis|service|laptop|pc|komputer|lemot|panas|overheat|rusak|lcd|baterai|battery|keyboard|install|instal|ssd|ram|upgrade|thermal|pasta|virus|data|recovery/.test(q)) {
    return 'servis';
  }
  // Pricing / Promo
  if (/harga|biaya|tarif|cost|price|paket|promo|diskon|discount|murah|bayar|cicil|penawaran/.test(q)) {
    return 'harga';
  }
  // Portfolio
  if (/portfolio|portofolio|proyek|project|klien|client|contoh|hasil|karya|testimoni|review/.test(q)) {
    return 'portfolio';
  }
  // Contact
  if (/kontak|contact|wa|whatsapp|lokasi|alamat|jam|buka|tutup|telepon|call|admin|konsultasi|hubungi/.test(q)) {
    return 'kontak';
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN CHATBOT INITIALIZATION
   ═══════════════════════════════════════════════════════════════ */
export function initChatbot() {
  const mascotSrc = getMascotPath();

  // 1. Ensure DOM Elements exist (supports subpages seamlessly)
  ensureChatbotDOM(mascotSrc);

  const overlayChatBtn = document.getElementById('overlayChatBtn');
  const chatCloseBtn = document.getElementById('chatCloseBtn');
  const chatResetBtn = document.getElementById('chatResetBtn');
  const chatPopup = document.getElementById('chatPopup');
  const chatBody = document.getElementById('chatBody');
  const chatOptions = document.getElementById('chatOptions');
  const chatOptionsTray = document.getElementById('chatOptionsTray');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const chatForm = document.getElementById('chatForm');

  if (!chatPopup || !chatBody || !chatOptions) return;
  if (chatPopup.dataset.initialized === 'true') return;
  chatPopup.dataset.initialized = 'true';

  function getCurrentLang() {
    return (document.documentElement.lang && document.documentElement.lang.startsWith('en')) ? 'en' : 'id';
  }

  function getLangData() {
    const lang = getCurrentLang();
    return KNOWLEDGE[lang] || KNOWLEDGE.id;
  }

  // 2. Open / Close Controls
  function openChat() {
    const helpPopup = document.getElementById('helpPopup');
    if (helpPopup && helpPopup.classList.contains('open')) {
      helpPopup.classList.remove('open');
      setTimeout(() => { helpPopup.style.display = 'none'; }, 250);
    }

    chatPopup.style.display = 'flex';
    document.body.classList.add('chat-active');
    const bubble = document.getElementById('mascotSpeechBubble');
    if (bubble) bubble.style.opacity = '0';
    requestAnimationFrame(() => {
      chatPopup.classList.add('open');
      chatPopup.setAttribute('aria-hidden', 'false');
    });

    const scrollUp = document.getElementById('backToTop');
    if (scrollUp) scrollUp.classList.add('hidden-by-chat');

    // If chat is empty, initialize with welcome screen
    if (!chatBody.children.length) {
      renderWelcome();
    }

    if (window.innerWidth > 768 && chatInput) {
      setTimeout(() => chatInput.focus(), 320);
    }
  }

  function closeChat() {
    chatPopup.classList.remove('open');
    chatPopup.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('chat-active');
    const bubble = document.getElementById('mascotSpeechBubble');
    if (bubble) bubble.style.opacity = '';
    setTimeout(() => {
      chatPopup.style.display = 'none';
    }, 320);

    const scrollUp = document.getElementById('backToTop');
    if (scrollUp) scrollUp.classList.remove('hidden-by-chat');
  }

  // 3. Render Helpers
  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatBody.scrollTop = chatBody.scrollHeight;
    });
  }

  function scrollBotBubbleIntoView(botRow) {
    requestAnimationFrame(() => {
      const rowTop = botRow.offsetTop;
      chatBody.scrollTo({
        top: Math.max(0, rowTop - 16),
        behavior: 'smooth'
      });
    });
  }

  function addBotBubble(htmlContent, followUps = []) {
    const row = document.createElement('div');
    row.className = 'chat-row bot-row';

    const avatar = document.createElement('div');
    avatar.className = 'chat-bot-avatar';
    avatar.innerHTML = `<img src="${mascotSrc}" alt="AI Mascot" width="26" height="26">`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bot-bubble';
    bubble.innerHTML = htmlContent;

    // Append inline follow up actions if present
    if (followUps && followUps.length) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'chat-inline-actions';

      followUps.forEach(item => {
        if (item.isWA) {
          const a = document.createElement('a');
          a.className = 'chat-btn-wa';
          a.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(item.msg || 'Halo Nexus Diji')}`;
          a.target = '_blank';
          a.rel = 'noopener';
          a.innerHTML = `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> ${item.label}`;
          actionsDiv.appendChild(a);
        } else if (item.isLink) {
          const a = document.createElement('a');
          a.className = 'chat-btn-sub';
          a.href = item.url;
          a.innerHTML = item.label;
          actionsDiv.appendChild(a);
        } else if (item.isReset) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'chat-btn-sub';
          btn.innerHTML = item.label;
          btn.addEventListener('click', () => renderWelcome());
          actionsDiv.appendChild(btn);
        } else {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'chat-btn-sub';
          btn.innerHTML = item.label;
          btn.addEventListener('click', () => handleUserInput(item.query || item.label));
          actionsDiv.appendChild(btn);
        }
      });

      bubble.appendChild(actionsDiv);
    }

    row.appendChild(avatar);
    row.appendChild(bubble);
    chatBody.appendChild(row);
    scrollBotBubbleIntoView(row);
  }

  function addUserBubble(text) {
    const row = document.createElement('div');
    row.className = 'chat-row user-row';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user-bubble';
    bubble.textContent = text;

    row.appendChild(bubble);
    chatBody.appendChild(row);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const row = document.createElement('div');
    row.className = 'chat-row bot-row typing-row';
    row.id = 'chatTypingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'chat-bot-avatar';
    avatar.innerHTML = `<img src="${mascotSrc}" alt="AI Mascot" width="26" height="26">`;

    const bubble = document.createElement('div');
    bubble.className = 'typing-bubble';
    bubble.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    `;

    row.appendChild(avatar);
    row.appendChild(bubble);
    chatBody.appendChild(row);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const typing = document.getElementById('chatTypingIndicator');
    if (typing) typing.remove();
  }

  function renderChips(chipsList) {
    chatOptions.innerHTML = '';
    if (!chipsList || !chipsList.length) {
      if (chatOptionsTray) chatOptionsTray.style.display = 'none';
      return;
    }

    if (chatOptionsTray) chatOptionsTray.style.display = 'flex';

    chipsList.forEach(chip => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-opt-chip';
      btn.textContent = chip.label;
      btn.addEventListener('click', () => {
        handleUserSelectOption(chip);
      });
      chatOptions.appendChild(btn);
    });
  }

  function renderWelcome() {
    chatBody.innerHTML = '';
    const data = getLangData();
    addBotBubble(data.welcome.text);
    renderChips(data.welcome.chips);
  }

  // 4. Interaction Handlers
  function handleUserSelectOption(chip) {
    addUserBubble(chip.label);
    if (chatOptionsTray) chatOptionsTray.style.display = 'none';

    showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      const data = getLangData();
      const topicData = data.topics[chip.id];

      if (topicData) {
        addBotBubble(topicData.text, topicData.followUps);
        renderChips(topicData.followUps.filter(f => !f.isWA && !f.isLink));
      } else {
        // Fallback to WhatsApp connect
        const isEn = getCurrentLang() === 'en';
        const fallbackText = isEn
          ? `Thank you! I will directly connect you with our technical specialist on WhatsApp for <strong>${chip.label}</strong>:`
          : `Terima kasih! Saya langsung hubungkan Anda ke tim konsultan Nexus Diji via WhatsApp untuk topik <strong>${chip.label}</strong>:`;
        addBotBubble(fallbackText, [
          { id: 'wa_chip', label: isEn ? '💬 Open WhatsApp' : '💬 Hubungi WhatsApp', isWA: true, msg: chip.query || chip.label },
          { id: 'menu', label: isEn ? '↩️ Main Menu' : '↩️ Menu Utama', isReset: true }
        ]);
      }
    }, 450);
  }

  function handleUserInput(queryText) {
    const text = (queryText || (chatInput ? chatInput.value : '')).trim();
    if (!text) return;

    addUserBubble(text);
    if (chatInput) chatInput.value = '';
    if (chatOptionsTray) chatOptionsTray.style.display = 'none';

    showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      const intent = resolveIntent(text);
      const data = getLangData();
      const isEn = getCurrentLang() === 'en';

      if (intent === 'welcome') {
        renderWelcome();
        return;
      }

      if (intent && data.topics[intent]) {
        const topicData = data.topics[intent];
        addBotBubble(topicData.text, topicData.followUps);
        renderChips(topicData.followUps.filter(f => !f.isWA && !f.isLink));
      } else {
        // Smart conversational fallback with user's question forwarded to WhatsApp
        const fallbackHtml = isEn
          ? `Thank you for your question! 💡 Regarding <em>"${escapeHtml(text)}"</em>, our specialist team can provide the exact technical specs and custom estimate directly on WhatsApp.`
          : `Terima kasih atas pertanyaannya! 💡 Mengenai <em>"${escapeHtml(text)}"</em>, tim konsultan Nexus Diji siap memberikan detail spesifikasi teknis dan estimasi akurat langsung melalui WhatsApp.`;

        addBotBubble(fallbackHtml, [
          {
            id: 'wa_custom',
            label: isEn ? '💬 Discuss on WhatsApp' : '💬 Lanjutkan Diskusi via WhatsApp',
            isWA: true,
            msg: `Halo tim Nexus Diji, saya ingin bertanya: ${text}`
          },
          {
            id: 'menu',
            label: isEn ? '↩️ Back to Menu' : '↩️ Kembali ke Menu Utama',
            isReset: true
          }
        ]);
        renderChips(data.welcome.chips.slice(0, 4));
      }
    }, 450);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  // 5. Event Listeners
  if (overlayChatBtn) {
    overlayChatBtn.addEventListener('click', () => {
      chatPopup.classList.contains('open') ? closeChat() : openChat();
    });
  }

  const floatingChatBtn = document.getElementById('nexusFloatingChatBtn');
  if (floatingChatBtn) {
    floatingChatBtn.addEventListener('click', () => {
      chatPopup.classList.contains('open') ? closeChat() : openChat();
    });
  }

  if (chatCloseBtn) {
    chatCloseBtn.addEventListener('click', closeChat);
  }

  const chatSwitchToHelpBtn = document.getElementById('chatSwitchToHelpBtn');
  if (chatSwitchToHelpBtn) {
    chatSwitchToHelpBtn.addEventListener('click', () => {
      closeChat();
      setTimeout(openHelp, 150);
    });
  }

  if (chatResetBtn) {
    chatResetBtn.addEventListener('click', renderWelcome);
  }

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleUserInput();
    });
  } else if (chatSendBtn) {
    chatSendBtn.addEventListener('click', () => handleUserInput());
  }

  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleUserInput();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatPopup.classList.contains('open')) {
      closeChat();
    }
  });

  // Re-render when language toggles if open
  window.addEventListener('languageChanged', () => {
    if (chatPopup.classList.contains('open')) {
      renderWelcome();
    }
  });

  // Initial welcome message
  renderWelcome();

  // 6. Help Popup Coordination & Interactivity
  const overlayHelpBtn = document.getElementById('overlayHelpBtn');
  const helpCloseBtn = document.getElementById('helpCloseBtn');
  const helpPopup = document.getElementById('helpPopup');

  function closeHelp() {
    if (!helpPopup) return;
    helpPopup.classList.remove('open');
    helpPopup.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('help-active');
    setTimeout(() => { helpPopup.style.display = 'none'; }, 280);
    const scrollUp = document.getElementById('backToTop');
    if (scrollUp && !chatPopup.classList.contains('open')) {
      scrollUp.classList.remove('hidden-by-chat');
    }
  }

  function openHelp() {
    if (!helpPopup) return;
    if (chatPopup.classList.contains('open')) closeChat();
    helpPopup.style.display = 'flex';
    document.body.classList.add('help-active');
    requestAnimationFrame(() => {
      helpPopup.classList.add('open');
      helpPopup.setAttribute('aria-hidden', 'false');
    });
    const scrollUp = document.getElementById('backToTop');
    if (scrollUp) scrollUp.classList.add('hidden-by-chat');
  }

  if (overlayHelpBtn && helpCloseBtn) {
    overlayHelpBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      helpPopup && helpPopup.classList.contains('open') ? closeHelp() : openHelp();
    });
    helpCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeHelp();
    });
  }

  // Interactive Tab Switching inside Help Hub
  if (helpPopup) {
    const tabs = helpPopup.querySelectorAll('.help-tab-btn');
    const panes = helpPopup.querySelectorAll('.help-tab-pane');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        panes.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const targetPane = document.getElementById('helpTab' + targetTab.charAt(0).toUpperCase() + targetTab.slice(1));
        if (targetPane) targetPane.classList.add('active');
      });
    });

    // Switch to Chatbot Button
    const helpSwitchToChatBtn = document.getElementById('helpSwitchToChatBtn');
    if (helpSwitchToChatBtn) {
      helpSwitchToChatBtn.addEventListener('click', () => {
        closeHelp();
        setTimeout(openChat, 150);
      });
    }

    // Tab 4: Interactive Project Estimator Cards
    const estCards = helpPopup.querySelectorAll('.estimator-card');
    const estService = document.getElementById('estSelectedService');
    const estTime = document.getElementById('estSelectedTime');
    const estPrice = document.getElementById('estSelectedPrice');
    const estConsultBtn = document.getElementById('estConsultBtn');

    if (estCards.length && estService && estTime && estPrice && estConsultBtn) {
      estCards.forEach(card => {
        card.addEventListener('click', () => {
          estCards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');

          const service = card.getAttribute('data-service') || 'Landing Page';
          const time = card.getAttribute('data-time') || '3–5 Hari Kerja';
          const price = card.getAttribute('data-price') || 'Mulai Rp 499.000';

          estService.textContent = service;
          estTime.textContent = '⚡ ' + time;
          estPrice.textContent = price;

          const waMsg = encodeURIComponent(`Halo Nexus Diji, saya tertarik dengan estimasi layanan ${service} (${price}, durasi ${time}). Mohon info penawaran & konsultasinya.`);
          estConsultBtn.href = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;
        });
      });
    }

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (helpPopup.classList.contains('open') &&
          !helpPopup.contains(e.target) &&
          (!overlayHelpBtn || !overlayHelpBtn.contains(e.target))) {
        closeHelp();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && helpPopup.classList.contains('open')) {
        closeHelp();
      }
    });
  }
}

/**
 * Ensures required HTML exists in DOM (for pages where toolsOverlay is not static)
 */
function ensureChatbotDOM(mascotSrc) {
  let overlayChatBtn = document.getElementById('overlayChatBtn');
  if (!overlayChatBtn) {
    let toolsOverlay = document.getElementById('toolsOverlay');
    if (!toolsOverlay) {
      toolsOverlay = document.createElement('aside');
      toolsOverlay.className = 'tools-overlay visible';
      toolsOverlay.id = 'toolsOverlay';
      toolsOverlay.innerHTML = `
        <div class="fab-actions">
          <button class="tool-btn tool-btn--mascot" id="overlayChatBtn" aria-label="Buka Nexus Assistant" title="Chat Nexus Assistant">
            <div class="mascot-avatar-wrap">
              <img src="${mascotSrc}" alt="Nexus Robot Mascot" class="tool-mascot-img" width="34" height="34" loading="eager">
              <span class="mascot-status-pulse" aria-hidden="true"></span>
            </div>
            <span class="tool-tooltip">Nexus AI Chat</span>
          </button>
          <button class="tool-btn tool-btn--help" id="overlayHelpBtn" aria-label="Buka Menu Bantuan" title="Pusat Bantuan">
            <div class="help-avatar-dock">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span class="help-dock-pulse" aria-hidden="true"></span>
            </div>
            <span class="tool-tooltip">Pusat Bantuan &amp; FAQ</span>
          </button>
          <a href="https://wa.me/${WA_NUMBER}?text=Halo%20Nexus%20Diji%2C%20saya%20ingin%20konsultasi" class="tool-btn"
            target="_blank" rel="noopener" aria-label="WhatsApp Nexus Diji" title="WhatsApp">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span class="tool-tooltip">WhatsApp</span>
          </a>
        </div>
      `;
      document.body.appendChild(toolsOverlay);
    }
  }

  let floatingChatBtn = document.getElementById('nexusFloatingChatBtn');
  if (!floatingChatBtn) {
    floatingChatBtn = document.createElement('button');
    floatingChatBtn.className = 'nexus-floating-chat-trigger';
    floatingChatBtn.id = 'nexusFloatingChatBtn';
    floatingChatBtn.setAttribute('aria-label', 'Buka Chat Nexus AI');
    floatingChatBtn.setAttribute('title', 'Chat dengan Nexus AI Assistant');
    floatingChatBtn.innerHTML = `
      <div class="mascot-trigger-wrap">
        <div class="mascot-trigger-glow"></div>
        <img src="${mascotSrc}" alt="Nexus Robot Mascot" class="mascot-trigger-robot" width="44" height="44" loading="eager">
        <span class="mascot-trigger-ping" aria-hidden="true"></span>
      </div>
      <div class="mascot-speech-bubble" id="mascotSpeechBubble" aria-hidden="true">
        <span>Halo! Butuh bantuan digital? 👋</span>
      </div>
    `;
    document.body.appendChild(floatingChatBtn);
  }

  let chatPopup = document.getElementById('chatPopup');
  if (!chatPopup) {
    chatPopup = document.createElement('aside');
    chatPopup.id = 'chatPopup';
    chatPopup.className = 'nexus-chat-popup';
    chatPopup.setAttribute('role', 'dialog');
    chatPopup.setAttribute('aria-label', 'Nexus Assistant AI');
    chatPopup.setAttribute('aria-modal', 'true');
    chatPopup.setAttribute('aria-hidden', 'true');
    chatPopup.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-main">
          <div class="chat-avatar-wrap">
            <div class="chat-avatar-glow"></div>
            <img src="${mascotSrc}" alt="Nexus AI Avatar" class="chat-avatar-img" width="40" height="40" loading="eager">
            <span class="chat-online-badge" title="AI Online"></span>
          </div>
          <div class="chat-header-meta">
            <div class="chat-name-row">
              <strong class="chat-bot-name">Nexus AI</strong>
              <span class="chat-tag-pill">AI 2.0</span>
            </div>
            <span class="chat-subtitle">
              <span class="chat-live-point"></span>
              Online &bull; Siap Bantu Solusi Digital
            </span>
          </div>
        </div>
        <div class="chat-header-ctrls">
          <button id="chatSwitchToHelpBtn" class="chat-ctrl-btn chat-help-switch-btn" aria-label="Buka Pusat Bantuan &amp; FAQ"
            title="Buka Pusat Bantuan &amp; Panduan">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </button>
          <button id="chatResetBtn" class="chat-ctrl-btn" aria-label="Mulai Ulang Percakapan" title="Mulai Ulang Percakapan">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <polyline points="3 3 3 8 8 8"></polyline>
            </svg>
          </button>
          <button id="chatCloseBtn" class="chat-ctrl-btn chat-close-btn" aria-label="Tutup chat" title="Tutup Chat">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <div class="chat-notice-ribbon">
        <span class="ribbon-icon">⚡</span>
        <span class="ribbon-text">Respon Cepat seputar Website, Aplikasi &amp; Servis PC/Laptop</span>
      </div>
      <div class="chat-body" id="chatBody" role="log" aria-live="polite"></div>
      <div class="chat-options-tray" id="chatOptionsTray">
        <div class="tray-label">Topik Populer:</div>
        <div class="chat-options" id="chatOptions"></div>
      </div>
      <div class="chat-footer">
        <form class="chat-form" id="chatForm" onsubmit="return false;">
          <div class="chat-input-wrapper">
            <input type="text" id="chatInput" placeholder="Ketik pertanyaan anda" autocomplete="off">
            <button type="submit" class="chat-send-btn" id="chatSendBtn" aria-label="Kirim Pesan" title="Kirim">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </form>
        <div class="chat-legal-note">
          Konsultasi 100% Gratis &bull; Didukung Tim Ahli Nexus Diji
        </div>
      </div>
    `;
    document.body.appendChild(chatPopup);
  }

  let helpPopup = document.getElementById('helpPopup');
  if (!helpPopup) {
    helpPopup = document.createElement('aside');
    helpPopup.id = 'helpPopup';
    helpPopup.className = 'nexus-help-popup';
    helpPopup.setAttribute('role', 'dialog');
    helpPopup.setAttribute('aria-label', 'Pusat Bantuan & FAQ Nexus Diji');
    helpPopup.setAttribute('aria-modal', 'true');
    helpPopup.setAttribute('aria-hidden', 'true');
    helpPopup.innerHTML = `
      <div class="help-header">
        <div class="help-header-main">
          <div class="help-avatar-wrap">
            <div class="help-avatar-glow"></div>
            <div class="help-avatar-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <span class="help-online-badge" title="Support Siaga"></span>
          </div>
          <div class="help-header-meta">
            <div class="help-name-row">
              <strong class="help-title-text">Pusat Bantuan</strong>
              <span class="help-tag-pill">Support 24/7</span>
            </div>
            <span class="help-subtitle">
              <span class="help-live-point"></span>
              Siaga &bull; Panduan Layanan &amp; FAQ Cepat
            </span>
          </div>
        </div>
        <button id="helpCloseBtn" class="help-ctrl-btn help-close-btn" aria-label="Tutup Bantuan" title="Tutup Bantuan">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="help-notice-ribbon">
        <span class="ribbon-icon">💡</span>
        <span class="ribbon-text">Panduan praktis pembuatan website, aplikasi &amp; servis laptop/PC</span>
      </div>

      <div class="help-nav-tabs" role="tablist">
        <button type="button" class="help-tab-btn active" data-tab="workflow" role="tab" aria-selected="true">
          <span>🚀</span> Alur Proyek
        </button>
        <button type="button" class="help-tab-btn" data-tab="faq" role="tab" aria-selected="false">
          <span>❓</span> FAQ Populer
        </button>
        <button type="button" class="help-tab-btn" data-tab="warranty" role="tab" aria-selected="false">
          <span>🛡️</span> Garansi &amp; Biaya
        </button>
        <button type="button" class="help-tab-btn" data-tab="estimator" role="tab" aria-selected="false">
          <span>⚡</span> Estimasi Kilat
        </button>
      </div>

      <div class="help-body" id="helpBody">
        <div class="help-tab-pane active" id="helpTabWorkflow">
          <div class="help-section-intro">
            <h4>🚀 4 Langkah Mudah Realisasi Proyek</h4>
            <p>Proses transparan, cepat, dan profesional bersama tim ahli Nexus Diji:</p>
          </div>
          <div class="help-timeline">
            <div class="timeline-step">
              <div class="step-num">1</div>
              <div class="step-info">
                <strong>Konsultasi Kebutuhan &amp; Konsep (100% Gratis)</strong>
                <p>Ceritakan ide website, aplikasi custom, atau kendala laptop Anda via chat WhatsApp atau AI Chatbot kami. Diskusi bebas biaya!</p>
              </div>
            </div>
            <div class="timeline-step">
              <div class="step-num">2</div>
              <div class="step-info">
                <strong>Estimasi Biaya &amp; Proposal Transparan (&lt; 24 Jam)</strong>
                <p>Kami kirimkan rincian spesifikasi teknis, estimasi timeline, dan penawaran harga pasti tanpa biaya siluman.</p>
              </div>
            </div>
            <div class="timeline-step">
              <div class="step-num">3</div>
              <div class="step-info">
                <strong>Development Kilat &amp; Live Staging Preview</strong>
                <p>Proyek dikerjakan dengan standar teknologi modern (Next.js, Tailwind, Flutter). Anda bisa memantau progress secara berkala lewat link staging.</p>
              </div>
            </div>
            <div class="timeline-step">
              <div class="step-num">4</div>
              <div class="step-info">
                <strong>Peluncuran, Training &amp; Garansi Maintenance 30 Hari</strong>
                <p>Serah terima akun, domain, dan video panduan admin, ditambah pendampingan garansi maintenance 30 hari gratis.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="help-tab-pane" id="helpTabFaq">
          <div class="help-section-intro">
            <h4>❓ Pertanyaan yang Sering Diajukan</h4>
            <p>Jawaban cepat untuk hal-hal yang sering ditanyakan klien kami:</p>
          </div>
          <div class="help-accordion">
            <details class="help-acc-item" open>
              <summary class="help-acc-trigger">
                <span>🌐 Berapa lama pengerjaan website sampai selesai?</span>
                <span class="acc-chevron">›</span>
              </summary>
              <div class="help-acc-body">
                Landing page kilat rata-rata selesai dalam <strong>3–5 hari kerja</strong>. Website Company Profile atau Toko Online berkisar <strong>7–14 hari</strong> tergantung kelengkapan konten dan fitur yang diminta.
              </div>
            </details>
            <details class="help-acc-item">
              <summary class="help-acc-trigger">
                <span>💻 Laptop overheat dan sering mati sendiri, diapakan?</span>
                <span class="acc-chevron">›</span>
              </summary>
              <div class="help-acc-body">
                Kami lakukan pembersihan total debu exhaust fan dan pergantian <strong>thermal paste Grizzly Kryonaut premium</strong>. Pengerjaan <strong>bisa ditunggu (1–2 jam)</strong> dan suhu laptop kembali adem normal!
              </div>
            </details>
            <details class="help-acc-item">
              <summary class="help-acc-trigger">
                <span>💳 Bagaimana sistem pembayaran proyek?</span>
                <span class="acc-chevron">›</span>
              </summary>
              <div class="help-acc-body">
                Sistem pembayaran sangat aman: <strong>DP 50%</strong> saat kesepakatan pengerjaan, dan pelunasan <strong>50%</strong> setelah website/aplikasi siap live dan Anda puas dengan hasilnya.
              </div>
            </details>
            <details class="help-acc-item">
              <summary class="help-acc-trigger">
                <span>📱 Apakah aplikasi mendukung Android &amp; iOS?</span>
                <span class="acc-chevron">›</span>
              </summary>
              <div class="help-acc-body">
                Tentu! Kami menggunakan framework modern seperti Flutter dan React Native, sehingga satu basis kode siap dirilis di Google Play Store dan Apple App Store secara optimal.
              </div>
            </details>
            <details class="help-acc-item">
              <summary class="help-acc-trigger">
                <span>🎁 Apakah sudah gratis domain dan hosting?</span>
                <span class="acc-chevron">›</span>
              </summary>
              <div class="help-acc-body">
                Ya! Seluruh paket pembuatan website sudah termasuk gratis domain pilihan (.com / .my.id / .id), server Cloud SSD super cepat, dan sertifikat SSL HTTPS selama 1 tahun pertama.
              </div>
            </details>
          </div>
        </div>

        <div class="help-tab-pane" id="helpTabWarranty">
          <div class="help-section-intro">
            <h4>🛡️ Jaminan Kualitas &amp; Estimasi Paket</h4>
            <p>Komitmen keamanan, transparansi harga, dan layanan purna jual Nexus Diji:</p>
          </div>
          <div class="help-warranty-grid">
            <div class="warranty-card">
              <div class="warranty-badge-icon">🛡️</div>
              <div class="warranty-meta">
                <strong>Garansi Bebas Bug 30 Hari</strong>
                <p>Revisi dan penanganan error pasca-launching gratis 100% tanpa biaya tambahan.</p>
              </div>
            </div>
            <div class="warranty-card">
              <div class="warranty-badge-icon">⚙️</div>
              <div class="warranty-meta">
                <strong>Garansi Servis Hardware (30–90 Hari)</strong>
                <p>Jaminan kualitas sparepart SSD, RAM, baterai, dan kestabilan sistem OS.</p>
              </div>
            </div>
            <div class="warranty-card">
              <div class="warranty-badge-icon">🎁</div>
              <div class="warranty-meta">
                <strong>Gratis Domain &amp; Cloud Hosting</strong>
                <p>Semua paket website sudah termasuk domain .my.id/.com dan server cloud 1 tahun pertama.</p>
              </div>
            </div>
          </div>
          <div class="help-price-summary">
            <div class="price-row">
              <span>Website Starter</span>
              <strong>Rp 499.000</strong>
            </div>
            <div class="price-row">
              <span>Company Profile Pro</span>
              <strong>Rp 899.000 - Rp 1.499.000</strong>
            </div>
            <div class="price-row">
              <span>Aplikasi Custom / POS</span>
              <strong>Rp 1.499.000 - Rp 4.999.000</strong>
            </div>
            <div class="price-row">
              <span>Servis &amp; Upgrade Laptop</span>
              <strong>Mulai Rp 50.000</strong>
            </div>
          </div>
        </div>

        <div class="help-tab-pane" id="helpTabEstimator">
          <div class="help-section-intro">
            <h4>⚡ Kalkulator Estimasi Kilat</h4>
            <p>Pilih kebutuhan Anda untuk estimasi durasi dan paket terbaik:</p>
          </div>
          <div class="help-estimator-box">
            <div class="estimator-option-cards">
              <button type="button" class="estimator-card active" data-service="Landing Page" data-time="3–5 Hari Kerja" data-price="Mulai Rp 499.000">
                <span class="est-icon">🌐</span>
                <div class="est-meta">
                  <strong>Landing Page</strong>
                  <span>3–5 Hari &bull; Mulai Rp 499rb</span>
                </div>
              </button>
              <button type="button" class="estimator-card" data-service="Company Profile" data-time="7–10 Hari Kerja" data-price="Mulai Rp 899.000">
                <span class="est-icon">🏢</span>
                <div class="est-meta">
                  <strong>Company Profile</strong>
                  <span>7–10 Hari &bull; Mulai Rp 899rb</span>
                </div>
              </button>
              <button type="button" class="estimator-card" data-service="Aplikasi Mobile" data-time="14–21 Hari Kerja" data-price="Mulai Rp 2.499.000">
                <span class="est-icon">📱</span>
                <div class="est-meta">
                  <strong>Aplikasi Mobile</strong>
                  <span>14–21 Hari &bull; Mulai Rp 2,49jt</span>
                </div>
              </button>
              <button type="button" class="estimator-card" data-service="Servis & Tune-up Laptop" data-time="1–2 Jam (Bisa Ditunggu)" data-price="Mulai Rp 50.000">
                <span class="est-icon">💻</span>
                <div class="est-meta">
                  <strong>Servis &amp; Laptop</strong>
                  <span>1–2 Jam &bull; Mulai Rp 50rb</span>
                </div>
              </button>
            </div>
            <div class="estimator-result-panel" id="estimatorResultPanel">
              <div class="est-result-row">
                <span>Layanan Terpilih:</span>
                <strong id="estSelectedService">Landing Page</strong>
              </div>
              <div class="est-result-row">
                <span>Estimasi Waktu:</span>
                <span class="est-tag est-tag--time" id="estSelectedTime">⚡ 3–5 Hari Kerja</span>
              </div>
              <div class="est-result-row">
                <span>Estimasi Budget:</span>
                <span class="est-tag est-tag--price" id="estSelectedPrice">Mulai Rp 499.000</span>
              </div>
              <a href="https://wa.me/${WA_NUMBER}?text=Halo%20Nexus%20Diji%2C%20saya%20tertarik%20dengan%20estimasi%20layanan%20Landing%20Page" class="est-submit-btn" id="estConsultBtn" target="_blank" rel="noopener">
                <span>Klaim Konsultasi &amp; Promo Sekarang</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="help-footer">
        <div class="help-direct-actions">
          <button type="button" class="help-action-btn help-action-btn--chat" id="helpSwitchToChatBtn">
            <img src="${mascotSrc}" alt="Nexus Mascot" width="22" height="22">
            <span>Tanya Nexus AI</span>
          </button>
          <a href="https://wa.me/${WA_NUMBER}?text=Halo%20Nexus%20Diji%2C%20saya%20butuh%20bantuan%20dan%20konsultasi" class="help-action-btn help-action-btn--wa" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>Chat via WhatsApp</span>
          </a>
        </div>
        <div class="help-legal-note">
          Konsultasi 100% Gratis &bull; Nexus Diji Official Support
        </div>
      </div>
    `;
    document.body.appendChild(helpPopup);
  }
}

// Auto-initialize when ready across any page
if (typeof window !== 'undefined') {
  window.initChatbot = initChatbot;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initChatbot(), { once: true });
  } else {
    initChatbot();
  }
}
