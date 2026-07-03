"use client";

import type { MapOffice } from "@/lib/map-data";

export function EmployerPanel({
  office,
  isSaved,
  onToggleSaved,
  onClose,
}: {
  office: MapOffice;
  isSaved: boolean;
  onToggleSaved: () => void;
  onClose: () => void;
}) {
  const location = [office.city, office.state, office.country].filter(Boolean).join(", ") || office.label;

  return (
    <aside className="flex w-full max-w-sm flex-col gap-4 overflow-y-auto border-l border-neutral-800 bg-neutral-950 p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-neutral-100">{office.employer.name}</h2>
          <p className="text-sm text-neutral-400">{location}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-neutral-300">
        {office.employer.industry && (
          <span className="rounded-full bg-neutral-800 px-2.5 py-1">{office.employer.industry}</span>
        )}
        {office.employer.hiringScore != null && (
          <span className="rounded-full bg-neutral-800 px-2.5 py-1">Hiring score {office.employer.hiringScore}</span>
        )}
        {office.isHybrid && <span className="rounded-full bg-neutral-800 px-2.5 py-1">Hybrid</span>}
        {office.isRemoteOk && <span className="rounded-full bg-neutral-800 px-2.5 py-1">Remote OK</span>}
        {office.bestMatchScore != null && (
          <span className="rounded-full bg-blue-900/60 px-2.5 py-1 text-blue-200">
            AI Match {office.bestMatchScore}
          </span>
        )}
      </div>

      {office.employer.description && (
        <p className="text-sm text-neutral-400">{office.employer.description}</p>
      )}

      <button
        onClick={onToggleSaved}
        className={`self-start rounded-md px-3 py-1.5 text-sm font-medium transition ${
          isSaved
            ? "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
            : "bg-blue-600 text-white hover:bg-blue-500"
        }`}
      >
        {isSaved ? "★ Saved" : "☆ Save employer"}
      </button>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-neutral-200">
          Open roles ({office.jobs.length})
        </h3>
        {office.jobs.length === 0 && (
          <p className="text-sm text-neutral-500">No open roles at this office right now.</p>
        )}
        {office.jobs
          .slice()
          .sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1))
          .map((job) => (
            <a
              key={job.id}
              href={job.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col gap-1 rounded-md border border-neutral-800 p-3 text-sm hover:border-neutral-700"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-neutral-100">{job.title}</span>
                {job.matchScore != null && (
                  <span className="shrink-0 rounded-full bg-blue-900/60 px-2 py-0.5 text-xs text-blue-200">
                    {job.matchScore}% fit
                  </span>
                )}
              </div>
              {job.department && <span className="text-xs text-neutral-500">{job.department}</span>}
              {job.matchExplanation && (
                <p className="text-xs text-neutral-400">{job.matchExplanation}</p>
              )}
            </a>
          ))}
      </div>
    </aside>
  );
}
