# Rencana Implementasi: Penyempurnaan Fitur & Pengalaman Pengguna KaiPay iOS

Berikut adalah rencana terstruktur untuk merealisasikan seluruh penyempurnaan yang telah dipilih:

---

## 1. Dynamic Island Interaktif & Dapat Diekspansi (Expandable Live Activity)
- **Komponen**: `src/components/DynamicIsland.tsx` (menggantikan/menyempurnakan `ToastBanner.tsx`).
- **Fitur**:
  - Tampilan kapsul melayang di bagian atas layar dengan animasi *pill expansion* khas iPhone.
  - Keadaan interaktif:
    - **Compact State**: Menampilkan status transaksi, ikon pemindaian QRIS, atau animasi Face ID.
    - **Expanded State**: Dapat diketuk (*tap to expand*) untuk membuka detail transaksi aktif, progres transfer, tombol cepat aksi, atau dismiss.

---

## 2. Kartu Virtual Kai Card 3D dengan Kilau Giroskop & Animasi Balik
- **Komponen**: `src/components/KaiCard3D.tsx` / `BalanceCard.tsx`.
- **Fitur**:
  - Efek rotasi 3D dinamis mengikuti pergerakan kursor mouse (*mouse tilt*) atau sentuhan layar (*touch gyro*).
  - Lapisan kilau holografik (*holographic sheen / metallic reflection*) yang berpendar saat kartu digerakkan.
  - Opsi *Flip Card* untuk melihat bagian belakang kartu virtual (CVV, tanggal kedaluwarsa, nomor kartu masked, chip EMV, dan logo Apple Pay / KaiPay resmi).

---

## 3. Animasi Face ID Autentikasi 3D & Efek Suara Shutter
- **Komponen**: `src/components/FaceIdOverlay.tsx` dan integrasi ke `SendMoneyModal.tsx` & `AuthLockScreen.tsx`.
- **Fitur**:
  - Ikon sensor Face ID khas iPhone dengan animasi pemindaian garis kisi 3D (*mesh grid scan*) yang berubah menjadi tanda centang hijau lembut saat berhasil.
  - Efek suara sintetis shutter kamera/kunci biometrik saat sensor memindai wajah.

---

## 4. Penyempurnaan Kamera QRIS (Mode Zoom 1x & 2x, Riwayat Simpan, & Split Bill)
- **Komponen**: `src/components/QrModal.tsx`, `src/components/SplitBillModal.tsx`, dan `src/utils/storage.ts`.
- **Fitur Baru**:
  - **Pilihan Zoom Lensa (1x & 2x)**:
    - Tombol kapsul `1x` dan `2x` di dalam viewfinder kamera.
    - Menggunakan MediaTrack constraints `zoom` jika didukung kamera perangkat, atau *digital crop transform* mulus pada video feed.
  - **Riwayat Pemindaian QRIS Otomatis**:
    - Setiap pemindaian QRIS berhasil akan dicatat otomatis ke riwayat pemindaian (`qrisScanHistory`).
    - Dilengkapi nama toko, tanggal, waktu, bulan, dan tahun secara akurat (format lengkap Indonesia).
    - Tab/tampilan riwayat scan di dalam QrModal untuk melihat dan membayar ulang kapan saja.
  - **Fitur Split Bill (Bagi Tagihan)**:
    - Setelah memindai QRIS merchant, muncul opsi "Bagi Tagihan (Split Bill)".
    - Pilih teman dari kontak KaiPay, tentukan pembagian (sama rata atau nominal khusus), dan hitung tagihan per orang secara otomatis dengan tautan pembayaran instan.

---

## 5. Efek Suara Autentik Apple Pay ("Chime Ding-Ding")
- **Komponen**: `src/utils/sound.ts`.
- **Fitur**:
  - Sintesis audio Web Audio API fidelitas tinggi yang mereproduksi bunyi *double-tone affirmative chime* ("ding-ding" khas Apple Pay) saat pembayaran, transfer, atau scan QRIS berhasil.
  - Bekerja tanpa ketergantungan file eksternal (100% offline & instan).

---

## 6. Unduh Struk Transaksi Digital Format HD
- **Komponen**: `src/components/ReceiptModal.tsx`.
- **Fitur**:
  - Render struk transaksi digital menjadi gambar kanvas resolusi tinggi (High-DPI 2x/3x scale PNG).
  - Tampilan struk bergaya Apple Wallet Receipt dengan detail merchant, nomor referensi transaksi, waktu lengkap, kategori, dan stempel verifikasi keamanan.
  - Tombol "Unduh Gambar Struk HD" langsung menyimpan berkas PNG ke perangkat pengguna.
