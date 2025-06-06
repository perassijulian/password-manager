/*
  Warnings:

  - Added the required column `context` to the `TwoFAChallenge` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TwoFAChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "code" TEXT,
    "method" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "actionType" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "deviceId" TEXT,
    CONSTRAINT "TwoFAChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TwoFAChallenge" ("code", "createdAt", "expiresAt", "id", "ipAddress", "isVerified", "method", "userAgent", "userId") SELECT "code", "createdAt", "expiresAt", "id", "ipAddress", "isVerified", "method", "userAgent", "userId" FROM "TwoFAChallenge";
DROP TABLE "TwoFAChallenge";
ALTER TABLE "new_TwoFAChallenge" RENAME TO "TwoFAChallenge";
CREATE INDEX "TwoFAChallenge_userId_idx" ON "TwoFAChallenge"("userId");
CREATE INDEX "TwoFAChallenge_createdAt_idx" ON "TwoFAChallenge"("createdAt");
CREATE INDEX "TwoFAChallenge_context_idx" ON "TwoFAChallenge"("context");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
