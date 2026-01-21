# Panduan Deployment ke Vercel

Aplikasi ini menggunakan **Next.js** dan **Google Sheets API**. Berikut langkah-langkah untuk deploy ke Vercel.

## 1. Persiapan Project
Pastikan kode Anda sudah di-push ke repository GitHub/GitLab/Bitbucket.

## 2. Setup Vercel
1. Buka [Vercel Dashboard](https://vercel.com/dashboard).
2. Klik **Add New...** > **Project**.
3. Import repository project Anda.

## 3. Konfigurasi Environment Variables (PENTING!)
Di halaman konfigurasi project (Configure Project), buka bagian **Environment Variables**. Masukkan variable berikut satu per satu:

| Nama Variable | Value |
|--------------|-------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Email service account Anda (dari JSON key file) |
| `GOOGLE_SHEET_ID` | ID Google Sheet Anda (dari URL sheet) |
| `GOOGLE_PRIVATE_KEY` | Private Key Anda (Lihat instruksi khusus di bawah) |

### ⚠️ Khusus GOOGLE_PRIVATE_KEY
Value private key dari JSON file biasanya terlihat seperti ini:
`"-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"`

**Cara input di Vercel:**
1. Copy isi private key lengkap, **termasuk** `-----BEGIN PRIVATE KEY-----` dan `-----END PRIVATE KEY-----`.
2. Paste langsung ke kolom value di Vercel.
3. Kode aplikasi kita sudah memiliki logic `.replace(/\\n/g, '\n')` untuk menangani format baris baru secara otomatis.

> **Tips:** Jangan gunakan tanda kutip `"` pembuka dan penutup saat memasukkan value di Vercel, kecuali jika itu bagian dari string key itu sendiri.

## 4. Deploy
1. Klik **Deploy**.
2. Tunggu proses build selesai.
3. Setelah selesai, buka aplikasi Anda.

## Troubleshooting
Jika terjadi error "The caller does not have permission":
1. Pastikan **Service Account Email** sudah di-invite sebagai **Editor** atau **Viewer** di Google Sheet Anda.
2. Cek kembali `GOOGLE_SHEET_ID` apakah sudah benar.
