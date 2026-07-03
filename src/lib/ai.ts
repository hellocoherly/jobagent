import Anthropic from "@anthropic-ai/sdk";

export const DEFAULT_MODEL = "claude-sonnet-5";

let client: Anthropic | null = null;

export function getAnthropicClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export interface ExtractedProfile {
  headline: string;
  summary: string;
  skills: string[];
  experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string | null;
    highlights: string[];
  }>;
  achievements: string[];
  certifications: string[];
  careerGoals: string[];
  preferredIndustries: string[];
}

const PROFILE_TOOL_NAME = "submit_profile";

const profileTool: Anthropic.Tool = {
  name: PROFILE_TOOL_NAME,
  description: "Submit the structured professional profile extracted from a resume.",
  input_schema: {
    type: "object",
    properties: {
      headline: { type: "string", description: "A one-line professional headline, e.g. 'Senior Product Manager, AI Platforms'." },
      summary: { type: "string", description: "A 2-4 sentence professional summary." },
      skills: { type: "array", items: { type: "string" } },
      experience: {
        type: "array",
        items: {
          type: "object",
          properties: {
            company: { type: "string" },
            title: { type: "string" },
            startDate: { type: "string", description: "YYYY-MM if known" },
            endDate: { type: ["string", "null"], description: "YYYY-MM or null if current" },
            highlights: { type: "array", items: { type: "string" } },
          },
          required: ["company", "title", "startDate", "endDate", "highlights"],
        },
      },
      achievements: { type: "array", items: { type: "string" } },
      certifications: { type: "array", items: { type: "string" } },
      careerGoals: {
        type: "array",
        items: { type: "string" },
        description: "Inferred career goals/trajectory based on the resume, e.g. 'move into engineering leadership'.",
      },
      preferredIndustries: { type: "array", items: { type: "string" } },
    },
    required: [
      "headline",
      "summary",
      "skills",
      "experience",
      "achievements",
      "certifications",
      "careerGoals",
      "preferredIndustries",
    ],
  },
};

export async function extractProfileFromResume(resumeText: string): Promise<ExtractedProfile> {
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 4096,
    tools: [profileTool],
    tool_choice: { type: "tool", name: PROFILE_TOOL_NAME },
    messages: [
      {
        role: "user",
        content: `Extract a structured professional profile from the following resume text. Infer reasonable career goals and preferred industries from the trajectory shown, even if not explicitly stated.\n\n<resume>\n${resumeText}\n</resume>`,
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    throw new Error("Model did not return a structured profile");
  }

  return toolUse.input as ExtractedProfile;
}

export interface MatchDimensionScores {
  professionalFit: number;
  compensation: number;
  growthPotential: number;
  culture: number;
  commute: number;
  companyStability: number;
}

export interface JobMatchResult {
  score: number;
  dimensionScores: MatchDimensionScores;
  explanation: string;
  tradeoffs: string;
}

const MATCH_TOOL_NAME = "submit_match";

const matchTool: Anthropic.Tool = {
  name: MATCH_TOOL_NAME,
  description: "Submit a fit score and explanation for how well a job matches a candidate's profile.",
  input_schema: {
    type: "object",
    properties: {
      score: { type: "integer", minimum: 0, maximum: 100, description: "Overall fit score 0-100." },
      dimensionScores: {
        type: "object",
        properties: {
          professionalFit: { type: "integer", minimum: 0, maximum: 100 },
          compensation: { type: "integer", minimum: 0, maximum: 100 },
          growthPotential: { type: "integer", minimum: 0, maximum: 100 },
          culture: { type: "integer", minimum: 0, maximum: 100 },
          commute: { type: "integer", minimum: 0, maximum: 100 },
          companyStability: { type: "integer", minimum: 0, maximum: 100 },
        },
        required: ["professionalFit", "compensation", "growthPotential", "culture", "commute", "companyStability"],
      },
      explanation: {
        type: "string",
        description: "A concise, specific explanation of why this role is or isn't a good match, in the style of: 'This role increases compensation by ~15%, reduces commute by 20 minutes, and aligns with your leadership goals.'",
      },
      tradeoffs: { type: "string", description: "Key trade-offs or risks the candidate should weigh." },
    },
    required: ["score", "dimensionScores", "explanation", "tradeoffs"],
  },
};

export async function scoreJobMatch(params: {
  profile: ExtractedProfile | Record<string, unknown>;
  job: {
    title: string;
    company: string;
    description: string | null;
    compMin: number | null;
    compMax: number | null;
    remoteType: string | null;
    city: string | null;
  };
}): Promise<JobMatchResult> {
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1024,
    tools: [matchTool],
    tool_choice: { type: "tool", name: MATCH_TOOL_NAME },
    messages: [
      {
        role: "user",
        content: `You are a Career Agent evaluating how well a job opportunity fits a candidate.\n\n<candidate_profile>\n${JSON.stringify(params.profile, null, 2)}\n</candidate_profile>\n\n<job>\n${JSON.stringify(params.job, null, 2)}\n</job>\n\nScore the fit and explain your reasoning concretely, referencing specifics from the profile and job where possible.`,
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    throw new Error("Model did not return a structured match result");
  }

  return toolUse.input as JobMatchResult;
}
