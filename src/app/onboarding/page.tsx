import { ResumeUploadForm } from "@/components/resume-upload-form";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-semibold text-neutral-100">Meet your Career Agent</h1>
        <p className="max-w-md text-sm text-neutral-400">
          Upload your resume and Compass AI will build your living professional profile —
          skills, experience, and career goals — to power your Career Map.
        </p>
      </div>
      <ResumeUploadForm />
    </main>
  );
}
