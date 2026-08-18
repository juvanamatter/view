-- CreateTable
CREATE TABLE "RoomVisit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomVisit_userId_joinedAt_idx" ON "RoomVisit"("userId", "joinedAt");

-- AddForeignKey
ALTER TABLE "RoomVisit" ADD CONSTRAINT "RoomVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomVisit" ADD CONSTRAINT "RoomVisit_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
