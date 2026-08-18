"use client";

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

export function VideoConference({ whiteboardActive }: { whiteboardActive: boolean }) {
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
        <div className="relative size-full">
          <FocusLayout trackRef={screenShareTrack} />
          <WhiteboardOverlay active={whiteboardActive} />
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
