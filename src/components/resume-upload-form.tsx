"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ExtractedProfile } from "@/lib/ai";

export function ResumeUploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ExtractedProfile | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please choose a resume file (.pdf or .txt).");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/resume", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to process resume");
        return;
      }

      setProfile(data.profile);
    } finally {
      setIsUploading(false);
    }
  }

  if (profile) {
    return (
      <div className="flex w-full max-w-lg flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-6">
        <h2 className="text-lg font-semibold text-neutral-100">{profile.headline}</h2>
        <p className="text-sm text-neutral-400">{profile.summary}</p>
        <div className="flex flex-wrap gap-2">
          {profile.skills.slice(0, 12).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-neutral-300"
            >
              {skill}
            </span>
          ))}
        </div>
        <button
          onClick={() => router.push("/map")}
          className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Go to my Career Map
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,text/plain,application/pdf"
        className="rounded-md border border-dashed border-neutral-700 bg-neutral-900 px-3 py-6 text-sm text-neutral-300 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-800 file:px-3 file:py-1.5 file:text-sm file:text-neutral-200"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={isUploading}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
      >
        {isUploading ? "Your Career Agent is reading your resume…" : "Upload resume"}
      </button>
    </form>
  );
}
