/**
 * Nexus Diji virtual assistant (Robot ND)
 * Local knowledge brain, streamed answers, voice, and robot reactions.
 * All facts come from real site content: pages/harga.html, index FAQ,
 * pages/layanan.html, carousel portfolio data, and pages/kontak.html.
 */
(function () {
  'use strict';

  const scriptEl = document.currentScript || document.querySelector('script[src*="assistant.js"]');
  const ROOT = scriptEl ? new URL('../../', scriptEl.src).href : './';
  const WA_NUMBER = '6285711171508';
  const VOICE_KEY = 'nexus-diji-assistant-voice';
  const CLIP_ROOT = ROOT + 'assets/audio/assistant/';
  const HOME = /(\/|index\.html)$/i.test(location.pathname);

  /* ══════════════════════════════════════════════════════════════
     1. TEXT HELPERS
     ══════════════════════════════════════════════════════════════ */
  function strip(value) {
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function editDistance(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    const row = [];
    for (let j = 0; j <= b.length; j += 1) row[j] = j;
    for (let i = 1; i <= a.length; i += 1) {
      let prev = row[0];
      row[0] = i;
      let rowMin = row[0];
      for (let j = 1; j <= b.length; j += 1) {
        const tmp = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = tmp;
        if (row[j] < rowMin) rowMin = row[j];
      }
      if (rowMin > max) return max + 1;
    }
    return row[b.length];
  }

  function homeLink(hash) {
    return HOME ? hash : ROOT + 'index.html' + hash;
  }

  function fill(template, vars) {
    return String(template).replace(/\{(\w+)\}/g, (match, key) => (key in vars ? vars[key] : match));
  }

  /* ══════════════════════════════════════════════════════════════
     2. MEMORY (what the assistant learns from this visitor)
     Stays on the device in localStorage: visit count, topics asked,
     stated need, unanswered questions, sections browsed. No server.
     ══════════════════════════════════════════════════════════════ */
  const MEMORY_KEY = 'nexus-diji-assistant-memory-v1';
  const MEMORY_CAP = 24;
  const TOPIC_IGNORE = { greeting: 1, terima_kasih: 1, fallback: 1 };

  // Short, generic questions ("kalau yang itu berapa?") lean on the section
  // the visitor is reading to pick the right intent.
  const SECTION_INTENTS = {
    services: ['layanan'],
    portfolio: ['portofolio'],
    pricing: ['harga_umum', 'harga_website', 'harga_servis', 'bayar'],
    why: ['kenapa'],
    process: ['proses', 'durasi'],
    faq: ['garansi', 'bayar', 'teknologi'],
    blog: ['blog'],
    contact: ['konsultasi', 'lokasi'],
    testimonials: ['kenapa', 'portofolio']
  };

  // Proactive bubble lines: the robot reacts to the section being read and
  // answers that topic right away when the bubble is clicked.
  const HINTS = {
    services: {
      text: { id: 'Lagi lihat layanan kami? Tanya aku.', en: 'Browsing our services? Ask me.' },
      intent: 'layanan'
    },
    portfolio: {
      text: { id: 'Mau contoh yang mirip idemu?', en: 'Want a sample like your idea?' },
      intent: 'portofolio'
    },
    pricing: {
      text: { id: 'Lagi cek paket harga ya?', en: 'Checking the plans?' },
      intent: 'harga_umum'
    },
    why: {
      text: { id: 'Lagi cek keunggulan kami ya?', en: 'Checking what sets us apart?' },
      intent: 'kenapa'
    },
    process: {
      text: { id: 'Penasaran alur kerjanya?', en: 'Curious about the process?' },
      intent: 'proses'
    },
    faq: {
      text: { id: 'Ada yang belum jelas? Tanya aku.', en: 'Something unclear? Ask me.' },
      intent: null
    },
    blog: {
      text: { id: 'Mau baca yang mana? Aku ringkas.', en: 'Which article? I can sum it up.' },
      intent: 'blog'
    },
    contact: {
      text: { id: 'Mau hubungi tim? Klik aku.', en: 'Ready to reach the team?' },
      intent: 'konsultasi'
    }
  };

  const memory = {
    data: {
      visits: 0,
      firstSeen: 0,
      lastSeen: 0,
      lastIntent: null,
      need: null,
      needAt: 0,
      interests: {},
      unknowns: [],
      sections: {}
    },
    returning: false,
    load() {
      const now = Date.now();
      try {
        const raw = localStorage.getItem(MEMORY_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') Object.assign(this.data, parsed);
        }
      } catch (error) { /* storage may be blocked */ }
      if (!this.data.interests || typeof this.data.interests !== 'object') this.data.interests = {};
      if (!this.data.sections || typeof this.data.sections !== 'object') this.data.sections = {};
      if (!Array.isArray(this.data.unknowns)) this.data.unknowns = [];
      this.returning = this.data.visits > 0 && now - (this.data.lastSeen || 0) < 30 * 24 * 60 * 60 * 1000;
      if (!this.data.firstSeen) this.data.firstSeen = now;
      this.data.visits += 1;
      this.data.lastSeen = now;
      this.save();
    },
    save() {
      try { localStorage.setItem(MEMORY_KEY, JSON.stringify(this.data)); } catch (error) { /* noop */ }
    },
    reset() {
      this.data = {
        visits: 0, firstSeen: 0, lastSeen: 0, lastIntent: null,
        need: null, needAt: 0, interests: {}, unknowns: [], sections: {}
      };
      this.returning = false;
      try { localStorage.removeItem(MEMORY_KEY); } catch (error) { /* noop */ }
    },
    timesAsked(id) {
      return this.data.interests[id] || 0;
    },
    noteIntent(id) {
      this.data.interests[id] = (this.data.interests[id] || 0) + 1;
      this.data.lastIntent = id;
      this.save();
    },
    topInterest() {
      const ids = Object.keys(this.data.interests)
        .filter((id) => BY_ID[id] && !TOPIC_IGNORE[id]);
      return ids.sort((a, b) => this.data.interests[b] - this.data.interests[a])[0] || null;
    },
    noteNeed(need) {
      if (!need || this.data.need === need) return;
      this.data.need = need;
      this.data.needAt = Date.now();
      this.save();
    },
    noteUnknown(text) {
      const question = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 160);
      if (!question) return;
      this.data.unknowns.unshift({ q: question, at: Date.now() });
      this.data.unknowns = this.data.unknowns.slice(0, MEMORY_CAP);
      this.save();
    },
    noteSection(id) {
      this.data.sections[id] = (this.data.sections[id] || 0) + 1;
      this.save();
    },
    recentNeed() {
      const fresh = Date.now() - (this.data.needAt || 0) < 6 * 60 * 60 * 1000;
      return fresh ? this.data.need : null;
    }
  };
  memory.load();

  // What the visitor says they need, read from their own words. Only the
  // latest match is kept, and only for a few hours, so follow-up lines stay true.
  const NEED_PATTERNS = [
    ['toko', /toko online|ecommerce|e commerce|online shop|jualan online|olshop/],
    ['profile', /company profile|company profil|profil perusahaan|profil bisnis|multi halaman/],
    ['landing', /landing page|landing|satu halaman|1 halaman/],
    ['blog', /blog|artikel|berita/],
    ['app', /aplikasi|mobile app|web app|dashboard|sistem custom/],
    ['servis', /servis|service|laptop|komputer/]
  ];

  function noteNeedFrom(norm) {
    const hit = NEED_PATTERNS.find((pair) => pair[1].test(norm));
    if (hit) memory.noteNeed(hit[0]);
  }

  /* ══════════════════════════════════════════════════════════════
     3. KNOWLEDGE BASE
     ══════════════════════════════════════════════════════════════ */
  const KB = [
    {
      id: 'greeting',
      label: { id: 'Sapa robot ND', en: 'Say hi to Robot ND' },
      phrases: ['hai', 'halo', 'hallo', 'hi', 'hello', 'hey', 'pagi', 'siang', 'sore', 'malam', 'permisi', 'assalamualaikum', 'selamat'],
      tokens: ['hai', 'halo', 'hello', 'greetings', 'permisi'],
      answer: {
        id: 'Hai! Aku Robot ND, asisten Nexus Diji. Aku bisa jelasin layanan, harga, lama pengerjaan, sampai servis perangkat. Mau mulai dari mana?',
        en: 'Hi! I am Robot ND, the Nexus Diji assistant. I can explain our services, pricing, timelines, and device repair. Where should we start?'
      },
      follow: ['layanan', 'harga_umum', 'konsultasi']
    },
    {
      id: 'layanan',
      label: { id: 'Layanan yang tersedia', en: 'Available services' },
      phrases: ['layanan apa', 'jasa apa', 'bisa apa', 'apa yang bisa', 'layanan apa saja', 'what can you do', 'services'],
      tokens: ['layanan', 'jasa', 'bisa', 'services', 'service', 'tawarkan'],
      answer: {
        id: 'Ada tiga layanan utama: pembuatan website (landing page, company profile, toko online, blog), pembuatan aplikasi (web app, mobile app, dashboard), dan servis PC atau laptop (instalasi OS, upgrade RAM/SSD, virus removal, recovery data, optimasi). Mau aku jelaskan yang mana?',
        en: 'Three main services: website development (landing page, company profile, online store, blog), app development (web app, mobile app, dashboard), and PC or laptop repair (OS install, RAM/SSD upgrade, virus removal, data recovery, performance tuning). Which one should I explain?'
      },
      links: [
        { label: { id: 'Halaman layanan', en: 'Services page' }, href: 'pages/layanan.html' },
        { label: { id: 'Servis perangkat', en: 'Device repair' }, href: 'pages/layanan.html#servis' }
      ],
      follow: ['harga_umum', 'jenis_website', 'harga_servis']
    },
    {
      id: 'jenis_website',
      label: { id: 'Jenis website', en: 'Types of websites' },
      phrases: ['jenis website', 'tipe website', 'website apa', 'buat website', 'bikin website', 'butuh website', 'mau website', 'company profile', 'landing page', 'toko online', 'e commerce', 'ecommerce', 'online shop', 'jualan online', 'undangan digital', 'website untuk umkm'],
      tokens: ['website', 'web', 'situs', 'landing', 'profile', 'blog', 'store'],
      answer: {
        id: 'Kami biasa mengerjakan empat jenis website: landing page untuk satu penawaran, company profile untuk profil bisnis, toko online untuk jualan, dan blog untuk konten. Kalau butuh fitur khusus seperti booking atau dashboard, bisa masuk paket Enterprise. Kira-kira butuh yang mana?',
        en: 'We usually build four kinds of sites: a landing page for one focused offer, a company profile for your business, an online store for selling, and a blog for content. Features like booking or dashboards go into the Enterprise plan. Which one fits you?'
      },
      links: [
        { label: { id: 'Detail layanan website', en: 'Website service details' }, href: 'pages/layanan.html#website' },
        { label: { id: 'Lihat paket harga', en: 'See pricing' }, href: 'pages/harga.html' }
      ],
      follow: ['harga_website', 'durasi', 'portofolio']
    },
    {
      id: 'harga_website',
      label: { id: 'Harga website', en: 'Website pricing' },
      phrases: ['harga website', 'biaya website', 'harga bikin website', 'harga buat website', 'harga bikin web', 'paket website', 'harga pembuatan website', 'berapa biaya', 'list harga', 'daftar harga', 'price list', 'pricelist', 'website price', 'website pricing', 'website cost', 'cost of a website', 'how much does a website cost', 'how much for a website'],
      tokens: ['harga', 'biaya', 'tarif', 'paket', 'price', 'cost', 'budget', 'starter', 'profesional', 'enterprise', 'murah', 'rp'],
      answer: {
        id: 'Paket website: Starter Rp 500.000 (landing page 1 halaman, gratis 2x revisi, selesai 3-5 hari kerja), Profesional Rp 2.000.000 (multi-halaman, desain custom, CMS, SEO on-page, support 1 bulan), Enterprise custom (web app atau sistem, integrasi API dan database, support 3 bulan). Semua paket sudah termasuk revisi dan garansi.',
        en: 'Website plans: Starter IDR 500k (one landing page, 2 free revisions, ready in 3 to 5 working days), Professional IDR 2M (multi-page, custom design, CMS, on-page SEO, 1 month support), Enterprise custom (web app or system, API and database integration, 3 months support). Every plan includes revisions and a warranty.'
      },
      links: [
        { label: { id: 'Rincian di halaman harga', en: 'Full pricing page' }, href: 'pages/harga.html' },
        { label: { id: 'Paket di beranda', en: 'Plans on home' }, href: homeLink('#pricing') }
      ],
      follow: ['bayar', 'durasi', 'konsultasi'],
      cta: { id: 'Halo Nexus Diji, saya mau tanya paket website.', en: 'Hello Nexus Diji, I would like to ask about your website plans.' }
    },
    {
      id: 'harga_servis',
      label: { id: 'Harga servis', en: 'Repair pricing' },
      phrases: ['harga servis', 'biaya servis', 'servis laptop', 'service laptop', 'servis pc', 'service pc', 'servis komputer', 'laptop lemot', 'laptop rusak', 'komputer rusak', 'blue screen', 'instalasi os', 'install ulang', 'upgrade ram', 'ganti ssd', 'upgrade ssd', 'kena virus', 'recovery data', 'data hilang', 'laptop panas', 'fan berisik', 'laptop repair', 'pc repair', 'computer repair', 'repair cost', 'repair price'],
      tokens: ['servis', 'service', 'laptop', 'pc', 'komputer', 'ram', 'ssd', 'virus', 'instalasi', 'install', 'recovery', 'optimasi', 'reparasi', 'perbaikan', 'repair'],
      answer: {
        id: 'Tarif servis perangkat: instalasi OS mulai Rp 100.000, upgrade RAM atau SSD mulai Rp 150.000, virus removal mulai Rp 75.000, recovery data mulai Rp 200.000, optimasi performa mulai Rp 50.000, dan service lengkap mulai Rp 300.000. Perangkat dicek dulu sebelum dikerjakan, jadi tidak ada biaya tersembunyi.',
        en: 'Repair rates: OS installation from IDR 100k, RAM or SSD upgrade from IDR 150k, virus removal from IDR 75k, data recovery from IDR 200k, performance tuning from IDR 50k, and a full service from IDR 300k. We inspect the device first, so there are no hidden fees.'
      },
      links: [
        { label: { id: 'Rincian di halaman harga', en: 'Full pricing page' }, href: 'pages/harga.html' }
      ],
      follow: ['konsultasi', 'durasi']
    },
    {
      id: 'harga_umum',
      label: { id: 'Harga keseluruhan', en: 'General pricing' },
      phrases: ['berapa harganya', 'harga nya', 'harganya berapa', 'price', 'harga layanan', 'how much', 'how much does it cost', 'what is the price'],
      tokens: ['harga', 'biaya', 'tarif'],
      group: 'harga',
      answer: {
        id: 'Ada dua area harga: pembuatan website mulai Rp 500.000 per proyek, dan servis PC atau laptop mulai Rp 50.000. Mau aku rincikan yang mana dulu?',
        en: 'There are two price areas: website development from IDR 500k per project, and PC or laptop repair from IDR 50k. Which one should I break down first?'
      },
      follow: ['harga_website', 'harga_servis', 'konsultasi']
    },
    {
      id: 'durasi',
      label: { id: 'Lama pengerjaan', en: 'Timeline' },
      phrases: ['berapa lama', 'lama pengerjaan', 'waktu pengerjaan', 'estimasi waktu', 'kapan selesai', 'butuh berapa hari', 'seberapa cepat', 'how long', 'how many days', 'how fast', 'how soon', 'timeline pengerjaan'],
      tokens: ['lama', 'cepat', 'hari', 'minggu', 'durasi', 'timeline', 'deadline', 'kapan', 'selesai', 'day', 'week'],
      answer: {
        id: 'Landing page selesai 3-5 hari kerja. Company profile atau toko online 7-14 hari kerja. Web app atau sistem custom 2-4 minggu atau lebih, tergantung scope. Timeline detail dibahas di awal setelah kebutuhannya jelas.',
        en: 'A landing page takes 3 to 5 working days. A company profile or online store takes 7 to 14 working days. A web app or custom system takes 2 to 4 weeks or more, depending on scope. We agree on the detailed timeline once the scope is clear.'
      },
      links: [
        { label: { id: 'Cara kerja kami', en: 'How we work' }, href: homeLink('#process') }
      ],
      follow: ['proses', 'harga_website', 'konsultasi']
    },
    {
      id: 'garansi',
      label: { id: 'Garansi dan revisi', en: 'Warranty and revisions' },
      phrases: ['garansi', 'revisi', 'support setelah', 'after sales', 'purna jual', 'kalau ada bug', 'perbaikan setelah', 'warranty'],
      tokens: ['garansi', 'revisi', 'support', 'bug', 'warranty', 'pemeliharaan', 'maintenance'],
      answer: {
        id: 'Setiap proyek dapat garansi dan masa support: Starter 2 minggu, Profesional 1 bulan, Enterprise 3 bulan. Kalau ada bug atau kendala setelah launch, kami perbaiki tanpa biaya tambahan. Jumlah revisi juga sudah termasuk di tiap paket.',
        en: 'Every project includes a warranty and support window: Starter 2 weeks, Professional 1 month, Enterprise 3 months. Bugs or issues after launch are fixed at no extra cost, and revisions are included in each plan.'
      },
      follow: ['harga_website', 'konsultasi']
    },
    {
      id: 'portofolio',
      label: { id: 'Contoh proyek', en: 'Past projects' },
      phrases: ['portfolio', 'portofolio', 'contoh website', 'contoh hasil', 'hasil kerja', 'proyek sebelumnya', 'proyek yang sudah', 'referensi', 'showcase', 'contoh proyek'],
      tokens: ['contoh', 'portofolio', 'portfolio', 'proyek', 'hasil', 'karya', 'klien', 'client', 'referensi'],
      answer: {
        id: 'Proyek yang sudah jalan: Faryta Studio (website portfolio fotografi), Yoga & Saylun (undangan pernikahan digital), Calvo Furniture (e-commerce furniture), Modern Living (company profile arsitektur), Paw & Petals (booking grooming hewan), Aeterna Fashion (toko online), dan Aether Technologies (portal enterprise).',
        en: 'Projects we have shipped: Faryta Studio (photography portfolio), Yoga & Saylun (digital wedding invitation), Calvo Furniture (furniture e-commerce), Modern Living (architecture profile), Paw & Petals (pet grooming booking), Aeterna Fashion (online store), and Aether Technologies (enterprise portal).'
      },
      links: [
        { label: { id: 'Halaman portfolio', en: 'Portfolio page' }, href: 'pages/portfolio.html' },
        { label: { id: 'Faryta Studio', en: 'Faryta Studio' }, href: 'https://faryta-studio.vercel.app', external: true },
        { label: { id: 'Undangan Yoga & Saylun', en: 'Yoga & Saylun invitation' }, href: 'https://undangan-pernikahan-yogadansaylun.vercel.app/', external: true }
      ],
      follow: ['harga_website', 'konsultasi']
    },
    {
      id: 'konsultasi',
      label: { id: 'Konsultasi gratis', en: 'Free consultation' },
      phrases: ['konsultasi', 'hubungi', 'kontak', 'contact', 'whatsapp', 'nomor wa', 'telepon', 'telpon', 'email', 'bicara dengan', 'chat dengan tim', 'admin'],
      tokens: ['kontak', 'nomor', 'telepon', 'email', 'whatsapp', 'wa', 'konsultasi', 'hubungi', 'gratis', 'admin'],
      answer: {
        id: 'Konsultasi pertama gratis dan tanpa komitmen. Ceritakan kebutuhanmu, tim kami balas kurang dari 24 jam, dan WhatsApp biasanya dijawab dalam hitungan menit pada jam kerja.',
        en: 'The first consultation is free with no commitment. Tell us what you need and the team replies within 24 hours; on WhatsApp we usually answer within minutes during working hours.'
      },
      links: [
        { label: { id: 'Halaman kontak', en: 'Contact page' }, href: 'pages/kontak.html' }
      ],
      follow: ['harga_website', 'proses'],
      cta: { id: 'Halo Nexus Diji, saya mau konsultasi gratis.', en: 'Hello Nexus Diji, I would like a free consultation.' }
    },
    {
      id: 'bayar',
      label: { id: 'Pembayaran', en: 'Payment' },
      phrases: ['pembayaran', 'cara bayar', 'sistem pembayaran', 'bisa dicicil', 'angsuran', 'cicilan', 'transfer', 'e wallet', 'ewallet'],
      tokens: ['bayar', 'pembayaran', 'dp', 'cicil', 'angsur', 'transfer', 'wallet', 'invoice'],
      answer: {
        id: 'Pembayaran pakai DP 50% di awal, lalu pelunasan setelah proyek selesai. Untuk proyek besar bisa diangsur sesuai kesepakatan. Kami menerima transfer bank dan e-wallet.',
        en: 'Payment is a 50% down payment at the start, settled after the project is finished. Larger projects can be paid in agreed installments. We accept bank transfer and e-wallets.'
      },
      follow: ['harga_website', 'konsultasi']
    },
    {
      id: 'teknologi',
      label: { id: 'Teknologi yang dipakai', en: 'Technology used' },
      phrases: ['teknologi', 'framework', 'react', 'next js', 'laravel', 'node js', 'flutter', 'react native', 'stack', 'bahasa pemrograman', 'pakai apa'],
      tokens: ['teknologi', 'tech', 'stack', 'framework', 'react', 'laravel', 'flutter', 'node', 'database', 'api'],
      answer: {
        id: 'Untuk web app kami pakai React, Next.js, Laravel, atau Node.js. Mobile app pakai Flutter dan React Native. Website statis dibangun dengan HTML, CSS, dan JavaScript murni supaya ringan. Pilihan teknologi menyesuaikan kebutuhan dan skala bisnismu.',
        en: 'For web apps we use React, Next.js, Laravel, or Node.js. Mobile apps use Flutter and React Native. Static sites are built with plain HTML, CSS, and JavaScript to stay light. The stack follows your needs and scale.'
      },
      follow: ['durasi', 'harga_website']
    },
    {
      id: 'aplikasi',
      label: { id: 'Aplikasi custom', en: 'Custom apps' },
      phrases: ['buat aplikasi', 'bikin aplikasi', 'aplikasi custom', 'mobile app', 'aplikasi android', 'aplikasi ios', 'web app', 'dashboard', 'sistem custom', 'integrasi api'],
      tokens: ['aplikasi', 'app', 'android', 'ios', 'mobile', 'dashboard', 'sistem', 'custom'],
      answer: {
        id: 'Kami bangun web app, mobile app, dashboard, dan API. Ini masuk paket Enterprise: integrasi API dan database, revisi unlimited, support 3 bulan, plus dokumentasi teknis. Timeline sistem custom umumnya 2-4 minggu atau lebih.',
        en: 'We build web apps, mobile apps, dashboards, and APIs. These sit in the Enterprise plan: API and database integration, unlimited revisions, 3 months of support, and technical documentation. Custom systems usually take 2 to 4 weeks or more.'
      },
      links: [
        { label: { id: 'Detail layanan aplikasi', en: 'App service details' }, href: 'pages/layanan.html#aplikasi' },
        { label: { id: 'Lihat paket harga', en: 'See pricing' }, href: 'pages/harga.html' }
      ],
      follow: ['durasi', 'konsultasi']
    },
    {
      id: 'lokasi',
      label: { id: 'Lokasi dan pertemuan', en: 'Location and meetings' },
      phrases: ['lokasi', 'alamat', 'dimana', 'di mana', 'bandung', 'jakarta', 'ketemu', 'meeting', 'offline', 'datang ke', 'kantor', 'maps', 'location'],
      tokens: ['lokasi', 'alamat', 'kantor', 'bandung', 'jakarta', 'offline', 'remote', 'peta'],
      answer: {
        id: 'Kami di Bandung dan bisa ketemuan langsung di area Bandung atau Jakarta. Untuk kota lain, diskusi lewat video call. Peta lokasi ada di halaman kontak, dan semua proyek bisa dikerjakan remote.',
        en: 'We are based in Bandung and can meet in person around Bandung or Jakarta. For other cities we use video calls. The map is on the contact page, and every project can run remotely.'
      },
      links: [
        { label: { id: 'Halaman kontak dan peta', en: 'Contact page and map' }, href: 'pages/kontak.html' }
      ],
      follow: ['konsultasi', 'tim']
    },
    {
      id: 'tim',
      label: { id: 'Siapa timnya', en: 'Who is the team' },
      phrases: ['tim kalian', 'siapa pendiri', 'founder', 'owner', 'tentang kalian', 'siapa yang mengerjakan', 'profil tim', 'jumlah tim', 'siapa itu'],
      tokens: ['tim', 'team', 'founder', 'pendiri', 'adha', 'noval', 'owner'],
      answer: {
        id: 'Nexus Diji dikelola langsung oleh dua founder: Adha dan Noval. Jadi kamu berkomunikasi dengan orang yang mengerjakan proyeknya, bukan lewat perantara.',
        en: 'Nexus Diji is run by two founders: Adha and Noval. You talk to the people who build your project, not a middle layer.'
      },
      links: [
        { label: { id: 'Tim kami', en: 'Our team' }, href: 'pages/tim-kami.html' },
        { label: { id: 'Tentang kami', en: 'About us' }, href: 'pages/tentang-kami.html' }
      ],
      follow: ['konsultasi', 'portofolio']
    },
    {
      id: 'promo',
      label: { id: 'Promo bulan ini', en: 'This month promo' },
      phrases: ['promo', 'diskon', 'potongan harga', 'voucher', 'kode promo', 'penawaran khusus', 'discount'],
      tokens: ['diskon', 'promo', 'potongan', 'voucher', 'offer', 'sale'],
      answer: {
        id: 'Ada promo diskon 20% untuk bulan ini. Kalau mau, aku arahkan ke WhatsApp supaya tim mencatat klaim promomu.',
        en: 'There is a 20% discount running this month. If you like, I can send you to WhatsApp so the team records your claim.'
      },
      links: [
        { label: { id: 'Lihat paket harga', en: 'See pricing' }, href: homeLink('#pricing') }
      ],
      follow: ['harga_website', 'konsultasi'],
      cta: { id: 'Halo Nexus Diji, saya mau klaim diskon 20%', en: 'Hello Nexus Diji, I would like to claim the 20% discount' }
    },
    {
      id: 'proses',
      label: { id: 'Cara mulai', en: 'How to start' },
      phrases: ['prosesnya', 'cara pesan', 'cara order', 'alur', 'tahapannya', 'mulai dari mana', 'langkah', 'bagaimana cara mulai', 'cara kerja'],
      tokens: ['proses', 'alur', 'tahap', 'langkah', 'order', 'pesan', 'mulai'],
      answer: {
        id: 'Alurnya empat langkah: konsultasi kebutuhan, perencanaan (timeline dan scope), pengerjaan dengan update rutin, lalu delivery dan support setelah launch. Mulainya dari konsultasi gratis.',
        en: 'Four steps: consultation, planning (timeline and scope), build with regular updates, then delivery and post-launch support. It starts with a free consultation.'
      },
      links: [
        { label: { id: 'Lihat prosesnya', en: 'See the process' }, href: homeLink('#process') }
      ],
      follow: ['konsultasi', 'harga_website']
    },
    {
      id: 'blog',
      label: { id: 'Artikel blog', en: 'Blog articles' },
      phrases: ['blog', 'artikel', 'tulisan', 'tips', 'bacaan', 'news', 'edukasi'],
      tokens: ['blog', 'artikel', 'tips', 'berita', 'tulisan'],
      answer: {
        id: 'Ada tiga artikel di blog: pentingnya website untuk UMKM di 2026, tips mempercepat loading web, dan tanda laptop butuh servis. Mau aku buka halaman blognya?',
        en: 'Three articles are live: why MSMEs need a website in 2026, tips to speed up web loading, and signs your laptop needs servicing. Want me to open the blog?'
      },
      links: [
        { label: { id: 'Buka halaman blog', en: 'Open the blog' }, href: 'pages/blog.html' }
      ],
      follow: ['layanan', 'konsultasi']
    },
    {
      id: 'kenapa',
      label: { id: 'Kenapa pilih Nexus Diji', en: 'Why choose Nexus Diji' },
      phrases: ['kenapa pilih', 'mengapa harus', 'keunggulan', 'kelebihan', 'bedanya', 'kenapa nexus', 'alasan memilih', 'kenapa kalian'],
      tokens: ['keunggulan', 'kelebihan', 'alasan', 'kenapa', 'mengapa', 'beda', 'unggul'],
      answer: {
        id: 'Tiga alasan: website, aplikasi, dan servis perangkat ditangani satu tim; harga transparan dengan titik awal Rp 500.000 untuk website dan Rp 50.000 untuk servis; dan komunikasi terbuka dengan update rutin plus garansi setelah proyek selesai.',
        en: 'Three reasons: websites, apps, and device repair are handled by one team; pricing is transparent starting at IDR 500k for a site and IDR 50k for repair; and communication stays open with regular updates plus a post-launch warranty.'
      },
      follow: ['portofolio', 'konsultasi']
    },
    {
      id: 'terima_kasih',
      label: { id: 'Terima kasih', en: 'Thank the robot' },
      phrases: ['makasih', 'terima kasih', 'thanks', 'thank you', 'sip', 'mantap', 'keren', 'bagus juga'],
      tokens: ['makasih', 'thanks', 'thank', 'sip', 'mantap'],
      answer: {
        id: 'Siap! Kalau ada pertanyaan lain, tanya saja. Kalau mau langsung ngobrol dengan tim, tombol WhatsApp ada di chat ini.',
        en: 'Anytime! Ask me anything else. If you want to talk to the team directly, the WhatsApp button is right here in the chat.'
      },
      follow: ['konsultasi']
    }
  ];

  const BY_ID = KB.reduce((acc, item) => { acc[item.id] = item; return acc; }, {});

  const FALLBACK = {
    id: 'fallback',
    label: { id: 'Tanya tim', en: 'Ask the team' },
    answer: {
      id: 'Aku belum punya info itu, jadi biar akurat aku sambungkan ke tim Nexus Diji. Pertanyaanmu sudah aku isikan di tombol WhatsApp di bawah, tim balas kurang dari 24 jam.',
      en: 'I do not have that detail yet, so I will hand you to the Nexus Diji team. Your question is pre-filled in the WhatsApp button below, and the team replies within 24 hours.'
    },
    follow: ['konsultasi', 'layanan', 'harga_umum']
  };

  const START_CHIPS = ['jenis_website', 'harga_servis', 'harga_website', 'konsultasi'];

  const UI = {
    greetingLine: {
      id: 'Hai! Aku Robot ND, asisten Nexus Diji.',
      en: 'Hi! I am Robot ND, the Nexus Diji assistant.'
    },
    greetingNew: {
      id: '{greet}! Aku Robot ND, asisten Nexus Diji. Tanya soal layanan, harga, lama pengerjaan, atau servis perangkat.',
      en: '{greet}! I am Robot ND, the Nexus Diji assistant. Ask about services, pricing, timelines, or device repair.'
    },
    greetingReturn: {
      id: 'Hai lagi! Terakhir kita bahas "{topic}". Mau lanjut dari situ, atau tanya hal lain?',
      en: 'Welcome back! Last time we talked about "{topic}". Continue there, or ask something new?'
    },
    greetingTime: {
      pagi: { id: 'Selamat pagi', en: 'Good morning' },
      siang: { id: 'Selamat siang', en: 'Good afternoon' },
      sore: { id: 'Selamat sore', en: 'Good evening' },
      malam: { id: 'Selamat malam', en: 'Good evening' }
    },
    repeatAgain: {
      id: 'Tadi aku sudah jawab soal "{topic}". Ketik "jelaskan lagi" kalau mau diulang versi lengkapnya, atau tanya hal lain ya.',
      en: 'I already covered "{topic}". Type "explain more" for the full version again, or ask something else.'
    },
    status: {
      idle: { id: 'Online • Respon instan', en: 'Online • Instant response' },
      listening: { id: 'Asisten menyimak', en: 'The assistant is listening' },
      thinking: { id: 'Sedang menyiapkan jawaban', en: 'Preparing an answer' },
      speaking: { id: 'Sedang menjawab', en: 'Answering now' }
    },
    bubble: {
      idle: [
        { id: 'Hai! Mau tanya harga?', en: 'Hi! Curious about pricing?' },
        { id: 'Butuh website atau servis laptop?', en: 'Need a website or laptop repair?' },
        { id: 'Klik aku, tanya apa saja', en: 'Click me, ask me anything' }
      ],
      listening: { id: 'Aku dengar, tanya apa saja.', en: 'I am listening, ask away.' },
      thinking: { id: 'Sebentar, aku cek dulu.', en: 'One moment, checking.' },
      speaking: { id: 'Ini jawabanku, cek chat ya.', en: 'Here is my answer, check the chat.' }
    },
    cta: { id: 'Tanya Asisten', en: 'Ask the Assistant' },
    ctaOpen: { id: 'Tutup chat asisten', en: 'Close assistant chat' },
    robotLabel: { id: 'Buka chat asisten Nexus Diji', en: 'Open the Nexus Diji assistant chat' },
    voiceOn: { id: 'Matikan suara asisten', en: 'Mute the assistant voice' },
    voiceOff: { id: 'Nyalakan suara asisten', en: 'Turn on the assistant voice' },
    inputPlaceholder: { id: 'Ketik pesan...', en: 'Type a message...' },
    you: { id: 'Kamu', en: 'You' },
    bot: { id: 'Robot ND', en: 'Robot ND' },
    waLabel: { id: 'Lanjutkan di WhatsApp', en: 'Continue on WhatsApp' },
    waAsk: { id: 'Tanya tim via WhatsApp', en: 'Ask the team on WhatsApp' },
    fallbackCta: { id: 'Halo Nexus Diji, saya ingin bertanya: ', en: 'Hello Nexus Diji, I would like to ask: ' }
  };

  /* ══════════════════════════════════════════════════════════════
     4. INTENT MATCHING
     ══════════════════════════════════════════════════════════════ */
  function scoreIntent(item, norm, inputTokens) {
    let score = 0;
    item.phrases.forEach((phrase) => {
      if (norm.includes(phrase)) score += phrase.split(' ').length * 1.7;
    });

    let tokenHits = 0;
    const seen = new Set();
    inputTokens.forEach((token) => {
      if (seen.has(token)) return;
      if (item.tokens.includes(token)) {
        seen.add(token);
        tokenHits += 1;
        score += 1.7;
      }
    });

    // Typo tolerance: "hargaa", "websit", "laptp" still land on the right intent.
    inputTokens.forEach((token) => {
      if (seen.has(token) || token.length < 5) return;
      const max = token.length >= 8 ? 2 : 1;
      const fuzzy = item.tokens.some((t) => t.length >= 4 && editDistance(token, t, max) <= max);
      if (fuzzy) {
        seen.add(token);
        score += 0.9;
      }
    });

    return score;
  }

  function resolveIntent(rawText) {
    const norm = strip(rawText);
    if (!norm) return null;
    const inputTokens = norm.split(' ').filter((token) => token.length > 2);
    const contextIds = conversation.section ? SECTION_INTENTS[conversation.section] : null;

    const ranked = KB
      .map((item) => {
        let score = scoreIntent(item, norm, inputTokens);
        // A section only nudges questions the words alone would miss.
        if (contextIds && score > 0 && score < 3.4 && contextIds.indexOf(item.id) !== -1) {
          score += 1.2;
        }
        return { item, score };
      })
      .sort((a, b) => (b.score - a.score)
        || ((TOPIC_IGNORE[a.item.id] ? 1 : 0) - (TOPIC_IGNORE[b.item.id] ? 1 : 0)));

    const best = ranked[0];
    const second = ranked[1];
    if (!best || best.score < 1.6) {
      // "Kalau yang itu berapa?" stays on the topic already under discussion.
      if (conversation.lastIntent && /\b(itu|tadi|tersebut|lanjut)\b/.test(norm)) return conversation.lastIntent;
      // Bare "berapa" while reading the pricing area means the pricing question.
      if (contextIds && contextIds.indexOf('harga_umum') !== -1 && /^(berapa|brp)\b/.test(norm)) {
        return BY_ID.harga_umum;
      }
      return null;
    }

    // Ambiguous between two intents of the same price group: answer the group.
    if (second && second.score >= best.score * 0.7) {
      if (best.item.group && best.item.group === second.item.group) return best.item;
      if (best.score < 3.2) return null;
    }
    return best.item;
  }

  /* ══════════════════════════════════════════════════════════════
     5. UI PLUMBING (assistant-facing strings)
     ══════════════════════════════════════════════════════════════ */
  const lang = () => (document.documentElement.dataset.language === 'en' ? 'en' : 'id');
  const t = (pair) => (pair ? pair[lang()] || pair.id : '');

  function timeSlot() {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'pagi';
    if (hour >= 11 && hour < 15) return 'siang';
    if (hour >= 15 && hour < 19) return 'sore';
    return 'malam';
  }

  // Greeting blends the time of day with what this visitor asked before.
  function greetingText() {
    const greet = t(UI.greetingTime[timeSlot()]);
    const topicId = memory.data.lastIntent;
    const topic = topicId && !TOPIC_IGNORE[topicId] && memory.timesAsked(topicId) > 0 ? BY_ID[topicId] : null;
    if (memory.returning && topic) {
      return fill(t(UI.greetingReturn), { topic: t(topic.label).toLowerCase() });
    }
    return fill(t(UI.greetingNew), { greet });
  }

  // Repeat visitors see their most-asked topic as the first quick reply.
  function startChips() {
    const list = START_CHIPS.slice();
    const top = memory.topInterest();
    if (top && list.indexOf(top) !== -1) {
      list.splice(list.indexOf(top), 1);
      list.unshift(top);
    }
    return list;
  }

  const els = {
    stage: document.getElementById('assistantStage'),
    robotBtn: document.getElementById('assistantRobotBtn'),
    bubble: document.getElementById('assistantBubble'),
    cta: document.getElementById('assistantOpenBtn'),
    popup: document.getElementById('chatPopup'),
    body: document.getElementById('chatBody'),
    options: document.getElementById('chatOptions'),
    input: document.getElementById('chatInput'),
    send: document.getElementById('chatSendBtn'),
    voice: document.getElementById('chatVoiceBtn'),
    status: document.getElementById('chatStatusText'),
    live: document.getElementById('chatLive'),
    chatTrigger: document.getElementById('overlayChatBtn')
  };

  if (!els.popup || !els.body) return;

  const conversation = {
    busy: false,
    streamTimer: null,
    typingNode: null,
    lastIntent: null,
    counts: {},
    section: null,
    opened: false
  };

  function setState(state) {
    if (els.stage) els.stage.dataset.state = state;
    els.popup.dataset.state = state;
    if (els.status) els.status.textContent = t(UI.status[state] || UI.status.idle);
    renderBubble(state);
  }

  function scrollChat() {
    els.body.scrollTop = els.body.scrollHeight;
  }

  function announce(text) {
    if (els.live) els.live.textContent = text;
  }

  function makeBubble({ from, html, isRich }) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble' + (from === 'user' ? ' user-bubble' : '');
    const meta = document.createElement('span');
    meta.className = 'chat-bubble__from';
    meta.textContent = from === 'user' ? t(UI.you) : t(UI.bot);
    bubble.appendChild(meta);
    if (isRich) {
      bubble.insertAdjacentHTML('beforeend', html);
    } else {
      const text = document.createElement('span');
      text.className = 'chat-msg-text';
      text.textContent = html;
      bubble.appendChild(text);
    }
    els.body.appendChild(bubble);
    scrollChat();
    return bubble;
  }

  function showTyping() {
    const node = document.createElement('div');
    node.className = 'chat-bubble chat-typing';
    node.setAttribute('aria-hidden', 'true');
    node.innerHTML = '<span></span><span></span><span></span>';
    els.body.appendChild(node);
    scrollChat();
    conversation.typingNode = node;
  }

  function hideTyping() {
    if (conversation.typingNode) {
      conversation.typingNode.remove();
      conversation.typingNode = null;
    }
  }

  function streamAnswer(text, onDone, clipKey) {
    const bubble = makeBubble({ from: 'bot', html: '' });
    const target = bubble.querySelector('.chat-msg-text');
    const words = text.split(/(\s+)/).filter((chunk) => chunk.length);
    let index = 0;
    const perWord = Math.max(14, Math.min(26, Math.round(2400 / Math.max(1, words.length))));

    conversation.busy = true;
    setState('speaking');
    speak(text, clipKey);

    const finish = () => {
      clearInterval(conversation.streamTimer);
      conversation.streamTimer = null;
      target.textContent = text;
      scrollChat();
      conversation.busy = false;
      announce(text);
      if (onDone) onDone(bubble);
    };

    conversation.finishStream = finish;

    conversation.streamTimer = setInterval(() => {
      if (index >= words.length) {
        finish();
        return;
      }
      target.textContent += words[index];
      index += 1;
      if (index % 3 === 0) scrollChat();
    }, perWord);
  }

  function finishActiveStream() {
    if (conversation.streamTimer && conversation.finishStream) {
      conversation.finishStream();
    }
  }

  function renderLinks(links) {
    if (!links || !links.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'chat-links';
    links.forEach((link) => {
      const anchor = document.createElement('a');
      anchor.className = 'chat-link-btn';
      anchor.href = /^https?:/.test(link.href) ? link.href : ROOT + link.href;
      if (link.external || /^https?:/.test(link.href)) {
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
      }
      anchor.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      anchor.appendChild(document.createTextNode(t(link.label)));
      wrap.appendChild(anchor);
    });
    els.body.appendChild(wrap);
    scrollChat();
  }

  function renderWaButton(message, label) {
    const anchor = document.createElement('a');
    anchor.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    anchor.className = 'chat-wa-btn';
    anchor.innerHTML = '<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
    anchor.appendChild(document.createTextNode(label || t(UI.waLabel)));
    els.body.appendChild(anchor);
    scrollChat();
  }

  function renderFollowUps(ids) {
    if (!els.options) return;
    const items = (ids || []).map((id) => BY_ID[id]).filter(Boolean);
    if (!items.length) return;
    els.options.innerHTML = '';
    items.forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chat-opt-btn';
      button.dataset.intent = item.id;
      button.textContent = t(item.label);
      els.options.appendChild(button);
    });
    els.options.style.display = '';
  }

  // Follow-up line that ties a pricing question to the need the visitor
  // mentioned earlier, using only facts already stated on the site.
  const TAILS = {
    toko: {
      when: ['harga_website', 'harga_umum'],
      text: { id: 'Karena tadi kamu sebut toko online: paket Profesional sudah termasuk CMS untuk mengelola produk.', en: 'Since you mentioned an online store: the Professional plan already includes a CMS to manage products.' }
    },
    profile: {
      when: ['harga_website', 'harga_umum'],
      text: { id: 'Karena tadi kamu sebut company profile: paket Profesional (Rp 2.000.000) mencakup website multi-halaman dan CMS.', en: 'Since you mentioned a company profile: the Professional plan (IDR 2M) covers a multi-page site and a CMS.' }
    },
    landing: {
      when: ['harga_website', 'harga_umum'],
      text: { id: 'Karena tadi kamu cari landing page: paket Starter Rp 500.000 sudah cukup untuk satu halaman promosi.', en: 'Since you were after a landing page: the Starter plan at IDR 500k covers one promo page.' }
    },
    blog: {
      when: ['harga_website', 'harga_umum'],
      text: { id: 'Karena tadi kamu sebut blog: CMS di paket Profesional memudahkan update artikel.', en: 'Since you mentioned a blog: the CMS in the Professional plan makes posting articles easy.' }
    },
    app: {
      when: ['harga_umum', 'durasi'],
      text: { id: 'Karena tadi kamu sebut aplikasi: sistem custom masuk paket Enterprise dengan integrasi API dan database.', en: 'Since you mentioned an app: custom systems sit in the Enterprise plan with API and database integration.' }
    }
  };

  function personalTail(intent) {
    const need = memory.recentNeed();
    const rule = need ? TAILS[need] : null;
    if (!rule || rule.when.indexOf(intent.id) === -1) return null;
    return rule.text;
  }

  function repeatReply(intent) {
    return fill(t(UI.repeatAgain), { topic: t(intent.label).toLowerCase() });
  }

  const EXPLAIN_RE = /^(jelaskan|jelasin|jelaskan lagi|ulangi|ulang|repeat|lebih detail|lebih lengkap|lengkapnya|detail dong|kasih detail|explain|more detail|in detail)/;

  function askIntent(intent, opts) {
    const options = opts || {};
    conversation.busy = true;
    setState('thinking');
    showTyping();

    let text;
    if (options.repeat) {
      text = repeatReply(intent);
    } else {
      text = t(intent.answer);
      if (!options.full) {
        const tail = personalTail(intent);
        if (tail) text += ' ' + t(tail);
      }
    }

    // A recorded clip is only safe when the spoken line is exactly the
    // canonical answer: no personal tail and no repeat recap.
    const canonical = t(intent.answer);
    const clipKey = !options.repeat && text === canonical
      ? 'answer.' + intent.id + '.' + lang()
      : null;

    const wait = 320 + Math.min(520, text.split(' ').length * 6);

    setTimeout(() => {
      hideTyping();
      streamAnswer(text, () => {
        if (intent.links) renderLinks(intent.links);
        if (intent.cta) {
          const message = t(intent.cta);
          if (intent.id === 'fallback') {
            renderWaButton(message, t(UI.waAsk));
          } else {
            renderWaButton(message);
          }
          setMood('cheer', 1000);
        }
        renderFollowUps(intent.follow);
        const stillTalking = voice.isSpeaking();
        setState(stillTalking ? 'speaking' : 'listening');
        if (els.input) els.input.focus({ preventScroll: true });
      }, clipKey);
    }, wait);
  }

  function handleUserMessage(rawText) {
    const text = String(rawText || '').trim();
    if (!text) return;

    finishActiveStream();
    clearHint();
    makeBubble({ from: 'user', html: text });
    announce(text);
    setMood('nod', 700);

    const norm = strip(text);
    noteNeedFrom(norm);

    let intent = resolveIntent(text);
    let options = null;
    if (!intent && conversation.lastIntent && EXPLAIN_RE.test(norm)) {
      intent = conversation.lastIntent;
      options = { full: true };
    }
    if (!intent) {
      memory.noteUnknown(text);
      const fallback = Object.assign({}, FALLBACK, {
        cta: {
          id: UI.fallbackCta.id + text.slice(0, 180),
          en: UI.fallbackCta.en + text.slice(0, 180)
        }
      });
      askIntent(fallback);
      return;
    }

    // Same topic twice in one conversation: recap instead of repeating a wall
    // of text, and offer the full version on request.
    const seen = conversation.counts[intent.id] || 0;
    conversation.counts[intent.id] = seen + 1;
    if (seen > 0 && !options && !TOPIC_IGNORE[intent.id]) options = { repeat: true };

    conversation.lastIntent = intent;
    if (!TOPIC_IGNORE[intent.id]) memory.noteIntent(intent.id);
    askIntent(intent, options);
  }

  // Quick-reply chips know the intent already, so they skip matching and
  // log straight into the same repeat/topic bookkeeping.
  function askExplicit(intent, label) {
    finishActiveStream();
    clearHint();
    makeBubble({ from: 'user', html: label });
    announce(label);
    setMood('nod', 700);
    const seen = conversation.counts[intent.id] || 0;
    conversation.counts[intent.id] = seen + 1;
    conversation.lastIntent = intent;
    if (!TOPIC_IGNORE[intent.id]) memory.noteIntent(intent.id);
    askIntent(intent, seen > 0 && !TOPIC_IGNORE[intent.id] ? { repeat: true } : null);
  }

  // Proactive answer after the visitor clicks a context hint bubble: the
  // robot answers the topic for the section they were reading.
  function askProactive(id) {
    const intent = BY_ID[id];
    if (!intent || conversation.busy) return;
    const seen = conversation.counts[id] || 0;
    conversation.counts[id] = seen + 1;
    conversation.lastIntent = intent;
    if (!TOPIC_IGNORE[id]) memory.noteIntent(id);
    askIntent(intent, seen > 0 ? { repeat: true } : null);
  }

  /* ══════════════════════════════════════════════════════════════
     6. VOICE (recorded clips, browser voice fallback)
     ══════════════════════════════════════════════════════════════ */

  // Recorded answers in the brand voice. Only canonical answers are listed
  // here; dynamic lines (personal tails, repeat recaps) always use the
  // browser voice so a clip can never read the wrong script.
  // Filenames follow <intent>-<lang>.mp3 in assets/audio/assistant/.
  const VOICE_CLIPS = {
    // 'answer.harga_website.id': 'harga_website-id.mp3',
  };

  const voice = {
    enabled: true,
    supported: 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined',
    clip: null,
    utter: null,
    active: false,
    speak(text, clipKey) {
      if (!text || !this.enabled) return;
      this.stop();
      if (clipKey && this.playClip(clipKey, text)) return;
      this.speakText(text);
    },
    // Returns true when a clip takes over. A missing or broken file falls
    // back to the browser voice with the same text, never silence.
    playClip(key, fallbackText) {
      const file = VOICE_CLIPS[key];
      if (!file) return false;
      const audio = new Audio(CLIP_ROOT + file);
      this.clip = audio;
      this.active = true;
      audio.onended = () => {
        if (this.clip !== audio) return;
        this.clip = null;
        this.active = false;
        if (!conversation.busy) setState('listening');
      };
      audio.onerror = () => {
        if (this.clip !== audio) return;
        this.clip = null;
        this.active = false;
        this.speakText(fallbackText);
      };
      let started = null;
      try {
        started = audio.play();
      } catch (error) {
        this.clip = null;
        this.active = false;
        this.speakText(fallbackText);
        return true;
      }
      if (started && typeof started.catch === 'function') {
        started.catch(() => {
          if (this.clip !== audio) return;
          this.clip = null;
          this.active = false;
          this.speakText(fallbackText);
        });
      }
      return true;
    },
    speakText(text) {
      if (!this.supported) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text.replace(/\s+/g, ' '));
        const target = lang();
        utter.lang = target === 'en' ? 'en-US' : 'id-ID';
        utter.rate = 1.02;
        utter.pitch = 1.05;
        const match = pickVoice(target);
        if (match) utter.voice = match;
        utter.onend = () => this.finishSpeech(utter);
        utter.onerror = () => this.finishSpeech(utter);
        this.utter = utter;
        this.active = true;
        window.speechSynthesis.speak(utter);
      } catch (error) {
        this.utter = null;
        this.active = false;
      }
    },
    finishSpeech(utter) {
      if (this.utter !== utter) return;
      this.utter = null;
      this.active = false;
      if (!conversation.busy) setState('listening');
    },
    isSpeaking() {
      if (this.active) return true;
      return this.supported && window.speechSynthesis.speaking;
    },
    stop() {
      this.active = false;
      this.utter = null;
      if (this.clip) {
        try { this.clip.pause(); } catch (error) { /* noop */ }
        this.clip = null;
      }
      if (!this.supported) return;
      try { window.speechSynthesis.cancel(); } catch (error) { /* noop */ }
    }
  };

  function pickVoice(target) {
    if (!voice.supported) return null;
    const list = window.speechSynthesis.getVoices() || [];
    const wanted = target === 'en' ? 'en' : 'id';
    const primary = list.find((item) => item.lang && item.lang.toLowerCase().startsWith(wanted));
    if (primary) return primary;
    return list.find((item) => item.lang && item.lang.toLowerCase().startsWith('en')) || null;
  }

  function syncVoiceButton() {
    if (!els.voice) return;
    els.voice.setAttribute('aria-pressed', String(voice.enabled));
    els.voice.setAttribute('aria-label', voice.enabled ? t(UI.voiceOn) : t(UI.voiceOff));
    els.voice.setAttribute('title', voice.enabled ? t(UI.voiceOn) : t(UI.voiceOff));
  }

  function loadVoicePreference() {
    try {
      const stored = localStorage.getItem(VOICE_KEY);
      if (stored === 'off') voice.enabled = false;
      if (stored === 'on') voice.enabled = true;
    } catch (error) { /* storage may be blocked */ }
  }

  if (els.voice) {
    loadVoicePreference();
    syncVoiceButton();
    els.voice.addEventListener('click', () => {
      voice.enabled = !voice.enabled;
      if (!voice.enabled) voice.stop();
      try { localStorage.setItem(VOICE_KEY, voice.enabled ? 'on' : 'off'); } catch (error) { /* noop */ }
      syncVoiceButton();
    });
  }

  if (voice.supported && typeof window.speechSynthesis.addEventListener === 'function') {
    window.speechSynthesis.addEventListener('voiceschanged', () => { /* voices arrive late in some browsers */ });
  }

  function speak(text, clipKey) {
    voice.speak(text, clipKey);
  }

  /* ══════════════════════════════════════════════════════════════
     7. ROBOT STAGE (tilt, bubble, moods, context hints)
     ══════════════════════════════════════════════════════════════ */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let bubbleIndex = 0;
  let bubbleTimer = null;
  let hintSection = null;
  let hintUntil = 0;
  let hintIntent = null;
  let hintShown = 0;
  let sectionAt = 0;
  let pendingAsk = null;
  let moodTimer = null;
  let pointerInside = false;
  let lookTimer = null;
  const seenSections = new Set();

  // The static intro bubble in the markup is the no-JS fallback; once the
  // brain is live it shows the time/returning-visitor greeting instead.
  function renderIntro() {
    if (!els.body || conversation.lastIntent) return;
    if (els.body.querySelector('.user-bubble')) return;
    const node = els.body.querySelector('.chat-bubble');
    if (!node) return;
    const text = greetingText();
    if (node.textContent.trim() !== text) node.textContent = text;
  }

  function currentHintText() {
    if (!hintSection || Date.now() >= hintUntil) return null;
    return t(HINTS[hintSection].text);
  }

  function clearHint() {
    hintSection = null;
    hintUntil = 0;
    hintIntent = null;
  }

  // Context-aware bubble: after the visitor spends a moment in a section the
  // robot reacts to what they are reading. Once per section, four per visit.
  function showHint(section) {
    if (!els.bubble || !HINTS[section] || hintShown >= 4) return false;
    if (Date.now() < hintUntil) return false;
    if (conversation.busy || els.popup.classList.contains('open')) return false;
    if (els.stage && els.stage.dataset.state !== 'idle') return false;
    hintSection = section;
    hintUntil = Date.now() + 12000;
    hintIntent = HINTS[section].intent || null;
    hintShown += 1;
    renderBubble('idle');
    return true;
  }

  function maybeHint() {
    const section = conversation.section;
    if (!section || !HINTS[section] || seenSections.has(section)) return;
    if (Date.now() - sectionAt > 120000) return;
    if (!showHint(section)) return;
    seenSections.add(section);
  }

  // The robot is at the top of the page, so the hint fires when it scrolls
  // back into view: it picks up the topic of the section just browsed.
  function initStageWatch() {
    if (!('IntersectionObserver' in window) || !els.stage) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry && entry.isIntersecting && entry.intersectionRatio >= 0.5) maybeHint();
    }, { threshold: [0.5] });
    observer.observe(els.stage);
  }

  function initContextWatch() {
    if (!('IntersectionObserver' in window)) return;
    const ids = Object.keys(HINTS).concat(['testimonials']);
    const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!nodes.length) return;
    const ratios = new Map();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });
      let best = null;
      let bestRatio = 0.3;
      ratios.forEach((ratio, id) => {
        if (ratio >= bestRatio) {
          bestRatio = ratio;
          best = id;
        }
      });
      if (!best || best === conversation.section) return;
      conversation.section = best;
      sectionAt = Date.now();
      memory.noteSection(best);
    }, { threshold: [0.3, 0.55, 0.8], rootMargin: '-8% 0px -18% 0px' });
    nodes.forEach((node) => observer.observe(node));
  }

  // Mood = short micro-expression on the mascot. It plays on top of the idle
  // float animation (see assistant.css section 7) and clears itself.
  function setMood(name, ms) {
    if (!els.stage || reduceMotion.matches) return;
    els.stage.dataset.mood = name;
    if (moodTimer) clearTimeout(moodTimer);
    moodTimer = setTimeout(() => {
      moodTimer = null;
      if (els.stage) delete els.stage.dataset.mood;
    }, ms || 900);
  }

  // Idle micro-behaviour: with nobody pointing at the robot it still glances
  // around once in a while, so the hero does not feel like a still image.
  function initLookAround() {
    if (!finePointer.matches || reduceMotion.matches || lookTimer) return;
    lookTimer = setInterval(() => {
      if (document.hidden || pointerInside || conversation.busy) return;
      if (els.popup.classList.contains('open')) return;
      if (els.stage.dataset.state !== 'idle') return;
      const rect = els.stage.getBoundingClientRect();
      if (!rect.width || rect.bottom < 40 || rect.top > window.innerHeight - 40) return;
      els.stage.style.setProperty('--assist-tilt-y', (Math.random() * 12 - 6).toFixed(1) + 'deg');
      els.stage.style.setProperty('--assist-tilt-x', (Math.random() * -3).toFixed(1) + 'deg');
      setTimeout(() => {
        if (pointerInside) return;
        els.stage.style.setProperty('--assist-tilt-y', '0deg');
        els.stage.style.setProperty('--assist-tilt-x', '0deg');
      }, 1500);
    }, 7000);
  }

  function renderBubble(state) {
    if (!els.bubble) return;
    const hint = state === 'idle' ? currentHintText() : null;
    const entry = UI.bubble[state];
    let text;
    if (hint) {
      text = hint;
    } else if (Array.isArray(entry)) {
      text = t(entry[bubbleIndex % entry.length]);
    } else {
      text = t(entry);
    }
    if (els.bubble.textContent !== text) {
      els.bubble.classList.add('is-swapping');
      setTimeout(() => {
        els.bubble.textContent = text;
        els.bubble.classList.remove('is-swapping');
      }, 180);
    }
  }

  function cycleBubble() {
    if (!els.bubble) return;
    if (document.hidden) return;
    if (hintUntil) {
      if (Date.now() < hintUntil) return;
      clearHint();
    }
    if (els.stage && els.stage.dataset.state !== 'idle') return;
    bubbleIndex += 1;
    renderBubble('idle');
  }

  function initStage() {
    if (!els.stage) return;
    renderBubble('idle');
    bubbleTimer = setInterval(cycleBubble, 8000);

    if (finePointer.matches && !reduceMotion.matches) {
      let frame = 0;
      const visual = els.stage.parentElement || els.stage;
      const update = (event) => {
        frame = 0;
        const rect = els.stage.getBoundingClientRect();
        if (!rect.width) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = Math.max(-1, Math.min(1, (event.clientX - cx) / (rect.width * 0.85)));
        const dy = Math.max(-1, Math.min(1, (event.clientY - cy) / (rect.height * 1.2)));
        els.stage.style.setProperty('--assist-tilt-y', (dx * 7).toFixed(2) + 'deg');
        els.stage.style.setProperty('--assist-tilt-x', (-dy * 5).toFixed(2) + 'deg');
      };
      const schedule = (event) => {
        if (!frame) frame = requestAnimationFrame(() => update(event));
      };
      visual.addEventListener('pointermove', schedule, { passive: true });
      visual.addEventListener('pointerenter', () => { pointerInside = true; });
      visual.addEventListener('pointerleave', () => {
        pointerInside = false;
        els.stage.style.setProperty('--assist-tilt-y', '0deg');
        els.stage.style.setProperty('--assist-tilt-x', '0deg');
      });
    }

    // Hovering the robot counts as attention: the halo switches to listening.
    els.stage.addEventListener('pointerenter', () => {
      if (!els.popup.classList.contains('open') && !conversation.busy) setState('listening');
      stopBubbleCycle();
    });
    els.stage.addEventListener('pointerleave', () => {
      if (!els.popup.classList.contains('open') && !conversation.busy) setState('idle');
      startBubbleCycle();
    });

    [els.robotBtn, els.cta].forEach((control) => {
      if (!control) return;
      control.addEventListener('click', () => openChat());
    });

    // The bubble can carry a section hint: clicking it opens the chat and
    // lets the robot answer that hint topic right away.
    if (els.bubble) {
      els.bubble.addEventListener('click', () => {
        const ask = hintIntent;
        clearHint();
        if (ask && els.popup.classList.contains('open')) {
          openChat();
          setTimeout(() => askProactive(ask), 420);
        } else {
          pendingAsk = ask || null;
          openChat();
        }
      });
    }
  }

  function stopBubbleCycle() {
    if (bubbleTimer) { clearInterval(bubbleTimer); bubbleTimer = null; }
  }

  function startBubbleCycle() {
    stopBubbleCycle();
    bubbleTimer = setInterval(cycleBubble, 8000);
  }

  function openChat() {
    if (!els.popup.classList.contains('open') && els.chatTrigger) {
      els.chatTrigger.click();
    }
    setTimeout(() => { if (els.input) els.input.focus({ preventScroll: true }); }, 320);
  }

  function syncCtaState() {
    if (!els.cta) return;
    const open = els.popup.classList.contains('open');
    els.cta.setAttribute('aria-expanded', String(open));
    els.cta.textContent = open ? t(UI.ctaOpen) : t(UI.cta);
    els.cta.setAttribute('aria-label', open ? t(UI.ctaOpen) : t(UI.cta));
    if (els.robotBtn) els.robotBtn.setAttribute('aria-label', t(UI.robotLabel));
    setState(open ? (conversation.busy ? 'speaking' : 'listening') : 'idle');

    if (open && !conversation.opened) {
      conversation.opened = true;
      setMood('greet', 1100);
    }
    if (open && pendingAsk) {
      const ask = pendingAsk;
      pendingAsk = null;
      setTimeout(() => askProactive(ask), 700);
    } else if (!open) {
      pendingAsk = null;
    }
  }

  /* ══════════════════════════════════════════════════════════════
     8. EVENT WIRING
     ══════════════════════════════════════════════════════════════ */
  if (els.send) {
    els.send.addEventListener('click', () => {
      const value = els.input ? els.input.value : '';
      if (els.input) els.input.value = '';
      handleUserMessage(value);
    });
  }

  if (els.input) {
    els.input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      const value = els.input.value;
      els.input.value = '';
      handleUserMessage(value);
    });
  }

  if (els.options) {
    els.options.addEventListener('click', (event) => {
      const button = event.target.closest('.chat-opt-btn');
      if (!button) return;
      const intent = BY_ID[button.dataset.intent];
      if (!intent) return;
      askExplicit(intent, button.textContent.trim());
    });
  }

  // Escape closes the dialog and returns focus to the control that opened it.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!els.popup.classList.contains('open')) return;
    if (conversation.streamTimer) finishActiveStream();
    voice.stop();
    const closer = document.getElementById('chatCloseBtn');
    if (closer) closer.click();
    const back = els.cta || els.chatTrigger;
    if (back) back.focus({ preventScroll: true });
  });

  // Keep the CTA, bubble and status in sync with the popup state, including
  // the case where the chat is opened from the floating tool button.
  new MutationObserver(syncCtaState).observe(els.popup, { attributes: true, attributeFilter: ['class'] });

  // Language switch: the navbar module owns applyLanguage(), so re-render every
  // string this module owns whenever the document language changes.
  new MutationObserver(() => {
    syncCtaState();
    syncVoiceButton();
    if (els.input) els.input.setAttribute('placeholder', t(UI.inputPlaceholder));
    if (els.robotBtn) els.robotBtn.setAttribute('aria-label', t(UI.robotLabel));
    renderBubble((els.stage && els.stage.dataset.state) || 'idle');
    renderIntro();
    if (conversation.lastIntent) renderFollowUps(conversation.lastIntent.follow);
    if (els.options && !els.options.children.length) renderFollowUps(startChips());
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-language'] });

  function init() {
    if (els.input) els.input.setAttribute('placeholder', t(UI.inputPlaceholder));
    if (els.options) {
      els.options.innerHTML = '';
      renderFollowUps(startChips());
    }
    renderIntro();
    initStage();
    initContextWatch();
    initStageWatch();
    initLookAround();
    syncCtaState();
  }

  init();

  // Test hook: lets the verification script drive the brain without a browser UI.
  window.NexusAssistant = {
    ask: handleUserMessage,
    resolve: (text) => {
      const intent = resolveIntent(text);
      return intent ? intent.id : 'fallback';
    },
    state: () => (els.stage ? els.stage.dataset.state : null),
    voice,
    memory: () => JSON.parse(JSON.stringify(memory.data)),
    context: () => ({
      section: conversation.section,
      lastIntent: conversation.lastIntent ? conversation.lastIntent.id : null,
      hint: hintSection
    }),
    answers: () => {
      const out = {};
      KB.concat([FALLBACK]).forEach((item) => {
        out['answer.' + item.id + '.id'] = item.answer.id;
        out['answer.' + item.id + '.en'] = item.answer.en;
      });
      return out;
    },
    clips: VOICE_CLIPS,
    resetMemory: () => memory.reset()
  };
}());
