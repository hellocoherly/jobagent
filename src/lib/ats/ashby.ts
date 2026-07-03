import { stripHtml } from "./html";
import type { NormalizedJob } from "./types";

interface AshbyJob {
  id: string;
  title: string;
  department?: string;
  team?: string;
  location?: string;
  isRemote?: boolean;
  descriptionHtml?: string;
  descriptionPlain?: string;
  publishedAt?: string;
  jobUrl?: string;
  applyUrl?: string;
}

interface AshbyResponse {
  jobs: AshbyJob[];
}

/** Fetches public job postings for an Ashby job board. `jobBoardName` is the
 * slug used in the company's Ashby careers URL (jobs.ashbyhq.com/{jobBoardName}). */
export async function fetchAshbyJobs(jobBoardName: string): Promise<NormalizedJob[]> {
  const res = await fetch(
    `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(jobBoardName)}`,
    { headers: { Accept: "application/json" } }
  );

  if (!res.ok) {
    throw new Error(`Ashby board "${jobBoardName}" returned ${res.status}`);
  }

  const data = (await res.json()) as AshbyResponse;

  return data.jobs.map((job) => ({
    externalId: job.id,
    title: job.title,
    department: job.department ?? job.team ?? null,
    description: stripHtml(job.descriptionHtml) ?? job.descriptionPlain ?? null,
    sourceUrl: job.jobUrl ?? job.applyUrl ?? "",
    postedAt: job.publishedAt ? new Date(job.publishedAt) : null,
    remoteType: job.isRemote ? "remote" : null,
    officeLabel: job.location ?? null,
  }));
}
