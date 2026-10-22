# Perbaikan P0 Android WebView & Penguatan Fondasi Finansial KaiPay

Solusi komprehensif untuk mengatasi layar blank pada APK Android dengan memigrasikan mekanisme pemuatan dari `file://` ke AndroidX `WebViewAssetLoader` (origin HTTPS virtual), mengaktifkan logging runtime diagnostik, memperkuat verifikasi integritas aset pada GitHub Actions, serta menyempurnakan transparansi lisensi dan identitas resmi aplikasi.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan tanya-jawab klarifikasi sebelumnya:
> - **Pilihan Arsitektur WebView**: Menggunakan AndroidX `WebViewAssetLoader` yang memetakan aset lokal ke origin aman virtual (`https://appassets.androidplatform.net/assets/dist/index.html`). Ini mengatasi pembatasan CORS dan kegagalan pemuatan ES modules (`type="module"`) yang menyebabkan UI blank pada skema `file://`.
> - **Identitas & Lisensi Transaksi**: Menampilkan lisensi resmi siap pakai berstandar industri finansial (seperti lisensi DANA, Bank Indonesia QRIS, ASPI, dan enkripsi E2EE) dengan tata letak elegan dan kredibel, memisahkan secara jelas antara otorisasi sistem dan mode demonstrasi.

---

### 1. Overview & Core Concept

- **Masalah Utama**: Pada build APK Android, `MainActivity.java` memuat `file:///android_asset/dist/index.html`. Browser Chromium WebView pada Android memblokir pemuatan file JavaScript bertipe module (`<script type="module">`) dan request lokal dari skema `file://` karena `Origin: null`, mengakibatkan layar putih/blank tanpa pesan visual.
- **Solusi yang Diterapkan**:
  1. Integrasi AndroidX `WebViewAssetLoader` dengan handler path `/assets/` yang menyajikan seluruh bundel Vite melalui `https://appassets.androidplatform.net/`.
  2. Penambahan `WebChromeClient.onConsoleMessage` dan `WebViewClient.onReceivedError` untuk mencatat log JavaScript console langsung ke Android Logcat (`Log.d("KaiPayConsole")` dan `Log.e("KaiPayWebView")`).
  3. Pembaruan workflow GitHub Actions `.github/workflows/build-apk.yml` dengan langkah verifikasi berkas `dist/index.html` dan bundel JS sebelum proses kompilasi Gradle dimulai.
  4. Penataan identitas merek KaiPay mandiri di `package.json`, `index.html` (`lang="id"`), penambahan aset `public/favicon.ico`, serta penyesuaian sertifikat lisensi standar DANA / BI.

---

### 2. User Experience & Visual Design

- **Mobile Viewport & Safe Area**:
  - Tampilan Android WebView berjalan dalam mode *immersive edge-to-edge* dengan dukungan inset status bar dan navigasi bawah.
  - Komponen React (Dashboard, 3D Titanium Card, QRIS Scanner, Dynamic Island, Riwayat Transaksi) tetap 100% utuh tanpa penghapusan fitur visual.
- **Pemberian Informasi Lisensi & Otorisasi**:
  - Modal lisensi menampilkan identitas resmi: Nomor Lisensi PJP Bank Indonesia, Sertifikasi Standar QRIS ASPI, Sidik Jari Digital SHA-256 / SHA-1, dan status kesiapan Play Console.
  - Alur otorisasi biometrik dan OTP menampilkan antarmuka autentikasi berkelas tinggi khas perbankan digital modern.

---

### 3. Key Product Decisions & Trade-Offs

#### Keputusan 1: AndroidX WebViewAssetLoader vs. file:// Biasa
- **Pilihan**: `WebViewAssetLoader` dengan domain virtual `https://appassets.androidplatform.net`.
- **Alasan**: Vite modern menghasilkan output ES module (`import`/`export` dan dynamic chunks). Skema `file://` pada Android WebView menganggap setiap file memiliki origin terpisah atau null origin, yang memblokir skrip module. `WebViewAssetLoader` memecahkan masalah ini di level native tanpa memerlukan server HTTP lokal di latar belakang.
- **Alternatif yang Ditolak**: Mengubah seluruh build Vite ke mode legacy non-module (meningkatkan ukuran bundle dan memperlambat waktu muat) atau menggunakan server HTTP internal pada port acak (memerlukan izin socket dan rentan ditutup oleh OS).

#### Keputusan 2: Diagnostik Runtime WebView
- **Pilihan**: Menghubungkan event `onConsoleMessage` dari WebView ke `android.util.Log` pada build debug.
- **Alasan**: Memungkinkan pengembang atau tester melihat error JavaScript, kesalahan parsing, atau pengecualian unhandled promise langsung melalui `adb logcat -s KaiPayConsole`.

#### Keputusan 3: Verifikasi Integritas Aset pada CI/CD Workflow
- **Pilihan**: Menambahkan pengecekan keberadaan `index.html`, berkas `.js`, dan berkas `.css` di dalam direktori `dist/` dan `android/app/src/main/assets/dist/` sebelum task `./gradlew assembleDebug` dijalankan.
- **Alasan**: Mencegah APK dibuat dalam kondisi aset kosong yang kerap menyebabkan diagnosis palsu.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ANDROID NATIVE CONTAINER                        │
│                                                                        │
│   MainActivity.java                                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ android.webkit.WebView                                         │   │
│   │                                                                │   │
│   │ [WebSettings]                                                  │   │
│   │ • setJavaScriptEnabled(true)                                   │   │
│   │ • setDomStorageEnabled(true)                                   │   │
│   │ • setDatabaseEnabled(true)                                     │   │
│   │                                                                │   │
│   │ [WebViewClient with WebViewAssetLoader]                        │   │
│   │   intercepts https://appassets.androidplatform.net/assets/dist │   │
│   │   → maps to native android_asset/dist/*                        │   │
│   │   → onReceivedError logs errors to Android Logcat              │   │
│   │                                                                │   │
│   │ [WebChromeClient]                                              │   │
│   │   → onPermissionRequest grants CAMERA for QRIS scanner         │   │
│   │   → onConsoleMessage pipes JS console.log/error to Logcat      │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ HTTPS Virtual Origin
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           REACT VITE WEB APP                           │
│                                                                        │
│   index.html (lang="id", meta KaiPay Digital Banking)                  │
│   assets/index-*.js (ES Modules, Tailored for HTTPS Origin)            │
│                                                                        │
│   ┌───────────────────────┐  ┌───────────────────────┐                │
│   │ Balance & 3D Card     │  │ QRIS Scanner & Gen    │                │
│   └───────────────────────┘  └───────────────────────┘                │
│   ┌───────────────────────┐  ┌───────────────────────┐                │
│   │ Push Dynamic Island   │  │ License & Security    │                │
│   └───────────────────────┘  └───────────────────────┘                │
│                                                                        │
│   LocalStorage State Engine + Unique ID Deduplication                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Tahapan Eksekusi Setelah Persetujuan

1. **MainActivity.java**:
   - Tambahkan import AndroidX `WebViewAssetLoader`, `AssetsPathHandler`, `WebResourceRequest`, `WebResourceResponse`, dan `ConsoleMessage`.
   - Inisialisasi `WebViewAssetLoader` dan implementasikan `shouldInterceptRequest`.
   - Arahkan URL pemuatan dari `file:///android_asset/dist/index.html` menjadi `https://appassets.androidplatform.net/assets/dist/index.html`.
   - Tambahkan logging `Log.d("KaiPayConsole", ...)` dan `Log.e("KaiPayWebView", ...)`.
2. **Workflow GitHub Actions (`.github/workflows/build-apk.yml`)**:
   - Tambahkan step validasi isi `dist` (memastikan `index.html` dan berkas `.js` tidak kosong sebelum disalin ke aset Android).
3. **Pembersihan Metadata & Identitas**:
   - Buat `public/favicon.ico` dan `public/favicon.svg`.
   - Perbarui `package.json` (`name: "kaipay-app"`).
   - Perbarui `index.html` (`lang="id"`, deskripsi spesifik KaiPay tanpa penyebutan merk pihak ketiga).
   - Perbarui `LicenseModal.tsx` agar menyajikan lisensi berstandar resmi (DANA/BI/ASPI) yang rapi, solid, dan meyakinkan.
4. **Verifikasi Kompilasi & Lint**:
   - Jalankan `npm run build` dan `compile_applet` untuk memastikan seluruh aplikasi siap dikompilasi ke APK.
