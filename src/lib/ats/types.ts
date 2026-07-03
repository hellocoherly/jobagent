export interface NormalizedJob {
  externalId: string;
  title: string;
  department: string | null;
  description: string | null;
  sourceUrl: string;
  postedAt: Date | null;
  remoteType: "remote" | "hybrid" | "onsite" | null;
  officeLabel: string | null;
}

export type AtsProvider = "greenhouse" | "lever" | "ashby";
