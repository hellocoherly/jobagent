import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-semibold text-neutral-100">Welcome back</h1>
        <p className="text-sm text-neutral-400">Log in to your Compass AI Career Agent.</p>
      </div>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
      <p className="text-sm text-neutral-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-400 hover:underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
