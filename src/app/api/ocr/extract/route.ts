import { NextResponse } from "next/server";
import { processDocumentOcr } from "@/lib/ocr/extractor";
import { DocumentType } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      docType, 
      fileName = "scanned_document.pdf", 
      content = "", 
      targetOrgName = "",
      fileSize = 250000 
    } = body;

    if (!docType) {
      return NextResponse.json(
        { success: false, error: "docType parameter is required." },
        { status: 400 }
      );
    }

    const extraction = processDocumentOcr(
      docType as DocumentType,
      fileName,
      content,
      targetOrgName,
      fileSize
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      extraction
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Document OCR extraction failed" },
      { status: 500 }
    );
  }
}
