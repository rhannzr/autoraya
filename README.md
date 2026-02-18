# 🚗 AutoHub - Vehicle Rental & Sales Management System

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

**AutoHub** adalah platform berbasis web modern untuk manajemen penyewaan dan jual beli kendaraan (mobil & motor). Aplikasi ini dirancang untuk memudahkan pelanggan dalam mencari kendaraan impian, sekaligus memberikan kontrol penuh kepada admin untuk mengelola inventaris, transaksi, dan laporan keuangan.

## ✨ Fitur Utama

### 👤 Halaman Pengunjung (Public)
- **Katalog Kendaraan:** Tampilan grid responsif dengan filter kategori (Sewa/Beli).
- **Detail Kendaraan:** Spesifikasi lengkap (Mesin, Kapasitas, Harga, dll).
- **Booking System:**
  - **Sewa:** Pilih tanggal sewa & hitung estimasi harga otomatis.
  - **Beli:** Ajukan penawaran atau minat pembelian langsung ke sistem.
- **Fitur Tambahan:** Halaman FAQ interaktif dan Testimoni pelanggan.

### 🛡️ Dashboard Admin (CMS)
- **Manajemen Kendaraan:** Tambah, Edit, Hapus data mobil/motor dengan spesifikasi detail.
- **Manajemen Sewa:** Setujui/Tolak pesanan masuk, cek status (Aktif/Selesai/Batal).
- **Manajemen Penjualan:** Pantau pengajuan pembelian dan update status transaksi.
- **Laporan Keuangan:** Ringkasan pendapatan sewa & jual dengan filter tanggal.
- **Manajemen Konten:** Edit Testimoni dan FAQ tanpa coding.
- **Keamanan:** Login admin terproteksi & Row Level Security (RLS).

## 🛠️ Teknologi yang Digunakan

Project ini dibangun menggunakan tech stack modern untuk performa tinggi dan skalabilitas:

- **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel

## 🚀 Cara Menjalankan Project (Local Development)

Ikuti langkah ini jika ingin menjalankan project di komputer lokal Anda:

1.  **Clone Repository**
    ```bash
    git clone [https://github.com/username-kamu/auto-hub.git](https://github.com/username-kamu/auto-hub.git)
    cd auto-hub
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment (.env)**
    Buat file `.env` di root folder dan isi dengan kredensial Supabase Anda:
    ```env
    VITE_SUPABASE_URL=[https://your-project-url.supabase.co](https://your-project-url.supabase.co)
    VITE_SUPABASE_ANON_KEY=your-anon-key-here
    ```

4.  **Jalankan Server**
    ```bash
    npm run dev
    ```
    Buka browser di `http://localhost:5173`.

## 🗄️ Struktur Database (Supabase)

Aplikasi ini menggunakan tabel-tabel berikut:
- `profiles`: Data pengguna & admin.
- `vehicles`: Inventaris kendaraan (termasuk spek lengkap).
- `rentals`: Transaksi penyewaan.
- `sales`: Transaksi penjualan.
- `testimonials`: Data testimoni dinamis.
- `faqs`: Data pertanyaan umum.

## 👨‍💻 Author

Dikembangkan oleh **Raihan Nizar**.

- **GitHub:** [@rhannzr](https://github.com/rhannzr)
- **Role:** Fullstack Developer
- **Project:** Portfolio Development

---
*Dibuat dengan ❤️ untuk kemudahan transportasi.*