import { prisma } from "@/lib/prisma";

export function getRecordingsByRoom(roomId: string) {
  return prisma.recording.findMany({ where: { roomId }, orderBy: { startedAt: "desc" } });
}

export function getActiveRecording(roomId: string) {
  return prisma.recording.findFirst({
    where: { roomId, status: { in: ["STARTING", "ACTIVE", "ENDING"] } },
  });
}
