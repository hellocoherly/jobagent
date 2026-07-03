import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { computeMatchesForUser } from "@/lib/matching";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const matches = await computeMatchesForUser(user.id);
    return NextResponse.json({ matchesCreated: matches.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to compute matches";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
