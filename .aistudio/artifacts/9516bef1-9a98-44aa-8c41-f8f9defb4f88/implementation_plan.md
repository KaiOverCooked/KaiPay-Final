# Rencana Implementasi: Perbaikan & Penyempurnaan UI Estetik, Kai Card 3D Gesture, Fitur Teman, dan Build APK Android

Menindaklanjuti permintaan dan preferensi yang telah Anda konfirmasikan, berikut adalah rencana terstruktur untuk memperbaiki dan menyempurnakan aplikasi KaiPay:

---

## 1. Perbaikan Tema Hitam-Putih (Monokrom) & Fitur Aksen Warna Dinamis

### Masalah Saat Ini
- Pemilihan warna aksen (`accentColor`: Blue, Monochrome, Green, Purple, Orange) di pengaturan belum diaplikasikan secara menyeluruh ke elemen-elemen tombol, badge, dan indikator aktif karena masih banyak kode yang mengunci warna `#007AFF`.
- Tema "Hitam Putih" (Apple Monochrome) belum memberikan pengalaman monokrom titanium murni yang menyeluruh.

### Solusi & Penerapan
- **Sistem CSS Variables Dinamis (`--ios-accent`, `--ios-accent-rgb`, `--ios-accent-hover`)**:
  - Diterapkan pada `:root` dan disinkronkan langsung saat pengguna mengganti aksen warna di Pengaturan Akun atau Navbar.
  - Pilihan tema monokrom murni (Black & White Titanium): tombol primer menjadi hitam pekat (dark mode: putih bersih), border silver titanium halus, tanpa warna jenuh.
  - Pilihan aksen warna:
    - **Apple Blue** (`#007AFF`)
    - **Monokrom Titanium** (`#000000` / `#FFFFFF`)
    - **Apple Mint Green** (`#34C759`)
    - **Apple Indigo** (`#5856D6`)
    - **Action Orange** (`#FF9500`)
- **Penyelarasan Warna Antarmuka**: Seluruh tombol aksi utama, tab aktif di dock bawah, segmented controls, toggle switch, dan highlight transaksi akan otomatis mengikuti variabel warna aksen yang dipilih.

---

## 2. Penyempurnaan Kai Card 3D: Geser Tangan (Touch/Drag), Hapus Gyro & Cahaya Kanan

### Masalah & Kebutuhan
- Sensor gyroscope bawaan terkadang jittery atau tidak responsif di berbagai perangkat. Pengguna ingin interaksi geser langsung dengan jari / mouse.
- Cahaya harus bersumber dari sisi kanan dengan efek specular reflection (kilau cahaya) yang dinamis mengikuti sudut geseran, serta memiliki kedalaman fisik ala Apple Card.

### Solusi & Penerapan
- **Hapus Sensor Gyroscope**: Menghilangkan listener `deviceorientation`.
- **Interaksi Geser Multi-Arah Bebas (Drag & Tilt with Physics)**:
  - Menggunakan gestur drag touch & mouse cursor dengan redaman inersia pegas iOS (`damping: 25`, `stiffness: 280`).
  - Membaca posisi relatif geseran jari pada kartu untuk menghitung sudut rotasi 3D $X$ dan $Y$.
- **Pencahayaan Samping Kanan & Specular Sheen**:
  - Layer refleksi cahaya ditempatkan di sisi kanan (`right: -20%`, radial gradient putih-emas halus).
  - Saat kartu digeser ke kiri/kanan/atas/bawah, gradasi highlight menyapu permukaan titanium dengan kedalaman bayangan berlapis (*ambient occlusion* & *drop shadow* ganda).
- **Mode Pratinjau Tumpukan Kartu ala Apple Wallet**:
  - Menyediakan toggle tampilan tumpukan kartu (Apple Cash + Kai Card Titanium + Virtual Gold) yang dapat digeser dan dipilih secara bergantian.

---

## 3. Penyempurnaan Fitur Teman Kontak (Quick Contacts)

### Kebutuhan Pengguna
- Riwayat transaksi khusus per kontak.
- Aksi transfer instan satu klik.
- Foto avatar kustom & badge favorit (bintang/pin).
- Kategori grup kontak: **Semua**, **Teman**, **Keluarga**, **Bisnis/Rekan**.

### Solusi & Penerapan
- **Peningkatan Data Model Kontak**:
  - Menambahkan properti `category` ('teman' | 'keluarga' | 'bisnis'), `isFavorite` (boolean), dan dukungan avatar kustom.
- **Tampilan Kontak yang Lebih Rapi & Estetik**:
  - Filter segmented pill: Semua, Favorit ★, Teman, Keluarga.
  - Indikator badge bintang favorit yang disematkan di pojok avatar.
- **Sheet Rincian Kontak (Contact Detail Sheet)**:
  - Membuka modal profil kontak saat diklik.
  - Menampilkan total mutasi transfer antara pengguna dan kontak tersebut, riwayat transaksi terakhir bersama kontak itu.
  - Tombol aksi instan: "Kirim Uang Sekarang", "Bagi Tagihan (Split Bill)", dan "Hapus/Ubah Kontak".

---

## 4. Penataan Ulang & Perapian UI (Anti-Clutter, iOS 18 Aesthetic)

### Masalah Saat Ini
- Banyak fitur baru yang bertumpuk membuat tampilan beranda terasa padat.

### Solusi & Penerapan
- **Penyelarasan Ruang & Hierarki Tipografi**:
  - Mengurangi kepadatan margin dan padding sesuai standar iOS Inset Grouped layout.
  - Menempatkan Dynamic Island secara proporsional dan tidak menutupi header utama.
  - Tombol-tombol sekunder dirapikan ke dalam sub-menu atau floating dock yang minimalis.
- **Konsistensi Animasi Pegas Apple**:
  - Seluruh interaksi modal, sheet, klik kartu, dan transisi tab menggunakan kurva spring iOS (`type: 'spring', damping: 28, stiffness: 320`), mulus tanpa patah-patah.

---

## 5. Konfigurasi Android Gradle Wrapper (gradlew) & GitHub Actions APK Build

### Kebutuhan
- Struktur file Gradle Android standar yang siap dibuka di Android Studio.
- File eksekusi `gradlew` dan `gradlew.bat` serta `gradle-wrapper.properties`.
- Konfigurasi `capacitor.config.json` dan AndroidManifest.
- Script workflow `.github/workflows/build-apk.yml` agar repositori GitHub dapat otomatis meng-compile dan merilis file `.apk` siap install di HP Android.

### Struktur yang Disiapkan
1. `android/`
   - `gradlew` & `gradlew.bat`
   - `gradle/wrapper/gradle-wrapper.properties`
   - `build.gradle` (root project)
   - `settings.gradle`
   - `app/build.gradle` (konfigurasi SDK 34, namespace `com.kaipay.app`, versionName "1.0.0")
   - `app/src/main/AndroidManifest.xml` (Permissions: Internet, Camera, Vibrate, Biometric)
2. `capacitor.config.json`: Konfigurasi ID aplikasi `com.kaipay.app` dan direktori web build `dist`.
3. `.github/workflows/build-apk.yml`: Pipeline CI/CD otomatis untuk build APK Android debug/release setiap push ke branch main, dengan output file `KaiPay.apk` yang dapat diunduh langsung dari tab Actions GitHub.
