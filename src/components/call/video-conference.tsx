"use client";

import { useRef } from "react";
import { CarouselLayout, FocusLayout, GridLayout, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { WhiteboardOverlay } from "./whiteboard-overlay";
import { ParticipantTileWithAvatar } from "./participant-tile-with-avatar";
import { FullscreenButton } from "./fullscreen-button";

export function VideoConference() {
  const focusAreaRef = useRef<HTMLDivElement>(null);
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const screenShareTrack = tracks.find((t) => t.source === Track.Source.ScreenShare);

  if (screenShareTrack) {
    const otherTracks = tracks.filter(
      (t) =>
        !(
          t.participant.identity === screenShareTrack.participant.identity &&
          t.source === screenShareTrack.source
        )
    );

    return (
      <div className="flex size-full flex-col gap-2">
        <div ref={focusAreaRef} className="relative min-h-0 flex-1">
          <FocusLayout trackRef={screenShareTrack} />
          <WhiteboardOverlay />
          <FullscreenButton targetRef={focusAreaRef} />
        </div>
        {otherTracks.length > 0 && (
          <div className="h-28 shrink-0">
            <CarouselLayout tracks={otherTracks} orientation="horizontal" style={{ height: "100%" }}>
              <ParticipantTileWithAvatar />
            </CarouselLayout>
          </div>
        )}
      </div>
    );
  }

  return (
    <GridLayout tracks={tracks} style={{ height: "100%" }}>
      <ParticipantTileWithAvatar />
    </GridLayout>
  );
}
