"use client";

import { useState } from "react";
import { PreJoinForm } from "./pre-join-form";
import { CallRoom } from "./call-room";
import type { CallSession } from "@/lib/call-types";

export function JoinRoomClient({
  slug,
  roomName,
  hasPassword,
  waitingRoom,
  isAdmin,
}: {
  slug: string;
  roomName: string;
  hasPassword: boolean;
  waitingRoom: boolean;
  isAdmin: boolean;
}) {
  const [session, setSession] = useState<CallSession | null>(null);

  if (session) {
    return <CallRoom session={session} isAdmin={isAdmin} />;
  }

  return (
    <PreJoinForm
      slug={slug}
      roomName={roomName}
      hasPassword={hasPassword}
      waitingRoom={waitingRoom}
      onJoined={setSession}
    />
  );
}
