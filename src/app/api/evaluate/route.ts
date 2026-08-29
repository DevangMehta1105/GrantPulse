import { NextResponse } from "next/server";
import { evaluateSchemeEligibility } from "@/lib/ast-engine/evaluator";
import { AstGroupNode, Organization } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ast, organization }: { ast: AstGroupNode; organization: Organization } = body;

    if (!ast || !organization) {
      return NextResponse.json(
        { success: false, error: "Both ast and organization profile must be provided." },
        { status: 400 }
      );
    }

    const evaluation = evaluateSchemeEligibility(ast, organization);
    return NextResponse.json({ success: true, evaluation });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
