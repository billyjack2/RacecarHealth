import { NextResponse } from "next/server";
import { queries } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  try {
    await queries.ping();
    return NextResponse.json({
      ok: true,
      db: "up",
      latencyMs: Date.now() - start,
      ts: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        db: "down",
        error: err instanceof Error ? err.message : "unknown",
        ts: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
