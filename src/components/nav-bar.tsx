import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";

const LINKS = [
  { href: "/map", label: "Career Map" },
  { href: "/feed", label: "Opportunity Feed" },
  { href: "/saved", label: "Saved" },
  { href: "/onboarding", label: "Profile" },
];

export async function NavBar() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4">
      <div className="flex items-center gap-6">
        <Link href="/map" className="text-sm font-semibold text-neutral-50">
          Compass AI
        </Link>
        <nav className="flex items-center gap-4">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-400 transition hover:text-neutral-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-500">{user.name ?? user.email}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
