export const desaData: { [key: string]: string[] } = {
  "BUDI AGUNG": [
    "Budi Agung 1",
    "Budi Agung 2",
    "Cilebut 1",
    "Cilebut 2",
    "Cimanggu",
    "Kebon Pedes",
  ],
  CIPARIGI: ["Ciparigi 1", "Ciparigi 2", "Warung Jambu"],
  CIPAYUNG: ["Al Badar", "Al Ubaidah", "Ciawi 1", "Ciawi 2", "Tapos"],
  "GUNUNG GEDE": [
    "Ciapus",
    "Cikaret",
    "Green Arofah",
    "Gunung Gede",
    "Pakuan",
    "Pondok Rumput",
    "Tajur",
    "PPPM BIGG",
  ],
  "GUNUNG SINDUR": ["CIP 1", "CIP 2", "GIS", "Mutiara"],
  MARGAJAYA: [
    "Cibanteng",
    "Cibungbulang",
    "Ciherang",
    "Ciomas",
    "Dewi Sartika",
    "Margajaya 1",
    "Margajaya 2",
    "PPM BI",
  ],
  SALABENDA: [
    "Parakan Jaya",
    "Permata Sari",
    "Pura Bojong",
    "Salabenda",
    "Yasmin",
  ],
  SAWANGAN: ["BSI", "Ciseeng", "Inkopad", "Muara Barokah", "Sawangan"],
};

export const Gender: string[] = ["Laki-Laki", "Perempuan"];
export const kelas: string[] = [
  "PAUD",
  "Caberawit A",
  "Caberawit B",
  "Caberawit C",
  "Pra Remaja",
  "Remaja",
  "Pra Nikah",
];

export const jenjangClassMap: { [key: string]: number } = {
  paud: 5,
  "caberawit a": 6,
  "caberawit b": 8,
  "caberawit c": 10,
  "pra remaja": 12,
  remaja: 15,
  "pra nikah": 19,
};

// Canonical Column Names from Google Sheets
export const COLUMNS = {
  NAMA: "NAMA LENGKAP",
  DESA: "DESA",
  KELOMPOK: "KELOMPOK",
  GENDER: "JENIS KELAMIN",
  TANGGAL_LAHIR: "TANGGAL LAHIR",
  TIMESTAMP: "Timestamp",
  HOBI: "HOBI",
  SKILL: "SKILL / CITA-CITA",
  UMUR: "Umur",
  JENJANG: "Jenjang Kelas",
  AYAH: "NAMA AYAH",
  IBU: "NAMA IBU",
} as const;

export const CONFIG_SHEET_NAME = "Configuration";
export const ADDITIONAL_INFO_SHEET_NAME = "AdditionalInfo";

// Column names from AdditionalInfo sheet (excluding system fields)
export const ADDITIONAL_INFO_COLUMNS = [
  "Nama Lengkap",
  "Nama Panggilan",
  "Jenis Kelamin",
  "Kelompok",
  "Usia",
  "Tanggal Lahir",
  "Nomor Whatsapp",
  "Asal Sekolah",
  "Kelas",
  "Jurusan",
  "Kesibukan Saat ini",
  "Jika belum bekerja, apakah anda sedang mencari pekerjaan?",
  "Jika sedang mencari kerja, pekerjaan apa yang ingin anda inginkan? atau kamu bisa jelaskan keahlian kamu?",
  "Asal Universitas",
  "Tahun Masuk Universitas",
  "Pendidikan",
  "Fakultas/Jurusan",
  "Apakah kamu kuliah sambil bekerja/usaha/MT",
  "Tempat Bekerja/Usaha/MT",
  "Sebagai apa anda Bekerja/Usaha/MT",
  "Dari 1 - 10, seberapa siapkah kamu untuk menikah",
] as const;

// Short display labels for long AdditionalInfo column names
export const ADDITIONAL_INFO_SHORT_LABELS: Record<string, string> = {
  "Kesibukan Saat ini": "Kesibukan",
  "Jika belum bekerja, apakah anda sedang mencari pekerjaan?": "Mencari Kerja?",
  "Jika sedang mencari kerja, pekerjaan apa yang ingin anda inginkan? atau kamu bisa jelaskan keahlian kamu?":
    "Pekerjaan Diinginkan",
  "Tahun Masuk Universitas": "Tahun Masuk",
  "Fakultas/Jurusan": "Fakultas",
  "Apakah kamu kuliah sambil bekerja/usaha/MT": "Kuliah/Kerja/MT?",
  "Tempat Bekerja/Usaha/MT": "Tempat Kerja",
  "Sebagai apa anda Bekerja/Usaha/MT": "Posisi di Tempat Kerja",
  "Dari 1 - 10, seberapa siapkah kamu untuk menikah": "Skor Kesiapan Menikah",
};

export const CONFIG_KEYS = {
  VIEW_TABLE_COLS: "VIEW_TABLE_COLS",
  VIEW_CARD_FIELDS: "VIEW_CARD_FIELDS",
  VIEW_DETAIL_FIELDS: "VIEW_DETAIL_FIELDS",
  VIEW_ADDITIONAL_INFO_FIELDS: "VIEW_ADDITIONAL_INFO_FIELDS",
  ADMIN_PASSWORD: "ADMIN_PASSWORD",
  ADMIN_USERS: "ADMIN_USERS",
  MAP_KATEGORI_HOBI: "MAP_KATEGORI_HOBI",
  MAP_KATEGORI_SKILL: "MAP_KATEGORI_SKILL",
  LIST_KATEGORI_HOBI_ALL: "LIST_KATEGORI_HOBI_ALL",
  LIST_KATEGORI_SKILL_ALL: "LIST_KATEGORI_SKILL_ALL",
} as const;
