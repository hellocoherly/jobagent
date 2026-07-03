import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

interface RouteParams {
  params: Promise<{ employerId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { employerId } = await params;

  await prisma.savedEmployer.upsert({
    where: { userId_employerId: { userId: user.id, employerId } },
    create: { userId: user.id, employerId },
    update: {},
  });

  return NextResponse.json({ saved: true });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { employerId } = await params;

  await prisma.savedEmployer.deleteMany({
    where: { userId: user.id, employerId },
  });

  return NextResponse.json({ saved: false });
}
