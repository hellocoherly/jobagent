import { prisma } from "@/lib/db";
import { computeMatchesForUser } from "@/lib/matching";

const STRONG_MATCH_THRESHOLD = 70;
const HIGH_HIRING_SCORE_THRESHOLD = 70;

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

async function generateNewMatchItems(userId: string) {
  const newMatches = await computeMatchesForUser(userId).catch(() => []);
  const items = [];

  for (const match of newMatches) {
    if (match.score < STRONG_MATCH_THRESHOLD) continue;

    const job = await prisma.job.findUnique({
      where: { id: match.jobId },
      include: { employer: true },
    });
    if (!job) continue;

    const item = await prisma.opportunityFeedItem.create({
      data: {
        userId,
        kind: "new_match",
        title: `${job.title} at ${job.employer.name} — ${match.score}% fit`,
        body: match.explanation,
        metadata: { jobId: job.id, employerId: job.employerId, score: match.score },
      },
    });
    items.push(item);
  }

  return items;
}

async function generateHiringTrendItems(userId: string) {
  const [saved, matched] = await Promise.all([
    prisma.savedEmployer.findMany({ where: { userId }, select: { employerId: true } }),
    prisma.match.findMany({ where: { userId }, select: { job: { select: { employerId: true } } } }),
  ]);

  const employerIds = new Set<string>([
    ...saved.map((s) => s.employerId),
    ...matched.map((m) => m.job.employerId),
  ]);

  const items = [];
  const todayStart = startOfToday();

  for (const employerId of employerIds) {
    const employer = await prisma.employer.findUnique({ where: { id: employerId } });
    if (!employer || employer.hiringScore == null || employer.hiringScore < HIGH_HIRING_SCORE_THRESHOLD) continue;

    const alreadyPosted = await prisma.opportunityFeedItem.findFirst({
      where: {
        userId,
        kind: "hiring_trend",
        createdAt: { gte: todayStart },
        metadata: { path: ["employerId"], equals: employerId },
      },
    });
    if (alreadyPosted) continue;

    const item = await prisma.opportunityFeedItem.create({
      data: {
        userId,
        kind: "hiring_trend",
        title: `${employer.name} is hiring actively`,
        body: `${employer.name} currently has a hiring score of ${employer.hiringScore}/100 based on open roles Compass AI is tracking.`,
        metadata: { employerId },
      },
    });
    items.push(item);
  }

  return items;
}

export async function generateFeedForUser(userId: string) {
  const [newMatchItems, hiringTrendItems] = await Promise.all([
    generateNewMatchItems(userId),
    generateHiringTrendItems(userId),
  ]);

  return [...newMatchItems, ...hiringTrendItems];
}

export async function getFeedForUser(userId: string, days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return prisma.opportunityFeedItem.findMany({
    where: { userId, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
  });
}
