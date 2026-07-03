import { prisma } from "@/lib/db";
import { scoreJobMatch, type ExtractedProfile } from "@/lib/ai";

const MAX_JOBS_PER_RUN = 25;

export async function computeMatchesForUser(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    throw new Error("User has no profile yet — upload a resume first");
  }

  const jobs = await prisma.job.findMany({
    where: {
      status: "open",
      matches: { none: { userId } },
    },
    include: { employer: true, office: true },
    orderBy: { postedAt: "desc" },
    take: MAX_JOBS_PER_RUN,
  });

  const profileForModel: Partial<ExtractedProfile> = {
    headline: profile.headline ?? undefined,
    summary: profile.summary ?? undefined,
    skills: profile.skills,
    achievements: profile.achievements,
    certifications: profile.certifications,
    careerGoals: profile.careerGoals,
    preferredIndustries: profile.preferredIndustries,
    experience: (profile.experience as ExtractedProfile["experience"]) ?? [],
  };

  const created = [];
  for (const job of jobs) {
    const result = await scoreJobMatch({
      profile: profileForModel,
      job: {
        title: job.title,
        company: job.employer.name,
        description: job.description,
        compMin: job.compMin,
        compMax: job.compMax,
        remoteType: job.remoteType,
        city: job.office?.city ?? null,
      },
    });

    const match = await prisma.match.upsert({
      where: { userId_jobId: { userId, jobId: job.id } },
      create: {
        userId,
        jobId: job.id,
        score: result.score,
        dimensionScores: result.dimensionScores as unknown as object,
        explanation: result.explanation,
        tradeoffs: result.tradeoffs,
      },
      update: {
        score: result.score,
        dimensionScores: result.dimensionScores as unknown as object,
        explanation: result.explanation,
        tradeoffs: result.tradeoffs,
      },
    });
    created.push(match);
  }

  return created;
}
