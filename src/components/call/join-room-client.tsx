"use client";

import { useState } from "react";
import { PreJoinForm, type JoinChoices } from "./pre-join-form";
import { CallRoom } from "./call-room";
import type { CallSession } from "@/lib/call-types";

type CurrentUser = { id: string; name: string } | null;

export function JoinRoomClient({
  slug,
  roomName,
  hasPassword,
  waitingRoom,
  defaultCameraOn,
  defaultMicOn,
  canAdmit,
  currentUser,
}: {
  slug: string;
  roomName: string;
  hasPassword: boolean;
  waitingRoom: boolean;
  defaultCameraOn: boolean;
  defaultMicOn: boolean;
  canAdmit: boolean;
  currentUser: CurrentUser;
}) {
  const [joined, setJoined] = useState<{ session: CallSession; choices: JoinChoices } | null>(null);

  if (joined) {
    return (
      <CallRoom
        session={joined.session}
        canAdmit={canAdmit}
        currentUserId={currentUser?.id ?? null}
        initialCameraOn={joined.choices.cameraOn}
        initialMicOn={joined.choices.micOn}
        cameraDeviceId={joined.choices.cameraDeviceId}
        micDeviceId={joined.choices.micDeviceId}
      />
    );
  }

  return (
    <PreJoinForm
      slug={slug}
      roomName={roomName}
      hasPassword={hasPassword}
      waitingRoom={waitingRoom}
      defaultCameraOn={defaultCameraOn}
      defaultMicOn={defaultMicOn}
      accountName={currentUser?.name ?? null}
      onJoined={(session, choices) => setJoined({ session, choices })}
    />
  );
}
