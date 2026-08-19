-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "isSecret" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "invitedUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
