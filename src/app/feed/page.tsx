import { getCurrentUser } from "@/lib/session";
import { getFeedForUser } from "@/lib/feed";
import { RefreshFeedButton } from "@/components/refresh-feed-button";

const KIND_LABEL: Record<string, string> = {
  new_match: "New match",
  recruiter_interest: "Recruiter interest",
  hiring_trend: "Hiring trend",
  market_value: "Market value",
  profile_improvement: "Profile tip",
};

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const items = await getFeedForUser(user.id);

  const groups = new Map<string, typeof items>();
  for (const item of items) {
    const key = formatDay(item.createdAt);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-100">Opportunity Feed</h1>
          <p className="text-sm text-neutral-400">What your Career Agent found for you.</p>
        </div>
        <RefreshFeedButton />
      </div>

      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-neutral-800 p-8 text-center text-sm text-neutral-500">
          No opportunities yet. Upload a resume and hit &ldquo;Refresh feed&rdquo; to have your Career Agent
          start scanning the market.
        </div>
      )}

      {Array.from(groups.entries()).map(([day, dayItems]) => (
        <section key={day} className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-neutral-500">{day}</h2>
          {dayItems.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-1 rounded-lg border border-neutral-800 bg-neutral-900 p-4"
            >
              <span className="w-fit rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
                {KIND_LABEL[item.kind] ?? item.kind}
              </span>
              <h3 className="text-sm font-semibold text-neutral-100">{item.title}</h3>
              <p className="text-sm text-neutral-400">{item.body}</p>
            </article>
          ))}
        </section>
      ))}
    </main>
  );
}
