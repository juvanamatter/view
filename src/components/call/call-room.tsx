"use client";

import { useState } from "react";
import "@livekit/components-styles";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import { AudioPresets, VideoPresets } from "livekit-client";
import type { CallSession } from "@/lib/call-types";
import { WaitingGate } from "./waiting-gate";
import { VideoConference } from "./video-conference";
import { CallControls } from "./call-controls";
import { ChatPanel } from "./chat-panel";
import { HostWaitingPanel } from "./host-waiting-panel";
import { UsageTracker } from "./usage-tracker";
import { SoundboardProvider } from "./soundboard-context";
import { WhiteboardProvider } from "./whiteboard-context";

export function CallRoom({
  session,
  canAdmit,
  currentUserId,
}: {
  session: CallSession;
  canAdmit: boolean;
  currentUserId: string | null;
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [whiteboardActive, setWhiteboardActive] = useState(false);

  return (
    <LiveKitRoom
      token={session.token}
      serverUrl={session.livekitUrl}
      video={session.room.cameraOnEntry ? { resolution: VideoPresets.h720.resolution } : false}
      audio={
        session.room.muteOnEntry
          ? false
          : { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      }
      options={{
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: { resolution: VideoPresets.h720.resolution },
        publishDefaults: {
          videoEncoding: VideoPresets.h720.encoding,
          videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360, VideoPresets.h720],
          audioPreset: AudioPresets.musicHighQuality,
          dtx: true,
          red: true,
        },
      }}
      data-lk-theme="reuniao"
      className="app-gradient-bg flex flex-col"
      style={{ height: "100dvh" }}
      onDisconnected={() => {
        window.location.href = "/";
      }}
    >
      <SoundboardProvider>
        <WhiteboardProvider>
          <WaitingGate>
            <div className="flex min-h-0 flex-1">
              <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                <VideoConference whiteboardActive={whiteboardActive} />
              </div>
              {chatOpen && (
                <div className="fixed inset-x-4 top-4 bottom-24 z-40 md:static md:inset-auto md:z-auto md:my-2 md:mr-2 md:w-80 md:shrink-0">
                  <ChatPanel onClose={() => setChatOpen(false)} />
                </div>
              )}
            </div>
            <CallControls
              allowScreenShare={session.room.allowScreenShare}
              currentUserId={currentUserId}
              roomName={session.room.name}
              chatOpen={chatOpen}
              onToggleChat={() => setChatOpen((v) => !v)}
              whiteboardActive={whiteboardActive}
              onToggleWhiteboard={() => setWhiteboardActive((v) => !v)}
            />
          </WaitingGate>
          {canAdmit && session.room.waitingRoom && <HostWaitingPanel slug={session.room.slug} />}
        </WhiteboardProvider>
      </SoundboardProvider>
      <RoomAudioRenderer />
      <UsageTracker userId={currentUserId} />
    </LiveKitRoom>
  );
}
