import { NextResponse } from "next/server";
import { generateMassUploadTemplate } from "@/lib/excel-utils";

export async function GET() {
  try {
    const buffer = await generateMassUploadTemplate();

    const response = new NextResponse(buffer as ArrayBuffer);
    response.headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="Template_Mass_Upload.xlsx"`
    );

    return response;
  } catch (error) {
    console.error("Failed to generate template:", error);
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    );
  }
}
