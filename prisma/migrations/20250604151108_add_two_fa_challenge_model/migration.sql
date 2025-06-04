-- CreateTable
CREATE TABLE "TwoFAChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "method" TEXT NOT NULL,
    CONSTRAINT "TwoFAChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TwoFAChallenge_userId_idx" ON "TwoFAChallenge"("userId");

-- CreateIndex
CREATE INDEX "TwoFAChallenge_createdAt_idx" ON "TwoFAChallenge"("createdAt");
