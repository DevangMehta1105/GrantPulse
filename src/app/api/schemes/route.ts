import { NextResponse } from "next/server";
import { fetchSchemesFromDb } from "@/lib/supabase/service";

export async function GET() {
  const schemes = await fetchSchemesFromDb();
  return NextResponse.json({
    success: true,
    total: schemes.length,
    data: schemes
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.eligibilityAst) {
      return NextResponse.json(
        { success: false, error: "Scheme title and eligibilityAst are required" },
        { status: 400 }
      );
    }

    const newScheme = {
      ...body,
      id: `scheme-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    return NextResponse.json({ success: true, scheme: newScheme }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
  }
}
