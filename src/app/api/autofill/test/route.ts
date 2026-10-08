import { NextResponse } from "next/server";
import { runAutofillBenchmarkTest } from "@/lib/autofill/tester";

export async function GET() {
  const benchmark = runAutofillBenchmarkTest();
  return NextResponse.json(benchmark);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const benchmark = runAutofillBenchmarkTest(body.org, body.scheme);
    return NextResponse.json(benchmark);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
