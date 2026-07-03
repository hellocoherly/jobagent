import { stripHtml } from "./html";
import type { NormalizedJob } from "./types";

interface GreenhouseJob {
  id: number;
  title: string;
  updated_at: string;
  absolute_url: string;
  content?: string;
  location?: { name?: string };
  departments?: Array<{ name?: string }>;
  offices?: Array<{ name?: string }>;
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[];
}

function guessRemoteType(locationName: string | undefined): NormalizedJob["remoteType"] {
  if (!locationName) return null;
  const normalized = locationName.toLowerCase();
  if (normalized.includes("remote")) return "remote";
  if (normalized.includes("hybrid")) return "hybrid";
  return "onsite";
}

/** Fetches public job postings for a Greenhouse job board. `boardToken` is the
 * slug used in the company's Greenhouse careers URL. */
export async function fetchGreenhouseJobs(boardToken: string): Promise<NormalizedJob[]> {
  const res = await fetch(
    `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(boardToken)}/jobs?content=true`,
    { headers: { Accept: "application/json" } }
  );

  if (!res.ok) {
    throw new Error(`Greenhouse board "${boardToken}" returned ${res.status}`);
  }

  const data = (await res.json()) as GreenhouseResponse;

  return data.jobs.map((job) => ({
    externalId: String(job.id),
    title: job.title,
    department: job.departments?.[0]?.name ?? null,
    description: stripHtml(job.content),
    sourceUrl: job.absolute_url,
    postedAt: job.updated_at ? new Date(job.updated_at) : null,
    remoteType: guessRemoteType(job.location?.name),
    officeLabel: job.offices?.[0]?.name ?? job.location?.name ?? null,
  }));
}
