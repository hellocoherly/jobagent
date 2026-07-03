import { prisma } from "@/lib/db";

export interface MapJob {
  id: string;
  title: string;
  department: string | null;
  remoteType: string | null;
  compMin: number | null;
  compMax: number | null;
  sourceUrl: string;
  matchScore: number | null;
  matchExplanation: string | null;
}

export interface MapOffice {
  id: string;
  label: string;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  isHybrid: boolean;
  isRemoteOk: boolean;
  officeSize: number | null;
  employer: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    industry: string | null;
    description: string | null;
    website: string | null;
    hiringScore: number | null;
  };
  jobs: MapJob[];
  bestMatchScore: number | null;
  isSaved: boolean;
}

export async function getCareerMapData(userId: string | null): Promise<MapOffice[]> {
  const offices = await prisma.office.findMany({
    include: {
      employer: true,
      jobs: {
        where: { status: "open" },
        select: { id: true, title: true, department: true, remoteType: true, compMin: true, compMax: true, sourceUrl: true },
        orderBy: { postedAt: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const jobIds = offices.flatMap((office) => office.jobs.map((job) => job.id));

  const [matches, savedEmployerIds] = await Promise.all([
    userId
      ? prisma.match.findMany({
          where: { userId, jobId: { in: jobIds } },
          select: { jobId: true, score: true, explanation: true },
        })
      : Promise.resolve([]),
    userId
      ? prisma.savedEmployer.findMany({ where: { userId }, select: { employerId: true } })
      : Promise.resolve([]),
  ]);

  const matchByJobId = new Map(matches.map((m) => [m.jobId, m]));
  const savedSet = new Set(savedEmployerIds.map((s) => s.employerId));

  return offices.map((office) => {
    const jobs: MapJob[] = office.jobs.map((job) => {
      const match = matchByJobId.get(job.id);
      return {
        ...job,
        matchScore: match?.score ?? null,
        matchExplanation: match?.explanation ?? null,
      };
    });

    const bestMatchScore = jobs.reduce<number | null>((best, job) => {
      if (job.matchScore == null) return best;
      return best == null ? job.matchScore : Math.max(best, job.matchScore);
    }, null);

    return {
      id: office.id,
      label: office.label,
      city: office.city,
      state: office.state,
      country: office.country,
      latitude: office.latitude,
      longitude: office.longitude,
      isHybrid: office.isHybrid,
      isRemoteOk: office.isRemoteOk,
      officeSize: office.officeSize,
      employer: {
        id: office.employer.id,
        name: office.employer.name,
        slug: office.employer.slug,
        logoUrl: office.employer.logoUrl,
        industry: office.employer.industry,
        description: office.employer.description,
        website: office.employer.website,
        hiringScore: office.employer.hiringScore,
      },
      jobs,
      bestMatchScore,
      isSaved: savedSet.has(office.employer.id),
    };
  });
}
