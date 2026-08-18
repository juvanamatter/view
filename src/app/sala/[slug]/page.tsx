import { getRoomBySlug } from "@/lib/queries/rooms";
import { isAdminSession } from "@/lib/auth";
import { JoinRoomClient } from "@/components/call/join-room-client";

export default async function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [room, admin] = await Promise.all([getRoomBySlug(slug), isAdminSession()]);

  if (!room || !room.isActive) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="glass-card max-w-md p-8 text-center">
          <h1 className="text-xl font-semibold">Sala não encontrada</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Verifique o link com quem te convidou para a reunião.
          </p>
        </div>
      </div>
    );
  }

  return (
    <JoinRoomClient
      slug={room.slug}
      roomName={room.name}
      hasPassword={Boolean(room.password)}
      waitingRoom={room.waitingRoom}
      isAdmin={admin}
    />
  );
}
