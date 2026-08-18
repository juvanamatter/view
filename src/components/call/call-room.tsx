"use client";

import "@livekit/components-styles";
import { LiveKitRoom, RoomAudioRenderer, ControlBar } from "@livekit/components-react";
import type { CallSession } from "@/lib/call-types";
import { WaitingGate } from "./waiting-gate";
import { VideoConference } from "./video-conference";
import { HostWaitingPanel } from "./host-waiting-panel";

export function CallRoom({ session, isAdmin }: { session: CallSession; isAdmin: boolean }) {
  return (
    <LiveKitRoom
      token={session.token}
      serverUrl={session.livekitUrl}
      video={session.room.cameraOnEntry}
      audio={!session.room.muteOnEntry}
      data-lk-theme="default"
      style={{ height: "100dvh" }}
      onDisconnected={() => {
        window.location.href = "/";
      }}
    >
      <WaitingGate>
        <VideoConference />
        <ControlBar controls={{ screenShare: session.room.allowScreenShare }} />
      </WaitingGate>
      {isAdmin && session.room.waitingRoom && <HostWaitingPanel slug={session.room.slug} />}
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
