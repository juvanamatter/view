"use client";

import { useState } from "react";
import { PreJoinForm } from "./pre-join-form";
import { CallRoom } from "./call-room";
import type { CallSession } from "@/lib/call-types";

type CurrentUser = { id: string; name: string } | null;

export function JoinRoomClient({
  slug,
  roomName,
  hasPassword,
  waitingRoom,
  canAdmit,
  currentUser,
}: {
  slug: string;
  roomName: string;
  hasPassword: boolean;
  waitingRoom: boolean;
  canAdmit: boolean;
  currentUser: CurrentUser;
}) {
  const [session, setSession] = useState<CallSession | null>(null);

  if (session) {
    return <CallRoom session={session} canAdmit={canAdmit} currentUserId={currentUser?.id ?? null} />;
  }

  return (
    <PreJoinForm
      slug={slug}
      roomName={roomName}
      hasPassword={hasPassword}
      waitingRoom={waitingRoom}
      initialName={currentUser?.name ?? ""}
      onJoined={setSession}
    />
  );
}
