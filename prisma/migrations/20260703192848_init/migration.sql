-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "summary" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experience" JSONB,
    "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "careerGoals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredIndustries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "workStyle" TEXT,
    "compMinExpectation" INTEGER,
    "compMaxExpectation" INTEGER,
    "homeLatitude" DOUBLE PRECISION,
    "homeLongitude" DOUBLE PRECISION,
    "maxCommuteMins" INTEGER,
    "openToRelocate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "parsedData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "website" TEXT,
    "logoUrl" TEXT,
    "industry" TEXT,
    "description" TEXT,
    "atsProvider" TEXT,
    "atsBoardId" TEXT,
    "hiringScore" INTEGER,
    "growthRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Office" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "isHybrid" BOOLEAN NOT NULL DEFAULT false,
    "isRemoteOk" BOOLEAN NOT NULL DEFAULT false,
    "officeSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "officeId" TEXT,
    "title" TEXT NOT NULL,
    "department" TEXT,
    "description" TEXT,
    "seniority" TEXT,
    "remoteType" TEXT,
    "compMin" INTEGER,
    "compMax" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "sourceUrl" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "dimensionScores" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "tradeoffs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedEmployer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedEmployer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunityFeedItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpportunityFeedItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_slug_key" ON "Employer"("slug");

-- CreateIndex
CREATE INDEX "Employer_atsProvider_atsBoardId_idx" ON "Employer"("atsProvider", "atsBoardId");

-- CreateIndex
CREATE INDEX "Office_employerId_idx" ON "Office"("employerId");

-- CreateIndex
CREATE INDEX "Job_officeId_idx" ON "Job"("officeId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_employerId_externalId_key" ON "Job"("employerId", "externalId");

-- CreateIndex
CREATE INDEX "Match_userId_score_idx" ON "Match"("userId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "Match_userId_jobId_key" ON "Match"("userId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedEmployer_userId_employerId_key" ON "SavedEmployer"("userId", "employerId");

-- CreateIndex
CREATE INDEX "OpportunityFeedItem_userId_createdAt_idx" ON "OpportunityFeedItem"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedEmployer" ADD CONSTRAINT "SavedEmployer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedEmployer" ADD CONSTRAINT "SavedEmployer_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityFeedItem" ADD CONSTRAINT "OpportunityFeedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
