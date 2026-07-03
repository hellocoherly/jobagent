import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { syncAllEmployers } from "@/lib/jobs-sync";

// Phase 1: any authenticated user can trigger a sync. Move behind an admin
// role or a scheduled job/cron once multi-tenant auth exists.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await syncAllEmployers();
  return NextResponse.json({ results });
}
