import { NextResponse } from "next/server";
import { processBulkSchemeImport } from "@/lib/ingestion/csv-importer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, format = "csv" } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { success: false, error: "File content string is required in payload." },
        { status: 400 }
      );
    }

    const result = processBulkSchemeImport(content, format as "csv" | "json");

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process import payload" },
      { status: 500 }
    );
  }
}
