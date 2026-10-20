# Suara Robot ND

Folder ini tempat klip suara asisten. Selama klip untuk sebuah jawaban belum
ada, asisten memakai TTS browser seperti sekarang.

## Kapan klip diputar

- Klip hanya dipakai untuk jawaban tetap yang naskahnya sama persis dengan
  entri di `script-pack.json`.
- Jawaban yang ditambah lanjutan personal, ringkasan pengulangan, dan
  pertanyaan yang belum dikenal tetap memakai TTS browser. Jadi suara tidak
  pernah membaca naskah yang salah.
- Kalau file klip hilang atau gagal dimuat, asisten otomatis kembali ke TTS.

## Format file

- MP3, mono, 44.1 kHz, 96 sampai 128 kbps.
- Tanpa musik latar dan tanpa efek. Jeda awal dan akhir cukup tipis.
- Volume konsisten antar klip. Kalau alatnya punya normalisasi, pakai sekitar
  -16 LUFS.
- Nama file: `<intent>-<lang>.mp3`, contoh `harga_website-id.mp3` dan
  `harga_website-en.mp3`. Daftar lengkap ada di `script-pack.json`.

## Dari satu sampel suara

Satu sampel tidak bisa langsung diputar untuk semua jawaban. Supaya suaranya
tetap konsisten, sampel perlu dijadikan klip lewat layanan voice cloning
(misalnya ElevenLabs atau Fish Audio) atau direkam ulang oleh pemilik suara.

1. Unggah sampel ke layanan clone voice. Sampel bersih tanpa musik, idealnya
   1 sampai 3 menit.
2. Tempel naskah dari `script-pack.json` satu per satu, pilih bahasa yang
   sesuai, lalu unduh hasilnya sebagai MP3.
3. Simpan dengan nama file yang tertera di `script-pack.json`.
4. Daftarkan file di blok `VOICE_CLIPS` pada `assets/js/assistant.js`:

   ```js
   const VOICE_CLIPS = {
     'answer.harga_website.id': 'harga_website-id.mp3',
     'answer.harga_website.en': 'harga_website-en.mp3'
   };
   ```

5. Naikkan token cache `assistant.js` di `index.html` supaya perubahan
   langsung terpakai.

## Urutan pengerjaan

Tidak perlu langsung 42 klip. Kerjakan yang paling sering ditanya dulu:

1. `greeting`, `layanan`, `jenis_website`, `harga_website`
2. `harga_servis`, `durasi`, `konsultasi`, `portofolio`
3. Sisanya, lalu `fallback` kalau mau semua jawaban konsisten.

Versi Indonesia dulu, versi Inggris menyusul. Selama klip EN belum ada,
jawaban EN tetap memakai TTS.

## Cek cepat

1. Buka `index.html` lewat server lokal.
2. Klik Robot ND, lalu tanyakan topik yang klipnya sudah dipasang.
3. Suara harus berasal dari klip. Kalau yang keluar suara browser, cek nama
   file di `VOICE_CLIPS` dan tab Network untuk error 404.
4. Tombol speaker di header mematikan klip dan TTS sekaligus.

## Catatan

- Klip diputar lewat elemen audio, jadi baru berbunyi setelah pengunjung
  berinteraksi (kirim pesan, klik chip, atau klik hint). Ini mengikuti
  kebijakan autoplay browser.
- Semua klip disajikan dari origin yang sama. Tidak ada request ke layanan
  pihak ketiga saat runtime.
- Kalau naskah jawaban di `assistant.js` berubah, klip lama tidak otomatis
  ikut berubah. Ganti klipnya atau hapus entrinya dari `VOICE_CLIPS`, lalu
  perbarui `script-pack.json`.
