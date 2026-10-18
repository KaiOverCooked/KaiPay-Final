# Rencana Implementasi: Sistem QRIS Nyata Multi-Pengguna, OTP WhatsApp, Izin Perangkat, dan Lisensi Play Store

Dokumen ini merinci rencana teknis untuk mengimplementasikan sistem pembayaran QRIS interaktif yang dapat diuji langsung antar-pengguna dengan perpindahan saldo otomatis, alur verifikasi nomor telepon OTP WhatsApp, perizinan kamera dan notifikasi sistem, serta penandatanganan rilis Android (Keystore/Signing) dan lisensi publik siap Play Store.

---

## 1. Arsitektur Transaksi QRIS Antar-Pengguna & Sinkronisasi Saldo Otomatis

### A. Format Standar QRIS (EMVCo / ASPI)
- Mengembangkan pembuat payload QRIS dinamis dan statis standar Indonesia (NMID, Nama Merchant, Kode Kota, Nominal Transaksi, serta Sesi Referensi Unik).
- Format payload QRIS mencakup:
  - ID Pengguna Penerima (Merchant / Rekan)
  - Nomor Telepon Penerima
  - Nominal Tagihan (opsional pada QR statis, otomatis terkunci pada QR dinamis)
  - Kode Sesi / ID Transaksi unik

### B. Sinkronisasi Antar-Tab & Multi-Akun (Cross-Tab Live Sync)
- Menggunakan `BroadcastChannel('kaipay_sync_channel')` dan event listener `window.addEventListener('storage')`.
- Menyediakan **Dua Profil Pengguna Terpisah**:
  1. **Pengguna Utama** (Khaerul - Saldo Awal Rp 2.850.000)
  2. **Merchant / Pengguna B** (Kopi Kenangan Senopati / Rekan B - Saldo Awal Rp 500.000)
- Menyediakan pengalih akun cepat (*Fast Account Switcher*) di bilah atas/pengaturan sehingga pengguna dapat membuka aplikasi di 2 tab browser berbeda untuk menguji transaksi nyata:
  - Tab 1 membuka QR Penerima (Merchant).
  - Tab 2 membuka Pemindai Kamera QRIS (Pengguna Utama).
  - Saat Tab 2 menekan bayar dan autentikasi Face ID/PIN selesai:
    - Saldo Tab 2 langsung terpotong.
    - Sinyal broadcast dikirimkan secara instan ke Tab 1.
    - Saldo Tab 1 bertambah otomatis saat itu juga disertai efek audio Apple Pay dan notifikasi penerimaan dana.

---

## 2. Verifikasi Nomor Telepon & Alur OTP WhatsApp

- **Layar Verifikasi Nomor Telepon iOS**:
  - Input nomor telepon dengan validasi kode negara (+62).
  - Pilihan metode pengiriman OTP: **WhatsApp** (Utama) dan **SMS**.
- **Notifikasi OTP WhatsApp**:
  - Menampilkan banner notifikasi interaktif ala WhatsApp resmi yang menampilkan 6 digit kode OTP dengan tombol "Salin" atau "Isi Otomatis".
  - Tautan langsung `https://wa.me/` untuk opsi pengiriman pesan konfirmasi ke nomor pengguna.
  - Form input 6 digit OTP khas Apple dengan hitung mundur 60 detik (*resend timer*) dan validasi kode.
  - Setelah verifikasi berhasil, nomor telepon mendapatkan badge "Terverifikasi Resmi WhatsApp & Bank Indonesia".

---

## 3. Sistem Perizinan Perangkat Lengkap (Kamera, Notifikasi, Perangkat Sekitar)

- **Izin Kamera**:
  - Modal izin transparan bergaya Apple iOS sebelum mengakses sensor kamera fisik (`navigator.mediaDevices.getUserMedia`).
  - Penanganan status: Diizinkan, Ditolak, atau Kamera Tidak Ditemukan dengan panduan reset izin.
- **Izin Notifikasi Web / Push**:
  - Pemanggilan API native `Notification.requestPermission()`.
  - Mengirim notifikasi sistem asli di bilah notifikasi desktop/ponsel saat pembayaran QRIS berhasil atau saat saldo masuk dari pengguna lain.
- **Simulasi Izin Perangkat Sekitar (*Nearby Devices & Local Network*)**:
  - Dialog izin Apple iOS untuk pendeteksian perangkat sekitar via Bluetooth/Local Network saat melakukan transfer kontak terdekat.

---

## 4. Penandatanganan Rilis Android (Release Signing) & Lisensi Siap Play Store

- **Android Keystore & Release Signing Configuration**:
  - Konfigurasi `signingConfigs` pada `android/app/build.gradle`:
    - Membuat profil signing `release` dengan variabel lingkungan atau file `keystore.properties`.
    - Konfigurasi `buildTypes.release` dengan `signingConfig signingConfigs.release`.
  - Menyediakan skrip pembentukan keystore rilis (`generate-keystore.sh` & petunjuk `keytool`).
- **Pembaruan GitHub Actions (`build-apk.yml`)**:
  - Menambahkan job build Release APK (`app-release.apk`) dan Android App Bundle (`app-release.aab`) yang merupakan format wajib unggah Google Play Store.
- **Tampilan Lisensi & Tanda Tangan Kriptografi Publik**:
  - Layar "Lisensi & Sertifikasi Publik" di menu Pengaturan:
    - Nomor Lisensi Standar QRIS ASPI & Bank Indonesia.
    - Sertifikat Tanda Tangan Digital SHA-256 / Play Console App Signing Certificate fingerprint.
    - Lisensi Open Source (MIT) & Persyaratan Layanan Pengembang Publik.

---

## 5. Rencana Tahapan Eksekusi

1. **Tahap 1: Sinkronisasi Multi-Pengguna & Mesin QRIS Nyata**
   - Buat helper multi-akun di `src/utils/storage.ts` dan modul sinkronisasi `src/utils/sync.ts`.
   - Perbarui `QrModal.tsx` untuk memproduksi barcode QRIS berstandar EMVCo dengan sesi pembayaran live.
   - Hubungkan alur potong saldo pengirim dan penambahan saldo penerima secara otomatis.

2. **Tahap 2: Modal Verifikasi OTP WhatsApp & Alur Registrasi**
   - Buat komponen `OtpVerificationModal.tsx` bergaya Apple iOS dengan banner notifikasi WhatsApp.
   - Hubungkan status verifikasi nomor telepon ke profil pengguna.

3. **Tahap 3: Modul Perizinan Kamera, Notifikasi Sistem & Perangkat Sekitar**
   - Buat komponen dialog izin `DevicePermissionsModal.tsx`.
   - Sambungkan API native `Notification` browser untuk push notifikasi nyata.

4. **Tahap 4: Konfigurasi Keystore Rilis, Lisensi Publik & Workflow Play Store**
   - Konfigurasi `android/app/build.gradle` untuk release signing.
   - Buat layar informasi Lisensi & Sertifikat Tanda Tangan Digital di `src/components/LicenseModal.tsx`.
   - Perbarui `.github/workflows/build-apk.yml` untuk menghasilkan rilis yang ditandatangani.

5. **Tahap 5: Verifikasi & Uji Kompilasi**
   - Jalankan `compile_applet` dan `lint_applet` untuk menjamin tidak ada error.
