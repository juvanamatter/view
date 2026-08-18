"use client";

import { ParticipantTile, useEnsureTrackRef, type ParticipantTileProps } from "@livekit/components-react";
import { useHandRaise } from "./hand-raise-context";

function parsePhotoMeta(metadata?: string) {
  if (!metadata) return null;
  try {
    const data = JSON.parse(metadata) as {
      photoUrl?: string;
      photoPositionX?: number;
      photoPositionY?: number;
    };
    if (!data.photoUrl) return null;
    return {
      url: data.photoUrl,
      x: typeof data.photoPositionX === "number" ? data.photoPositionX : 50,
      y: typeof data.photoPositionY === "number" ? data.photoPositionY : 50,
    };
  } catch {
    return null;
  }
}

export function ParticipantTileWithAvatar(props: ParticipantTileProps) {
  const trackRef = useEnsureTrackRef(props.trackRef);
  const photo = parsePhotoMeta(trackRef.participant.metadata);
  const { raisedIdentities } = useHandRaise();
  const handRaised = raisedIdentities.has(trackRef.participant.identity);

  return (
    <ParticipantTile
      {...props}
      trackRef={trackRef}
      data-has-photo={photo ? "true" : undefined}
      data-hand-raised={handRaised ? "true" : undefined}
      style={
        photo
          ? ({
              ...props.style,
              "--avatar-url": `url(${photo.url})`,
              "--avatar-pos": `${photo.x}% ${photo.y}%`,
            } as React.CSSProperties)
          : props.style
      }
    />
  );
}
