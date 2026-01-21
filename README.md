# Google Sheets Dashboard - Next.js

Aplikasi dashboard yang menampilkan data dari Google Sheets secara real-time menggunakan Next.js, Tailwind CSS, dan shadcn/ui.

## 🚀 Fitur

- ✨ UI modern dan responsif dengan shadcn/ui
- 🎨 Gradient background yang indah
- 📊 Tabel data dinamis dari Google Sheets
- 🔄 Real-time data fetching
- 🌙 Dark mode support
- ⚡ Server-side rendering dengan Next.js 15

## 📋 Prerequisites

- Node.js 20.x atau lebih tinggi
- Yarn (package manager)
- Google Cloud Service Account dengan akses ke Google Sheets API

## 🛠️ Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Setup Google Cloud Service Account

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Enable Google Sheets API:
   - Pergi ke "APIs & Services" > "Library"
   - Cari "Google Sheets API"
   - Klik "Enable"
4. Buat Service Account:
   - Pergi ke "APIs & Services" > "Credentials"
   - Klik "Create Credentials" > "Service Account"
   - Isi nama dan deskripsi
   - Klik "Create and Continue"
   - Skip role assignment (klik "Continue")
   - Klik "Done"
5. Download JSON Key:
   - Klik pada service account yang baru dibuat
   - Pergi ke tab "Keys"
   - Klik "Add Key" > "Create New Key"
   - Pilih "JSON"
   - File JSON akan terdownload

### 3. Setup Environment Variables

1. Copy file `env.example` menjadi `.env.local`:

```bash
cp env.example .env.local
```

2. Buka file `.env.local` dan isi dengan data dari JSON key yang didownload:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-sheet-id-here
```

**Catatan:**
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Ambil dari field `client_email` di JSON
- `GOOGLE_PRIVATE_KEY`: Ambil dari field `private_key` di JSON (termasuk `\n`)
- `GOOGLE_SHEET_ID`: ID dari Google Sheet (ada di URL sheet)

### 4. Share Google Sheet

1. Buka Google Sheet yang ingin digunakan
2. Klik tombol "Share"
3. Tambahkan email service account (dari `GOOGLE_SERVICE_ACCOUNT_EMAIL`)
4. Berikan akses "Viewer"
5. Klik "Send"

## 🏃 Running the Application

### Development Mode

```bash
yarn dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Production Build

```bash
yarn build
yarn start
```

## 📁 Struktur Project

```
antigravity/
├── app/
│   ├── page.tsx          # Main page dengan data display
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   └── ui/               # shadcn/ui components
│       ├── table.tsx
│       ├── card.tsx
│       └── button.tsx
├── lib/
│   ├── google-sheets.ts  # Google Sheets helper functions
│   └── utils.ts          # Utility functions
├── .env.local            # Environment variables (tidak di-commit)
└── env.example           # Template environment variables
```

## 🎨 Customization

### Mengubah Sheet Name

Secara default, aplikasi membaca dari sheet bernama "Sheet1". Untuk mengubahnya, edit di `app/page.tsx`:

```typescript
data = await getSheetData('NamaSheetAnda');
```

### Mengubah Range

Untuk membaca range tertentu:

```typescript
data = await getSheetData('Sheet1', 'A1:D10');
```

## 🔧 Troubleshooting

### Error: Missing required environment variables

Pastikan file `.env.local` sudah dibuat dan semua variabel sudah diisi dengan benar.

### Error: The caller does not have permission

Pastikan Google Sheet sudah di-share dengan email service account.

### Error: Unable to parse range

Periksa nama sheet dan range yang digunakan. Pastikan sheet dengan nama tersebut ada.

## 📝 License

MIT

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
