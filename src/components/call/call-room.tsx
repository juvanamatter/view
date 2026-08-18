"use client";

import "@livekit/components-styles";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import type { CallSession } from "@/lib/call-types";
import { WaitingGate } from "./waiting-gate";
import { VideoConference } from "./video-conference";
import { CallControls } from "./call-controls";
import { HostWaitingPanel } from "./host-waiting-panel";

export function CallRoom({ session, isAdmin }: { session: CallSession; isAdmin: boolean }) {
  return (
    <LiveKitRoom
      token={session.token}
      serverUrl={session.livekitUrl}
      video={session.room.cameraOnEntry}
      audio={!session.room.muteOnEntry}
      data-lk-theme="reuniao"
      className="app-gradient-bg flex flex-col"
      style={{ height: "100dvh" }}
      onDisconnected={() => {
        window.location.href = "/";
      }}
    >
      <WaitingGate>
        <div className="min-h-0 flex-1 overflow-hidden">
          <VideoConference />
        </div>
        <CallControls allowScreenShare={session.room.allowScreenShare} />
      </WaitingGate>
      {isAdmin && session.room.waitingRoom && <HostWaitingPanel slug={session.room.slug} />}
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
