import { getRoomList } from "@/lib/queries/rooms";
import { getAppSettings } from "@/lib/queries/app-settings";
import { RoomsTable } from "@/components/rooms/rooms-table";
import { NewRoomButton } from "@/components/rooms/new-room-button";
import { LiveRoomsPanel } from "@/components/rooms/live-rooms-panel";

export const dynamic = "force-dynamic";

export default async function SalasPage() {
  const [rooms, settings] = await Promise.all([getRoomList(), getAppSettings()]);

  const defaults = {
    maxParticipants: settings.defaultMaxParticipants,
    muteOnEntry: settings.defaultMuteOnEntry,
    cameraOnEntry: settings.defaultCameraOnEntry,
    allowScreenShare: settings.defaultAllowScreenShare,
    waitingRoom: settings.defaultWaitingRoom,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Salas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Crie links de reunião e configure as regras de entrada de cada um.
          </p>
        </div>
        <NewRoomButton defaults={defaults} />
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Reuniões ao vivo</h2>
        <LiveRoomsPanel />
      </div>

      <RoomsTable rooms={rooms} defaults={defaults} />
    </div>
  );
}
