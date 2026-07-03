import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/map");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-24 text-center">
      <div className="flex flex-col items-center gap-4">
        <span className="text-sm font-medium uppercase tracking-widest text-blue-400">
          Compass AI
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold text-neutral-50 sm:text-5xl">
          Discover where your career belongs.
        </h1>
        <p className="max-w-xl text-lg text-neutral-400">
          Your AI Career Agent understands who you are, monitors the job market, and explains
          every recommendation — so you make your next career move with confidence.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-200 transition hover:bg-neutral-900"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}
