import { NextRequest, NextResponse } from "next/server";
import { fetchAndProcessData } from "@/lib/process-sheet-data";
import { COLUMNS, kelas, Gender } from "@/lib/constants";
import { getCellValue } from "@/lib/helper";

export const dynamic = "force-dynamic";

// Secret API Token for external access
const EXTERNAL_API_TOKEN =
  process.env.EXTERNAL_API_TOKEN || "generus-api-secret-key-2025";

// Common CORS Headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

/**
 * Handle CORS Preflight request
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Helper to validate incoming token
 */
function validateToken(request: NextRequest): boolean {
  // 1. Check Header 'x-api-key'
  const apiKeyHeader = request.headers.get("x-api-key");
  if (apiKeyHeader && apiKeyHeader === EXTERNAL_API_TOKEN) {
    return true;
  }

  // 2. Check Header 'Authorization' (Bearer <token> or direct token)
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7).trim()
      : authHeader.trim();
    if (token === EXTERNAL_API_TOKEN) {
      return true;
    }
  }

  // 3. Check Query parameter '?token=...'
  const tokenQuery = request.nextUrl.searchParams.get("token");
  if (tokenQuery && tokenQuery === EXTERNAL_API_TOKEN) {
    return true;
  }

  return false;
}

/**
 * GET /api/v1/generus/stats
 * Endpoint to retrieve aggregated generus counts by Jenjang, Gender, Kelompok, and Desa.
 * Required query parameters: 'desa' and 'kelompok'
 */
export async function GET(request: NextRequest) {
  // 1. Verify Authentication Token
  if (!validateToken(request)) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 401,
        error: {
          code: "UNAUTHORIZED",
          message:
            "Akses ditolak. Silakan sertakan token API yang valid melalui header 'x-api-key', 'Authorization: Bearer <TOKEN>', atau parameter '?token=<TOKEN>'.",
        },
      },
      {
        status: 401,
        headers: corsHeaders,
      },
    );
  }

  try {
    const { searchParams } = request.nextUrl;
    const desaParam = searchParams.get("desa")?.trim();
    const kelompokParam = searchParams.get("kelompok")?.trim();

    // 2. Validate mandatory query parameters
    if (!desaParam || !kelompokParam) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          error: {
            code: "MISSING_PARAMETERS",
            message:
              "Parameter 'desa' dan 'kelompok' wajib diisi. Contoh: ?desa=BUDI AGUNG&kelompok=Budi Agung 1",
            received: {
              desa: desaParam || null,
              kelompok: kelompokParam || null,
            },
          },
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // 3. Fetch processed sheet data (leveraging Next.js cache)
    const { data: allRows } = await fetchAndProcessData({
      includeAdditionalInfo: false,
      includeTrash: false,
    });

    const normalizedDesa = desaParam.toLowerCase();
    const normalizedKelompok = kelompokParam.toLowerCase();

    // 4. Filter rows by Desa & Kelompok
    const matchedRows = allRows.filter((row) => {
      const rowDesa = getCellValue(row, COLUMNS.DESA).toLowerCase();
      const rowKelompok = getCellValue(row, COLUMNS.KELOMPOK).toLowerCase();
      return rowDesa === normalizedDesa && rowKelompok === normalizedKelompok;
    });

    // 5. Initialize aggregated structures
    const byGender: Record<string, number> = {};
    Gender.forEach((g) => {
      byGender[g] = 0;
    });
    byGender["Lainnya"] = 0;

    const byJenjang: Record<string, number> = {};
    const byJenjangAndGender: Record<string, Record<string, number>> = {};

    kelas.forEach((k) => {
      byJenjang[k] = 0;
      byJenjangAndGender[k] = {
        "Laki-Laki": 0,
        "Perempuan": 0,
        "Lainnya": 0,
      };
    });

    // Handle any unknown/unspecified category
    const unspecifiedCategory = "Tidak Terdefinisi";
    byJenjang[unspecifiedCategory] = 0;
    byJenjangAndGender[unspecifiedCategory] = {
      "Laki-Laki": 0,
      "Perempuan": 0,
      "Lainnya": 0,
    };

    // 6. Aggregate data
    for (const row of matchedRows) {
      const rowGender = getCellValue(row, COLUMNS.GENDER);
      const rowJenjang = getCellValue(row, COLUMNS.JENJANG);

      // Gender count
      const matchedGender = Gender.find(
        (g) => g.toLowerCase() === rowGender.toLowerCase(),
      );
      const genderKey = matchedGender || "Lainnya";
      byGender[genderKey] = (byGender[genderKey] || 0) + 1;

      // Jenjang count
      const matchedJenjang = kelas.find(
        (k) => k.toLowerCase() === rowJenjang.toLowerCase(),
      );
      const jenjangKey = matchedJenjang || unspecifiedCategory;
      byJenjang[jenjangKey] = (byJenjang[jenjangKey] || 0) + 1;

      // Jenjang x Gender cross-tabulation
      if (!byJenjangAndGender[jenjangKey]) {
        byJenjangAndGender[jenjangKey] = {
          "Laki-Laki": 0,
          "Perempuan": 0,
          "Lainnya": 0,
        };
      }
      byJenjangAndGender[jenjangKey][genderKey] =
        (byJenjangAndGender[jenjangKey][genderKey] || 0) + 1;
    }

    // Clean up empty 'Tidak Terdefinisi' or 'Lainnya' if 0 to keep payload clean
    if (byJenjang[unspecifiedCategory] === 0) {
      delete byJenjang[unspecifiedCategory];
      delete byJenjangAndGender[unspecifiedCategory];
    }
    if (byGender["Lainnya"] === 0) {
      delete byGender["Lainnya"];
      Object.keys(byJenjangAndGender).forEach((jk) => {
        if (byJenjangAndGender[jk]["Lainnya"] === 0) {
          delete byJenjangAndGender[jk]["Lainnya"];
        }
      });
    }

    // 7. Format successful response
    return NextResponse.json(
      {
        success: true,
        statusCode: 200,
        meta: {
          timestamp: new Date().toISOString(),
          query: {
            desa: desaParam,
            kelompok: kelompokParam,
          },
        },
        data: {
          desa: desaParam,
          kelompok: kelompokParam,
          total: matchedRows.length,
          byGender,
          byJenjang,
          byJenjangAndGender,
        },
      },
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("Error in /api/v1/generus/stats:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Terjadi kesalahan saat memproses data statistik generus.",
        },
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
