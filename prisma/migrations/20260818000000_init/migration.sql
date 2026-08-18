-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL,
    "brandName" TEXT NOT NULL DEFAULT 'Reunião',
    "defaultMaxParticipants" INTEGER NOT NULL DEFAULT 12,
    "defaultMuteOnEntry" BOOLEAN NOT NULL DEFAULT false,
    "defaultCameraOnEntry" BOOLEAN NOT NULL DEFAULT true,
    "defaultAllowScreenShare" BOOLEAN NOT NULL DEFAULT true,
    "defaultWaitingRoom" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "hostName" TEXT NOT NULL,
    "password" TEXT,
    "maxParticipants" INTEGER NOT NULL DEFAULT 12,
    "muteOnEntry" BOOLEAN NOT NULL DEFAULT false,
    "cameraOnEntry" BOOLEAN NOT NULL DEFAULT true,
    "allowScreenShare" BOOLEAN NOT NULL DEFAULT true,
    "waitingRoom" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_slug_key" ON "Room"("slug");

