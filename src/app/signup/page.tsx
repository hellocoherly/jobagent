import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-semibold text-neutral-100">Create your Career Agent</h1>
        <p className="text-sm text-neutral-400">
          Compass AI will start understanding your career the moment you sign up.
        </p>
      </div>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
      <p className="text-sm text-neutral-400">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-400 hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
