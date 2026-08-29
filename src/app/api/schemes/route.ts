import { NextResponse } from "next/server";
import { SEED_SCHEMES } from "@/data/seed-schemes";

export async function GET() {
  return NextResponse.json({
    success: true,
    total: SEED_SCHEMES.length,
    data: SEED_SCHEMES
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
