import { prisma } from "@/lib/db";

export async function getSavedEmployersForUser(userId: string) {
  const saved = await prisma.savedEmployer.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      employer: {
        include: {
          offices: { select: { id: true, label: true, city: true, state: true } },
          jobs: { where: { status: "open" }, select: { id: true } },
        },
      },
    },
  });

  return saved.map((s) => ({
    savedAt: s.createdAt,
    employer: s.employer,
    openJobsCount: s.employer.jobs.length,
  }));
}
