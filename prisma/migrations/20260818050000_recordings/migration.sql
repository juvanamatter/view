-- CreateTable
CREATE TABLE "Recording" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "egressId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'STARTING',
    "fileKey" TEXT,
    "durationSec" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Recording_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recording_egressId_key" ON "Recording"("egressId");

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

