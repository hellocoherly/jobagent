import { prisma } from "@/lib/db";
import { fetchJobsForBoard, type AtsProvider } from "@/lib/ats";

function matchOffice(
  offices: Array<{ id: string; label: string; city: string | null }>,
  officeLabel: string | null
) {
  if (!offices.length) return null;
  if (!officeLabel) return offices[0].id;

  const normalized = officeLabel.toLowerCase();
  const match = offices.find(
    (office) =>
      normalized.includes(office.label.toLowerCase()) ||
      (office.city && normalized.includes(office.city.toLowerCase()))
  );
  return match?.id ?? offices[0].id;
}

export interface SyncResult {
  employerId: string;
  employerName: string;
  fetched: number;
  upserted: number;
  closed: number;
  error?: string;
}

export async function syncEmployerJobs(employerId: string): Promise<SyncResult> {
  const employer = await prisma.employer.findUniqueOrThrow({
    where: { id: employerId },
    include: { offices: { select: { id: true, label: true, city: true } } },
  });

  if (!employer.atsProvider || !employer.atsBoardId) {
    return { employerId, employerName: employer.name, fetched: 0, upserted: 0, closed: 0, error: "No ATS configured" };
  }

  try {
    const jobs = await fetchJobsForBoard(employer.atsProvider as AtsProvider, employer.atsBoardId);

    let upserted = 0;
    for (const job of jobs) {
      const officeId = matchOffice(employer.offices, job.officeLabel);
      await prisma.job.upsert({
        where: { employerId_externalId: { employerId: employer.id, externalId: job.externalId } },
        create: {
          employerId: employer.id,
          officeId,
          title: job.title,
          department: job.department,
          description: job.description,
          remoteType: job.remoteType,
          sourceUrl: job.sourceUrl,
          externalId: job.externalId,
          postedAt: job.postedAt,
          status: "open",
        },
        update: {
          title: job.title,
          department: job.department,
          description: job.description,
          remoteType: job.remoteType,
          sourceUrl: job.sourceUrl,
          postedAt: job.postedAt,
          officeId,
          status: "open",
        },
      });
      upserted += 1;
    }

    const { count: closed } = await prisma.job.updateMany({
      where: {
        employerId: employer.id,
        status: "open",
        externalId: { notIn: jobs.map((j) => j.externalId) },
      },
      data: { status: "closed" },
    });

    await prisma.employer.update({
      where: { id: employer.id },
      data: { hiringScore: computeHiringScore(jobs.length) },
    });

    return { employerId, employerName: employer.name, fetched: jobs.length, upserted, closed };
  } catch (error) {
    return {
      employerId,
      employerName: employer.name,
      fetched: 0,
      upserted: 0,
      closed: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function computeHiringScore(openJobCount: number): number {
  // Simple Phase-1 heuristic: more open roles -> higher hiring score, capped at 100.
  return Math.min(100, Math.round(Math.log2(openJobCount + 1) * 20));
}

export async function syncAllEmployers(): Promise<SyncResult[]> {
  const employers = await prisma.employer.findMany({
    where: { atsProvider: { not: null }, atsBoardId: { not: null } },
    select: { id: true },
  });

  const results: SyncResult[] = [];
  for (const employer of employers) {
    results.push(await syncEmployerJobs(employer.id));
  }
  return results;
}
