"use client";

import { useEffect, useState } from "react";
import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";

export function WaitingGate({ children }: { children: React.ReactNode }) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [admitted, setAdmitted] = useState(() => localParticipant.permissions?.canSubscribe ?? true);

  useEffect(() => {
    const update = () => setAdmitted(localParticipant.permissions?.canSubscribe ?? true);
    update();
    room.on(RoomEvent.ParticipantPermissionsChanged, update);
    return () => {
      room.off(RoomEvent.ParticipantPermissionsChanged, update);
    };
  }, [room, localParticipant]);

  if (!admitted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="glass-card max-w-sm p-8">
          <p className="text-lg font-medium">Aguardando aprovação do anfitrião…</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Você entrará na reunião assim que for admitido.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
