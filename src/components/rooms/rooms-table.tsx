import type { Room } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import { RoomRowActions } from "./room-row-actions";
import type { RoomDefaults } from "./room-form-sheet";

export function RoomsTable({ rooms, defaults }: { rooms: Room[]; defaults: RoomDefaults }) {
  if (rooms.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center gap-1 p-10 text-center">
        <p className="text-sm font-medium">Nenhuma sala criada ainda</p>
        <p className="text-sm text-muted-foreground">
          Clique em &quot;Nova sala&quot; para gerar seu primeiro link de reunião.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sala</TableHead>
            <TableHead>Anfitrião</TableHead>
            <TableHead>Config.</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criada em</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{room.name}</span>
                  <span className="text-xs text-muted-foreground">/sala/{room.slug}</span>
                </div>
              </TableCell>
              <TableCell>{room.hostName}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {room.password && <Badge variant="secondary">Com senha</Badge>}
                  {room.waitingRoom && <Badge variant="secondary">Sala de espera</Badge>}
                  {!room.allowScreenShare && <Badge variant="secondary">Sem tela</Badge>}
                  <Badge variant="secondary">Até {room.maxParticipants}</Badge>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={room.isActive ? "default" : "secondary"}>
                  {room.isActive ? "Ativa" : "Inativa"}
                </Badge>
              </TableCell>
              <TableCell>{formatDateTime(room.createdAt)}</TableCell>
              <TableCell>
                <RoomRowActions room={room} defaults={defaults} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
