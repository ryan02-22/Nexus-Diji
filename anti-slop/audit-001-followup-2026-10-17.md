# Tindak Lanjut Audit 001 - Nexus Diji

Tanggal: 17 Oktober 2026
Cakupan: 14 temuan HIGH `audit-001-2026-10-17.md` + 1 permintaan tambahan dari pemilik proyek (project undangan masuk ke section portofolio).
Mode: perbaikan saja. Hanya nomor yang disetujui (HIGH 1-14) yang disentuh; MEDIUM/LOW tidak diubah.
Metode verifikasi: inspeksi ulang statis (scan regex), Chrome headless via CDP (runtime + screenshot), cek kontras terhitung.

## Ringkasan

| # | Temuan | Status | Ringkas |
|---|--------|--------|---------|
| 1 | Tautan nav mati (`#uiux/#branding/#marketing`) | Selesai | 3 tautan submenu dihapus dari 8 halaman |
| 2 | Kontras CTA & teks aksen gagal WCAG AA | Selesai | Token aksen digelapkan, hijau WA diganti, send button digelapkan |
| 3 | Testimoni & statistik tanpa sumber | Selesai | 3 kartu fabrikasi dihapus, angka kontradiktif diganti fakta |
| 4 | Kontrol mati & kode JS mati | Selesai | 2 file JS dihapus, handler console.log dibersihkan, 8 indikator mati dihapus |
| 5 | Carousel autoplay tanpa kontrol + bajak panah | Selesai | Tombol pause ditambah, guard keyboard + reduced-motion |
| 6 | Mega menu hanya hover | Selesai | `:focus-within` + aria-expanded/haspopup + Escape |
| 7 | Focus indicator hilang | Selesai | 3 titik outline dipulihkan (stage dot, chat input x2) |
| 8 | Counter tentang-kami permanen "0" | Selesai | Statis 24h/3+/2; nilai awal stat hero juga diperbaiki |
| 9 | H1 index kosong di HTML | Selesai | Teks statis di HTML; presentasi disisakan 1 H1 |
| 10 | Em dash di copy | Selesai | 0 sisa di html/css/js |
| 11 | Kontradiksi domain | Selesai | Semua canonical/og/JSON-LD/footer ke `nexus-diji.vercel.app` |
| 12 | Sitemap 1 URL | Selesai | 12 URL publik, lastmod 2026-10-17 |
| 13 | First load ~4.9 MB | Selesai | 2.png 3.0MB -> 72KB, logo 973KB -> 63KB, ikon baru, tim+portfolio dikompres |
| 14 | og:image hilang | Selesai | og-image.png 1200x630 + twitter:image di index |

Hasil: 14/14 HIGH selesai. Ringkasan git: 44 file berubah, 4 file dihapus, 8 file baru.
Robot.txt dibiarkan apa adanya (sudah menunjuk sitemap di host vercel).

## Rincian per temuan

### 1. Tautan nav mati
- Sebelum: submenu mobile "Layanan" menautkan `layanan.html#uiux`, `#branding`, `#marketing` yang tidak ada sectionnya di 8 halaman.
- Sesudah: ketiga item dihapus dari submenu (index + blog, harga, kontak, layanan, portfolio, tentang-kami, tim-kami). Tautan "Layanan" itu sendiri tetap (menuju halaman layanan).
- Verifikasi: query `a[href*="#uiux"], a[href*="#branding"], a[href*="#marketing"]` = 0 di seluruh halaman.

### 2. Kontras CTA dan teks aksen
- Sebelum: putih di `#00b4d8` = 2.46:1; aksen `#00b4d8` di bg terang = 2.11-2.46:1; ikon putih di hijau WA `#25d366` = 1.98:1.
- Sesudah (rasio dihitung `contrast-check.py`):
  - `--accent`: `#00b4d8` -> `#006e99` (4.87:1 di `#EAEEF0`, 5.69:1 di putih).
  - `--accent2`: `#9b5de5` -> `#7c3aed` (5.70:1 dengan putih). `--grad` otomatis memakai keduanya.
  - Token baru `--accent-on-dark: #67e8f9` (13.44:1 di `#0c0c14`) untuk teks aksen di panel chat gelap.
  - Tombol/ikon WhatsApp: `#25d366` -> `#0f7a41` (5.41:1 dengan putih), hover `#0c6b39` (6.61:1). Berlaku untuk `.chat-wa-btn`, `.wa-float`, CTA `pages.css`.
  - `.chat-send-btn` gradient start -> `#0077b6` (4.87:1 dengan ikon putih).
  - Token disalin di `variables.css`, `main.css`, `blog.css`, dan `:root` inline `privacy.html`.
  - `.chat-online-dot` tetap `#25d366` (dot dekoratif, bukan teks/kontrol).
- Verifikasi browser (getComputedStyle): `--accent = #006e99`, `--accent2 = #7c3aed`, `.btn-primary` gradient `rgb(0,110,153) -> rgb(124,58,237)`, `.chat-send-btn` gradient `rgb(0,119,182) -> rgb(124,58,237)`.
- Catatan: `#00b4d8`/`#9b5de5` masih ada sebagai dekorasi (gradient SVG ikon roket di index, variabel lama `--nd-cyan/--nd-violet` di site-polish.css, latar avatar team.css). Bukan teks/kontrol, jadi di luar temuan.

### 3. Testimoni & statistik tanpa sumber
- Sebelum: 4 kartu testimoni fiktif (AR/SR/BP) di index + tentang-kami; statistik saling bertentangan (100+ / 50+ / 100% / "< 7 hari" vs FAQ "3-5 hari").
- Sesudah:
  - Hanya kartu Faryta Studio (klien nyata) yang tersisa di kedua halaman; grid otomatis men-center kartu tunggal (`:has`).
  - "100+ Klien Puas" dihapus; "50+ Proyek Selesai" -> "3 / Layanan Utama"; "100% Kepuasan Klien" dihapus (hero kini 2 stat); floating card "Satisfaction 100%" -> "Konsultasi / Gratis"; "Launch < 7 Hari" -> "Launch 3-5 Hari" (konsisten dengan FAQ).
  - CTA social proof diganti kalimat jujur tanpa avatar: "Butuh lihat hasil dulu? Semua proyek yang kami kerjakan bisa kamu cek di halaman Portfolio kami."
  - Trust stat tentang-kami jadi statis: "24h Respons Time / 3+ Layanan Tersedia / 2 Founder Terlibat".
- Verifikasi: DOM menampilkan 1 kartu testimoni per halaman; teks floating card dicek via CDP.

### 4. Kontrol mati & kode JS mati
- `assets/js/portfolio.js` dan `assets/js/about.js` dihapus (file + tag script).
- Handler `console.log` mati (`.blog-link`, `.pricing-cta`, `.tool-btn`, `.promo-banner a`) dihapus dari `ui-utils.js`.
- Blok legacy `.portfolio-marquee-track` dihapus dari `marquee.js`.
- 8 panah `.service-card__action-indicator` non-link di `portfolio.html` dihapus; 1 yang tersisa adalah kartu Faryta yang benar-benar punya link (gold).
- Verifikasi: scan tag script `portfolio.js/about.js` = 0; jumlah indikator = 1.

### 5. Carousel (WCAG 2.2.2 + keyboard)
- Tombol pause `#stagePauseBtn` ditambahkan di bawah stage (aria-pressed, aria-label berganti, ikon swap via `.is-paused`).
- `marquee.js`: dukungan `prefers-reduced-motion` (autoplay berhenti), state `userPaused`, dan guard keydown: skip `input/textarea/select/contenteditable`, wajib stage terlihat di viewport, dan fokus ada di dalam stage atau stage di-hover.
- Verifikasi CDP: klik pause -> `aria-pressed=true`, class `is-paused`; ArrowRight saat fokus di dalam stage -> dot maju (1 -> 2); ArrowRight saat fokus di input -> dot tidak berubah.

### 6. Mega menu keyboard
- CSS: `:focus-within` ditambahkan (4 rule di `mega-menu.css`) sehingga submenu terbuka saat fokus masuk (desktop).
- JS: `aria-haspopup` + `aria-expanded` di-set; `focusin` membuka (aria true + class `open`), `focusout` menutup, `Escape` menutup dan mengembalikan fokus ke trigger.
- Hamburger: `aria-controls="mobileMenu"` ditambahkan di 8 halaman.
- Verifikasi CDP (dengan tab aktif `Page.bringToFront`): fokus trigger -> `aria-expanded=true` + class `open` + submenu `visibility: visible`; Escape -> `aria-expanded=false`.

### 7. Focus indicator
- `.stage-dot:focus-visible` ditambahkan (`site-polish.css`).
- `.chat-footer input:focus` (main.css, dipakai index + subpages) kini punya `outline: 2px solid var(--accent-on-dark)`.
- `#chatInput:focus` di `components.css` (dipakai presentasi.html) juga diberi outline.
- Pill bahasa sudah punya pengganti sebelum audit; tidak diubah.
- Verifikasi: rule `2px solid var(--accent-on-dark)` ditemukan aktif di browser.

### 8. Counter tentang-kami
- Trust stat tentang-kami diganti teks statis ("24h", "3+", "2"); tidak ada lagi `data-count` maupun angka "0".
- Hardening terkait (kelas isu yang sama): nilai awal HTML stat hero index diubah dari `0+`/`0h` menjadi `3+`/`24h`, jadi tetap benar bila JS gagal/mati; animasi counter tetap berjalan saat terlihat.
- Verifikasi CDP: saat load tampil "3+ | 24h" (tanpa JS pun benar), keluar viewport reset by design, kembali lagi ter-animasi ulang.

### 9. H1 index
- H1 kini berisi teks statis di HTML: "Wujudkan / Ide Digital / Kamu." (span), cursor animasi `aria-hidden="true"`.
- Verifikasi tanpa JS (script execution disabled): `typingLine1` = "Wujudkan", `typingLine3` = "Kamu.".
- `presentasi.html`: splash H1 diubah jadi `div.splash-title`; judul slide utama tetap H1. Jumlah `<h1>` di presentasi = 1.

### 10. Em dash
- Diganti koma/titik/tanda kurung di index (hero desc `&mdash;`, promo banner), tentang-kami ("Noval, dari"), tim-kami (title ":"), presentasi (30+ baris), plus key di `translations.js`.
- Verifikasi scan final: 0 karakter `—` di seluruh html/css/js. Nol `&mdash;`/`&ndash;` tersisa.

### 11. Kontradiksi domain
- Semua canonical, og:url, JSON-LD (`@id`, `url`, `logo`, `provider`), dan link footer -> `https://nexus-diji.vercel.app`.
- `robots.txt` sudah menunjuk sitemap vercel (tidak diubah).
- Verifikasi: scan `nexus-diji.com` di semua html/js/css/xml/json = 0.

### 12. Sitemap
- `sitemap.xml` ditulis ulang: 12 URL (homepage + layanan, harga, portfolio, blog, blog-1/2/3, tentang-kami, tim-kami, kontak, privacy), host vercel, lastmod 2026-10-17. `presentasi.html` tidak dimasukkan (bukan halaman konten publik).
- Verifikasi: XML parse OK, 12 URL.

### 13. Berat first load
- `2.png` 2.947 MB (4269x2400) -> 72 KB (384x216); masih dipakai untuk splash/cover presentasi dan logo mega-menu.
- `logo okeh.png` 973 KB -> 63 KB (520x134, navbar).
- Ikon baru dari `2.png` (bbox-trim + padding): `favicon-32.png` (1 KB), `apple-touch-icon.png` (16 KB), `icon-192.png` (18 KB), `icon-512.png` (92 KB). Semua halaman memakai favicon-32 + apple-touch; manifest memakai 192/512; logo JSON-LD memakai icon-512.
- `LOGO FARYTA STUDIO.png` 1241 KB -> 118 KB (512x208).
- Foto tim: 2 PNG (2.4 + 2.1 MB) -> JPEG 800x1200 (132 + 130 KB), referensi HTML diperbarui, PNG lama dihapus.
- JPG portfolio dikompres ulang q82: total 6.4 MB -> 1.46 MB (turun ~77%), termasuk `portfolio-undangan.jpg` baru (118 KB, 1200x896).
- `og-image.png` dibuat (1200x630, 148 KB) dari wordmark di atas kanvas putih.
- Verifikasi: 10/10 gambar kartu termuat di browser, tidak ada console error.

### 14. og:image
- Index kini punya `og:image` + width/height/alt dan `twitter:image` + alt, menunjuk `og-image.png` di domain vercel.

## Permintaan tambahan: project undangan di portofolio
- Kartu carousel index #6: "Yoga & Saylun", badge "Undangan Digital", deskripsi fitur nyata (countdown, jadwal akad & resepsi, galeri momen, form RSVP, amplop digital), link live ke `undangan-pernikahan-yogadansaylun.vercel.app` (tab baru, `noopener noreferrer`). Dot carousel otomatis bertambah jadi 7.
- Kartu baru di grid `pages/portfolio.html` (setelah Dashboard POS Restaurant) memakai pola kartu yang ada + tombol "Kunjungi Situs" nyata (kelas `.service-card__link` baru, gradient `--grad`, teks putih 5.69:1).
- Thumbnail: screenshot asli situs live via Chrome headless, 1200x896, jpg q82.
- Key i18n (`Undangan Digital`, deskripsi kartu, dst) ditambahkan ke `translations.js`.
- Verifikasi: link benar di DOM, kartu tampil di screenshot, gambar termuat (1200x896).

## Catatan (di luar cakupan, tidak diubah)
- MEDIUM/LOW audit tidak disentuh: footer "(c) 2025", `robot-nd.webp` (366 KB), `translations.js` (104 KB), mega-menu tetap mengunduh gambar aside meski panel tersembunyi, meta `apple-mobile-web-app-capable` deprecated (warning console lama).
- Sisa dekoratif `#00b4d8`/`#9b5de5`: gradient SVG ikon roket index, variabel lama `--nd-cyan/--nd-violet` (site-polish.css), latar avatar (team.css). Bukan teks/kontrol.
- File tak terpakai yang sengaja dibiarkan: `3.png` (1.5 MB) dan `logo okeh.original.png` (1.6 MB), kandidat hapus manual.
- Re-encode WebP tidak dilakukan (encoder tidak tersedia di environment; tidak diminta temuan).
- CSS `.cta-avatars` kini tidak terpakai (markup social proof diganti teks), kandidat bersih-bersih berikutnya.
- `presentasi.html` masih memakai `2.png` sebagai favicon (kini 72 KB, dipakai juga untuk splash + cover) - disengaja.
- Reset counter hero ke 0 saat keluar viewport adalah perilaku lama `animations.js` (animasi ulang saat kembali); nilai awal HTML sudah benar tanpa JS.

## Bukti verifikasi runtime (Chrome headless + CDP)
- Toggle pause carousel: `aria-pressed` false -> true, class `is-paused`.
- Guard panah carousel: fokus di stage maju 1 -> 2; fokus di input tetap (tidak dirampas).
- Mega menu: fokus -> `aria-expanded=true` + `open`; Escape -> false.
- H1 tanpa JS: "Wujudkan" + "Kamu." ada di HTML.
- Stat hero: "3+ | 24h" saat load, reset by design saat keluar, ter-animasi ulang saat kembali.
- Portfolio: 10/10 gambar kartu termuat, undangan 1200x896, link undangan benar.
- Subpage: canonical vercel, favicon-32, `aria-controls="mobileMenu"` ada; 0 console error di semua halaman yang diuji.
- Screenshot manual direview: hero desktop + mobile, stage (kartu undangan + tombol pause), testimoni tunggal ter-center, CTA social proof, kartu undangan di portfolio, foto tim JPEG, trust statis.

## Sisa yang tidak bisa diverifikasi dari mesin ini
- Klik-through penuh di browser ber-UI (hover mega menu asli, tap mobile) dan uji screen reader nyata.
- Rekomendasi: buka `https://nexus-diji.vercel.app` setelah deploy, cek 1-2 temuan (kontras tombol, pause carousel, submenu keyboard) dengan Tab.
