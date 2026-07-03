import { stripHtml } from "./html";
import type { NormalizedJob } from "./types";

interface LeverPosting {
  id: string;
  text: string;
  hostedUrl: string;
  createdAt: number;
  descriptionPlain?: string;
  description?: string;
  workplaceType?: string; // "remote" | "hybrid" | "on-site"
  categories?: {
    team?: string;
    location?: string;
    commitment?: string;
  };
}

function normalizeRemoteType(workplaceType: string | undefined): NormalizedJob["remoteType"] {
  if (!workplaceType) return null;
  const normalized = workplaceType.toLowerCase();
  if (normalized.includes("remote")) return "remote";
  if (normalized.includes("hybrid")) return "hybrid";
  if (normalized.includes("on-site") || normalized.includes("onsite")) return "onsite";
  return null;
}

/** Fetches public job postings for a Lever job board. `site` is the slug used
 * in the company's Lever careers URL (jobs.lever.co/{site}). */
export async function fetchLeverJobs(site: string): Promise<NormalizedJob[]> {
  const res = await fetch(
    `https://api.lever.co/v0/postings/${encodeURIComponent(site)}?mode=json`,
    { headers: { Accept: "application/json" } }
  );

  if (!res.ok) {
    throw new Error(`Lever board "${site}" returned ${res.status}`);
  }

  const postings = (await res.json()) as LeverPosting[];

  return postings.map((posting) => ({
    externalId: posting.id,
    title: posting.text,
    department: posting.categories?.team ?? null,
    description: stripHtml(posting.description) ?? posting.descriptionPlain ?? null,
    sourceUrl: posting.hostedUrl,
    postedAt: posting.createdAt ? new Date(posting.createdAt) : null,
    remoteType: normalizeRemoteType(posting.workplaceType),
    officeLabel: posting.categories?.location ?? null,
  }));
}
