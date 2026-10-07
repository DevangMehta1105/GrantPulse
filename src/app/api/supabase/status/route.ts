import { NextResponse } from "next/server";
import { getServerSupabase, isServerSupabaseConfigured } from "@/lib/supabase/server";

export async function GET() {
  const isConfigured = isServerSupabaseConfigured;

  if (!isConfigured) {
    return NextResponse.json({
      connected: false,
      status: "UNCONFIGURED",
      message: "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are not set. The app is running in resilient in-memory mode.",
      config: {
        hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
      },
      instructions: "To connect your Supabase database: 1) Run supabase/schema.sql in your Supabase SQL Editor. 2) Paste your Project URL and Anon Key into .env.local."
    });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({
      connected: false,
      status: "INITIALIZATION_FAILED",
      message: "Failed to initialize Supabase client instance."
    }, { status: 500 });
  }

  try {
    // Probe database tables
    const [orgsRes, schemesRes, docsRes, appsRes, expRes] = await Promise.all([
      supabase.from("organizations").select("id", { count: "exact", head: true }),
      supabase.from("schemes").select("id", { count: "exact", head: true }),
      supabase.from("user_documents").select("id", { count: "exact", head: true }),
      supabase.from("applications").select("id", { count: "exact", head: true }),
      supabase.from("grant_expenses").select("id", { count: "exact", head: true })
    ]);

    const hasError = orgsRes.error || schemesRes.error || docsRes.error || appsRes.error;

    if (hasError) {
      return NextResponse.json({
        connected: false,
        status: "SCHEMA_MISSING_OR_AUTH_ERROR",
        message: "Connected to Supabase, but some tables are missing or RLS is blocking access. Make sure to run supabase/schema.sql in your Supabase SQL Editor.",
        errors: {
          organizations: orgsRes.error?.message,
          schemes: schemesRes.error?.message,
          user_documents: docsRes.error?.message,
          applications: appsRes.error?.message,
          grant_expenses: expRes.error?.message
        }
      });
    }

    return NextResponse.json({
      connected: true,
      status: "HEALTHY",
      timestamp: new Date().toISOString(),
      message: "Successfully connected to Supabase PostgreSQL database.",
      tableCounts: {
        organizations: orgsRes.count ?? 0,
        schemes: schemesRes.count ?? 0,
        user_documents: docsRes.count ?? 0,
        applications: appsRes.count ?? 0,
        grant_expenses: expRes.count ?? 0
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      connected: false,
      status: "CONNECTION_FAILED",
      error: error.message || "Failed to reach Supabase database."
    }, { status: 500 });
  }
}
