import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { extractProfileFromResume } from "@/lib/ai";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  }

  return buffer.toString("utf-8");
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("resume");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No resume file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 10MB)" }, { status: 400 });
  }

  const rawText = (await extractText(file)).trim();
  if (!rawText) {
    return NextResponse.json({ error: "Could not extract any text from the file" }, { status: 422 });
  }

  const extracted = await extractProfileFromResume(rawText);

  const [resume, profile] = await prisma.$transaction([
    prisma.resume.create({
      data: {
        userId: user.id,
        fileName: file.name,
        mimeType: file.type || "text/plain",
        rawText,
        parsedData: extracted as unknown as object,
      },
    }),
    prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        headline: extracted.headline,
        summary: extracted.summary,
        skills: extracted.skills,
        experience: extracted.experience as unknown as object,
        achievements: extracted.achievements,
        certifications: extracted.certifications,
        careerGoals: extracted.careerGoals,
        preferredIndustries: extracted.preferredIndustries,
      },
      update: {
        headline: extracted.headline,
        summary: extracted.summary,
        skills: extracted.skills,
        experience: extracted.experience as unknown as object,
        achievements: extracted.achievements,
        certifications: extracted.certifications,
        careerGoals: extracted.careerGoals,
        preferredIndustries: extracted.preferredIndustries,
      },
    }),
  ]);

  return NextResponse.json({ resumeId: resume.id, profile });
}
