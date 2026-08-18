"use client";

import { useRef } from "react";
import {
  CarouselLayout,
  FocusLayout,
  FocusLayoutContainer,
  GridLayout,
  useTracks,
} from "@livekit/components-react";
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
      <FocusLayoutContainer style={{ height: "100%" }}>
        <CarouselLayout tracks={otherTracks}>
          <ParticipantTileWithAvatar />
        </CarouselLayout>
        <div ref={focusAreaRef} className="relative size-full">
          <FocusLayout trackRef={screenShareTrack} />
          <WhiteboardOverlay />
          <FullscreenButton targetRef={focusAreaRef} />
        </div>
      </FocusLayoutContainer>
    );
  }

  return (
    <GridLayout tracks={tracks} style={{ height: "100%" }}>
      <ParticipantTileWithAvatar />
    </GridLayout>
  );
}
