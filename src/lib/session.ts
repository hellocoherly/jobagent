import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const userId = await verifySessionToken(token);
  if (!userId) return null;

  return prisma.user.findUnique({ where: { id: userId } });
});
