# REST API Reference - Dashboard Generus

> Dokumentasi teknis integrasi REST API Dashboard Generus untuk konsumsi data statistik & agregasi dari aplikasi eksternal (Web, Mobile App Flutter/React Native, Bot Telegram, Cron/Webhook, dsb.).

---

## ⚡ Quick Start (< 2 Menit)

Dapatkan ringkasan statistik generus dalam satu baris perintah:

```bash
curl -X GET "https://<your-domain>.vercel.app/api/v1/generus/stats?desa=BUDI%20AGUNG&kelompok=Budi%20Agung%201" \
  -H "x-api-key: generus-api-secret-key-2025"
```

---

## 📊 Arsitektur & Alur Request

```mermaid
sequenceDiagram
    autonumber
    actor Client as Klien Eksternal (Web/App/Bot)
    participant CDN as Vercel Edge CDN (Cache 60s)
    participant API as Next.js Route Handler (/api/v1/generus/stats)
    participant Service as Google Sheets Data Layer

    Client->>CDN: GET /api/v1/generus/stats (Header: x-api-key)
    alt Cache Hit (< 50ms)
        CDN-->>Client: 200 OK (Data Ter-cache)
    else Cache Miss
        CDN->>API: Forward Request
        API->>API: Validasi Token & Query Params
        alt Token / Params Tidak Valid
            API-->>Client: 400 Bad Request / 401 Unauthorized
        else Valid
            API->>Service: Fetch Processed Data
            Service-->>API: Data Generus
            API->>API: Agregasi per Jenjang & Gender
            API-->>CDN: 200 OK (Cache-Control: s-maxage=60)
            CDN-->>Client: 200 OK (JSON Response)
        end
    end
```

---

## 🌐 Konfigurasi Lingkungan (Base URL)

| Lingkungan | Base URL | Keterangan |
| :--- | :--- | :--- |
| **Development** | `http://localhost:3000` | Pengujian lokal |
| **Production** | `https://<your-vercel-domain>.vercel.app` | Server live Vercel |

* **Format Data**: JSON (`Content-Type: application/json; charset=utf-8`)
* **CORS**: Terbuka (`Access-Control-Allow-Origin: *`, `OPTIONS` preflight didukung)
* **CDN Caching**: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`

---

## 🔐 Spesifikasi Autentikasi

Setiap request ke API wajib menyertakan token autentikasi yang valid.

### 1. Metode Pengiriman Token

| Prioritas | Metode | Format | Contoh |
| :---: | :--- | :--- | :--- |
| 1 | **Header `x-api-key`** *(Rekomendasi)* | `x-api-key: <TOKEN>` | `x-api-key: generus-api-secret-key-2025` |
| 2 | **Header `Authorization`** | `Authorization: Bearer <TOKEN>` | `Authorization: Bearer generus-api-secret-key-2025` |
| 3 | **Query Parameter** | `?token=<TOKEN>` | `?token=generus-api-secret-key-2025` |

### 2. Pengaturan Token (Environment Variable)
Token default sistem adalah `generus-api-secret-key-2025`. Untuk menggantinya di production, atur variabel lingkungan di Vercel:
```env
EXTERNAL_API_TOKEN=kunci_rahasia_kustom_anda_2025
```

---

## 🚀 Endpoint Reference

### `GET /api/v1/generus/stats`

Mengambil agregasi jumlah generus berdasarkan jenjang kelas dan jenis kelamin untuk kombinasi desa dan kelompok tertentu.

#### 1. Query Parameters

| Parameter | Tipe | Wajib? | Default | Keterangan & Aturan | Contoh |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `desa` | `string` | **Ya** | - | Nama desa terdaftar (case-insensitive, auto-trimmed) | `BUDI AGUNG` |
| `kelompok` | `string` | **Ya** | - | Nama kelompok di bawah desa tersebut (case-insensitive) | `Budi Agung 1` |
| `token` | `string` | *Kondisional* | - | Wajib diisi jika tidak mengirim token via Header HTTP | `generus-api-secret-key-2025` |

#### 2. HTTP Status Codes Matrix

| Kode Status | Kategori | Kondisi / Penyebab |
| :---: | :--- | :--- |
| **`200 OK`** | Sukses | Request valid, data agregasi berhasil dikembalikan |
| **`400 Bad Request`** | Error Klien | Parameter `desa` atau `kelompok` kosong/tidak dikirim |
| **`401 Unauthorized`** | Error Klien | Token tidak disertakan atau token salah |
| **`500 Internal Server Error`** | Error Server | Terjadi kegagalan koneksi atau pemrosesan data spreadsheet |

---

## 📦 Skema & Contoh Respon JSON

### 1. Respon Sukses (`200 OK`)

```json
{
  "success": true,
  "statusCode": 200,
  "meta": {
    "timestamp": "2026-08-20T14:40:00.000Z",
    "query": {
      "desa": "BUDI AGUNG",
      "kelompok": "Budi Agung 1"
    }
  },
  "data": {
    "desa": "BUDI AGUNG",
    "kelompok": "Budi Agung 1",
    "total": 38,
    "byGender": {
      "Laki-Laki": 20,
      "Perempuan": 18
    },
    "byJenjang": {
      "PAUD": 4,
      "Caberawit A": 5,
      "Caberawit B": 6,
      "Caberawit C": 7,
      "Pra Remaja": 6,
      "Remaja": 5,
      "Pra Nikah": 5
    },
    "byJenjangAndGender": {
      "PAUD": { "Laki-Laki": 2, "Perempuan": 2 },
      "Caberawit A": { "Laki-Laki": 3, "Perempuan": 2 },
      "Caberawit B": { "Laki-Laki": 3, "Perempuan": 3 },
      "Caberawit C": { "Laki-Laki": 4, "Perempuan": 3 },
      "Pra Remaja": { "Laki-Laki": 3, "Perempuan": 3 },
      "Remaja": { "Laki-Laki": 3, "Perempuan": 2 },
      "Pra Nikah": { "Laki-Laki": 2, "Perempuan": 3 }
    }
  }
}
```

#### Kamus Data (Field Dictionary)

| Bidang | Tipe | Penjelasan |
| :--- | :---: | :--- |
| `success` | `boolean` | `true` jika proses berhasil, `false` jika gagal |
| `statusCode` | `number` | Kode status HTTP respon |
| `meta.timestamp` | `string` | Waktu respon dibuat (format ISO 8601 UTC) |
| `meta.query` | `object` | Parameter query yang berhasil diproses |
| `data.desa` | `string` | Nama desa yang dicari |
| `data.kelompok` | `string` | Nama kelompok yang dicari |
| `data.total` | `number` | Total seluruh generus dalam kelompok & desa tersebut |
| `data.byGender` | `object` | Agregasi total per gender (`Laki-Laki`, `Perempuan`) |
| `data.byJenjang` | `object` | Agregasi total per jenjang kelas |
| `data.byJenjangAndGender` | `object` | Matriks silang jumlah tiap jenjang dirinci per gender |

---

### 2. Respon Error Parameter Tidak Lengkap (`400 Bad Request`)

```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "MISSING_PARAMETERS",
    "message": "Parameter 'desa' dan 'kelompok' wajib diisi. Contoh: ?desa=BUDI AGUNG&kelompok=Budi Agung 1",
    "received": {
      "desa": "BUDI AGUNG",
      "kelompok": null
    }
  }
}
```

---

### 3. Respon Error Autentikasi Gagal (`401 Unauthorized`)

```json
{
  "success": false,
  "statusCode": 401,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Akses ditolak. Silakan sertakan token API yang valid melalui header 'x-api-key', 'Authorization: Bearer <TOKEN>', atau parameter '?token=<TOKEN>'."
  }
}
```

---

## 💻 Contoh Integrasi Multi-Bahasa

### 1. JavaScript / TypeScript (`fetch` / Browser & Node.js)

```typescript
interface GenerusStatsResponse {
  success: boolean;
  statusCode: number;
  data: {
    desa: string;
    kelompok: string;
    total: number;
    byGender: Record<string, number>;
    byJenjang: Record<string, number>;
    byJenjangAndGender: Record<string, Record<string, number>>;
  };
}

async function fetchGenerusStats(desa: string, kelompok: string): Promise<GenerusStatsResponse["data"]> {
  const url = new URL("https://your-domain.vercel.app/api/v1/generus/stats");
  url.searchParams.set("desa", desa);
  url.searchParams.set("kelompok", kelompok);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "x-api-key": "generus-api-secret-key-2025",
      "Content-Type": "application/json",
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || "Gagal mengambil statistik generus");
  }

  return payload.data;
}
```

---

### 2. Python (`requests`)

```python
import requests
from typing import Dict, Any

def get_generus_stats(desa: str, kelompok: str) -> Dict[str, Any]:
    url = "https://your-domain.vercel.app/api/v1/generus/stats"
    params = {"desa": desa, "kelompok": kelompok}
    headers = {"x-api-key": "generus-api-secret-key-2025"}

    response = requests.get(url, params=params, headers=headers, timeout=10)
    data = response.json()

    if response.status_code == 200:
        return data["data"]
    else:
        raise Exception(data.get("error", {}).get("message", "Request failed"))

# Pemanggilan:
if __name__ == "__main__":
    stats = get_generus_stats("BUDI AGUNG", "Budi Agung 1")
    print(f"Total: {stats['total']}")
    print(f"Rincian Jenjang: {stats['byJenjang']}")
```

---

### 3. Dart / Flutter (`http`)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<Map<String, dynamic>> fetchGenerusStats({
  required String desa,
  required String kelompok,
}) async {
  final uri = Uri.https('your-domain.vercel.app', '/api/v1/generus/stats', {
    'desa': desa,
    'kelompok': kelompok,
  });

  final response = await http.get(
    uri,
    headers: {
      'x-api-key': 'generus-api-secret-key-2025',
      'Content-Type': 'application/json',
    },
  );

  final Map<String, dynamic> body = jsonDecode(response.body);

  if (response.statusCode == 200) {
    return body['data'] as Map<String, dynamic>;
  } else {
    throw Exception(body['error']?['message'] ?? 'Gagal memuat data');
  }
}
```

---

### 4. PHP (cURL / Guzzle)

```php
<?php
$desa = urlencode("BUDI AGUNG");
$kelompok = urlencode("Budi Agung 1");
$url = "https://your-domain.vercel.app/api/v1/generus/stats?desa={$desa}&kelompok={$kelompok}";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "x-api-key: generus-api-secret-key-2025",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);
if ($httpCode === 200) {
    echo "Total Generus: " . $result['data']['total'] . "\n";
} else {
    echo "Error: " . ($result['error']['message'] ?? 'Unknown error') . "\n";
}
```

---

## 📖 Master Data Reference

### 1. Daftar Desa & Kelompok Resmi

| Nama Desa | Daftar Kelompok Terdaftar |
| :--- | :--- |
| **`BUDI AGUNG`** | Budi Agung 1, Budi Agung 2, Cilebut 1, Cilebut 2, Cimanggu, Kebon Pedes |
| **`CIPARIGI`** | Ciparigi 1, Ciparigi 2, Warung Jambu |
| **`CIPAYUNG`** | Al Badar, Al Ubaidah, Ciawi 1, Ciawi 2, Tapos |
| **`GUNUNG GEDE`** | Ciapus, Cikaret, Green Arofah, Gunung Gede, Pakuan, Pondok Rumput, Tajur, PPPM BIGG |
| **`GUNUNG SINDUR`** | CIP 1, CIP 2, GIS, Mutiara |
| **`MARGAJAYA`** | Cibanteng, Cibungbulang, Ciherang, Ciomas, Dewi Sartika, Margajaya 1, Margajaya 2, PPM BI |
| **`SALABENDA`** | Parakan Jaya, Permata Sari, Pura Bojong, Salabenda, Yasmin |
| **`SAWANGAN`** | BSI, Ciseeng, Inkopad, Muara Barokah, Sawangan |

### 2. Daftar Kategori Jenjang Usia

| Jenjang Kelas | Rentang Usia |
| :--- | :--- |
| **`PAUD`** | Usia < 6 tahun |
| **`Caberawit A`** | Usia 6 – 7 tahun |
| **`Caberawit B`** | Usia 8 – 9 tahun |
| **`Caberawit C`** | Usia 10 – 11 tahun |
| **`Pra Remaja`** | Usia 12 – 14 tahun |
| **`Remaja`** | Usia 15 – 18 tahun |
| **`Pra Nikah`** | Usia 19+ tahun |

---

## 🤖 AI / LLM Context Reference (`llms.txt`)

Bagi integrasi agen AI atau MCP Server yang membutuhkan ringkasan konteks:

```markdown
# Generus Statistics API
- Endpoint: GET /api/v1/generus/stats
- Auth: Header `x-api-key` atau `Authorization: Bearer <TOKEN>`
- Query: `desa` (string, required), `kelompok` (string, required)
- Response Structure: { success, statusCode, meta, data: { desa, kelompok, total, byGender, byJenjang, byJenjangAndGender } }
- Source Code: app/api/v1/generus/stats/route.ts
```
