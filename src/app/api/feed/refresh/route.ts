import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { generateFeedForUser } from "@/lib/feed";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await generateFeedForUser(user.id);
    return NextResponse.json({ itemsCreated: items.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to refresh feed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
