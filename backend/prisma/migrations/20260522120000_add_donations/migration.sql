-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "email" TEXT,
    "userId" TEXT,
    "stripeSessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Donation_stripeSessionId_key" ON "Donation"("stripeSessionId");
