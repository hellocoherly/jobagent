import { fetchGreenhouseJobs } from "./greenhouse";
import { fetchLeverJobs } from "./lever";
import { fetchAshbyJobs } from "./ashby";
import type { AtsProvider, NormalizedJob } from "./types";

export type { NormalizedJob, AtsProvider } from "./types";

export async function fetchJobsForBoard(provider: AtsProvider, boardId: string): Promise<NormalizedJob[]> {
  switch (provider) {
    case "greenhouse":
      return fetchGreenhouseJobs(boardId);
    case "lever":
      return fetchLeverJobs(boardId);
    case "ashby":
      return fetchAshbyJobs(boardId);
    default:
      throw new Error(`Unsupported ATS provider: ${provider}`);
  }
}
