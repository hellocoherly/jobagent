"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SavedEmployerCard({
  employerId,
  name,
  industry,
  hiringScore,
  openJobsCount,
  officeLabels,
}: {
  employerId: string;
  name: string;
  industry: string | null;
  hiringScore: number | null;
  openJobsCount: number;
  officeLabels: string[];
}) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleRemove() {
    setIsRemoving(true);
    try {
      const res = await fetch(`/api/saved-employers/${employerId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div>
        <h3 className="text-sm font-semibold text-neutral-100">{name}</h3>
        <p className="text-xs text-neutral-500">{officeLabels.join(" · ") || "No offices listed"}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-300">
          {industry && <span className="rounded-full bg-neutral-800 px-2 py-0.5">{industry}</span>}
          {hiringScore != null && (
            <span className="rounded-full bg-neutral-800 px-2 py-0.5">Hiring score {hiringScore}</span>
          )}
          <span className="rounded-full bg-neutral-800 px-2 py-0.5">{openJobsCount} open roles</span>
        </div>
      </div>
      <button
        onClick={handleRemove}
        disabled={isRemoving}
        className="shrink-0 rounded-md border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}
