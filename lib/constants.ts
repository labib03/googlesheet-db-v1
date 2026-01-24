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
} as const;

export const CONFIG_SHEET_NAME = "Configuration";

export const CONFIG_KEYS = {
  VIEW_TABLE_COLS: "VIEW_TABLE_COLS",
  VIEW_CARD_FIELDS: "VIEW_CARD_FIELDS",
  VIEW_DETAIL_FIELDS: "VIEW_DETAIL_FIELDS",
} as const;
