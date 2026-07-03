import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Starter set of employers on public ATS job boards. Board tokens are best-effort
// and may drift as companies change ATS providers — `pnpm sync:jobs` skips any
// board that fails to resolve rather than failing the whole sync, and logs why.
// Update/replace entries as needed for your deployment.
const EMPLOYERS = [
  {
    name: "GitLab",
    slug: "gitlab",
    website: "https://about.gitlab.com",
    industry: "Developer Tools",
    atsProvider: "greenhouse",
    atsBoardId: "gitlab",
    offices: [{ label: "Remote (Global)", city: null, state: null, country: null, latitude: 37.7749, longitude: -122.4194, isRemoteOk: true }],
  },
  {
    name: "Figma",
    slug: "figma",
    website: "https://www.figma.com",
    industry: "Design Software",
    atsProvider: "greenhouse",
    atsBoardId: "figma",
    offices: [{ label: "San Francisco HQ", city: "San Francisco", state: "CA", country: "US", latitude: 37.7749, longitude: -122.4194, isHybrid: true }],
  },
  {
    name: "Discord",
    slug: "discord",
    website: "https://discord.com",
    industry: "Social / Communications",
    atsProvider: "greenhouse",
    atsBoardId: "discord",
    offices: [{ label: "San Francisco HQ", city: "San Francisco", state: "CA", country: "US", latitude: 37.7897, longitude: -122.3972, isHybrid: true }],
  },
  {
    name: "Robinhood",
    slug: "robinhood",
    website: "https://robinhood.com",
    industry: "Fintech",
    atsProvider: "greenhouse",
    atsBoardId: "robinhood",
    offices: [{ label: "Menlo Park HQ", city: "Menlo Park", state: "CA", country: "US", latitude: 37.4529, longitude: -122.1817, isHybrid: true }],
  },
  {
    name: "Vercel",
    slug: "vercel",
    website: "https://vercel.com",
    industry: "Developer Tools",
    atsProvider: "ashby",
    atsBoardId: "vercel",
    offices: [{ label: "Remote (Global)", city: null, state: null, country: null, latitude: 40.7128, longitude: -74.006, isRemoteOk: true }],
  },
  {
    name: "Linear",
    slug: "linear",
    website: "https://linear.app",
    industry: "Developer Tools",
    atsProvider: "ashby",
    atsBoardId: "linear",
    offices: [{ label: "Remote (Global)", city: null, state: null, country: null, latitude: 47.6062, longitude: -122.3321, isRemoteOk: true }],
  },
];

async function main() {
  for (const employer of EMPLOYERS) {
    const { offices, ...employerData } = employer;
    const created = await prisma.employer.upsert({
      where: { slug: employer.slug },
      create: employerData,
      update: employerData,
    });

    for (const office of offices) {
      const existing = await prisma.office.findFirst({
        where: { employerId: created.id, label: office.label },
      });
      if (existing) {
        await prisma.office.update({ where: { id: existing.id }, data: office });
      } else {
        await prisma.office.create({ data: { ...office, employerId: created.id } });
      }
    }

    console.log(`Seeded ${created.name}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
