"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "@livekit/components-styles";
import { LiveKitRoom, RoomAudioRenderer, useRoomContext } from "@livekit/components-react";
import { AudioPresets, ScreenSharePresets, VideoPresets, type LocalAudioTrack, type LocalVideoTrack } from "livekit-client";
import type { CallSession } from "@/lib/call-types";
import { WaitingGate } from "./waiting-gate";
import { CallHeader } from "./call-header";
import { VideoConference } from "./video-conference";
import { CallControls } from "./call-controls";
import { ChatPanel } from "./chat-panel";
import { HostWaitingPanel } from "./host-waiting-panel";
import { UsageTracker } from "./usage-tracker";
import { SoundboardProvider } from "./soundboard-context";
import { BackgroundProvider } from "./background-context";
import { WhiteboardProvider } from "./whiteboard-context";
import { WhiteboardRequestPanel } from "./whiteboard-request-panel";
import { TranscriptionProvider, type TranscriptEntry } from "./transcription-context";
import { HandRaiseProvider } from "./hand-raise-context";
import { CallEndedScreen } from "./call-ended-screen";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";

function PublishHandedOffTracks({
  videoTrack,
  audioTrack,
}: {
  videoTrack: LocalVideoTrack | null;
  audioTrack: LocalAudioTrack | null;
}) {
  const room = useRoomContext();

  // Runs once: this component only ever mounts a single time, right after the
  // room connects, specifically to publish the tracks handed off from the lobby.
  useEffect(() => {
    if (videoTrack) room.localParticipant.publishTrack(videoTrack).catch(() => {});
    if (audioTrack) room.localParticipant.publishTrack(audioTrack).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function CallRoom({
  session,
  canAdmit,
  currentUserId,
  videoTrack,
  audioTrack,
}: {
  session: CallSession;
  canAdmit: boolean;
  currentUserId: string | null;
  videoTrack: LocalVideoTrack | null;
  audioTrack: LocalAudioTrack | null;
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [ended, setEnded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [finalEntries, setFinalEntries] = useState<TranscriptEntry[]>([]);
  const latestEntriesRef = useRef<TranscriptEntry[]>([]);

  const handleEntriesChange = useCallback((entries: TranscriptEntry[]) => {
    latestEntriesRef.current = entries;
  }, []);

  if (ended) {
    return (
      <CallEndedScreen
        roomName={session.room.name}
        entries={finalEntries}
        onBack={() => {
          window.location.href = "/";
        }}
      />
    );
  }

  return (
    <LiveKitRoom
      token={session.token}
      serverUrl={session.livekitUrl}
      video={false}
      audio={false}
      options={{
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: { resolution: VideoPresets.h720.resolution },
        publishDefaults: {
          videoEncoding: VideoPresets.h720.encoding,
          videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360, VideoPresets.h720],
          screenShareEncoding: ScreenSharePresets.h1080fps15.encoding,
          screenShareSimulcastLayers: [ScreenSharePresets.h720fps5, ScreenSharePresets.h1080fps15],
          audioPreset: AudioPresets.musicHighQuality,
          dtx: true,
          red: true,
        },
      }}
      data-lk-theme="reuniao"
      className="app-gradient-bg flex flex-col"
      style={{ height: "100dvh" }}
      onConnected={() => setConnected(true)}
      onDisconnected={() => {
        setFinalEntries(latestEntriesRef.current);
        setEnded(true);
      }}
    >
      {connected && <PublishHandedOffTracks videoTrack={videoTrack} audioTrack={audioTrack} />}
      <SoundboardProvider>
        <BackgroundProvider>
          <WhiteboardProvider>
            <TranscriptionProvider onEntriesChange={handleEntriesChange}>
              <HandRaiseProvider>
                <WaitingGate>
                  <CallHeader roomName={session.room.name} slug={session.room.slug} />
                  <div className="flex min-h-0 flex-1 px-4 pb-4">
                    <div className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl">
                      <VideoConference />
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
                  />
                </WaitingGate>
                <WhiteboardRequestPanel />
                {canAdmit && session.room.waitingRoom && <HostWaitingPanel slug={session.room.slug} />}
              </HandRaiseProvider>
            </TranscriptionProvider>
          </WhiteboardProvider>
        </BackgroundProvider>
      </SoundboardProvider>
      <RoomAudioRenderer />
      <UsageTracker userId={currentUserId} />
      {currentUserId && <PresenceHeartbeat />}
    </LiveKitRoom>
  );
}
