import { getCurrentUser } from "@/lib/session";
import { getSavedEmployersForUser } from "@/lib/saved-employers";
import { SavedEmployerCard } from "@/components/saved-employer-card";

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const saved = await getSavedEmployersForUser(user.id);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-xl font-semibold text-neutral-100">Saved Employers</h1>
        <p className="text-sm text-neutral-400">Employers you&apos;re keeping an eye on.</p>
      </div>

      {saved.length === 0 && (
        <div className="rounded-lg border border-dashed border-neutral-800 p-8 text-center text-sm text-neutral-500">
          You haven&apos;t saved any employers yet. Save one from the Career Map.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {saved.map(({ employer, openJobsCount }) => (
          <SavedEmployerCard
            key={employer.id}
            employerId={employer.id}
            name={employer.name}
            industry={employer.industry}
            hiringScore={employer.hiringScore}
            openJobsCount={openJobsCount}
            officeLabels={employer.offices.map((o) => o.label)}
          />
        ))}
      </div>
    </main>
  );
}
