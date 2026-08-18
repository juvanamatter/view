import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserAvatar, userPhotoProps } from "@/components/shared/user-avatar";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { UserRowActions } from "./user-row-actions";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  jobTitle: string | null;
  photoUrl: string | null;
  photoPositionX: number;
  photoPositionY: number;
  photoZoom: number;
  activeSeconds: number;
  screenShareCount: number;
  createdAt: Date;
};

export function UsersTable({ users }: { users: UserRow[] }) {
  if (users.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center gap-1 p-10 text-center">
        <p className="text-sm font-medium">Nenhum usuário cadastrado ainda</p>
        <p className="text-sm text-muted-foreground">
          Clique em &quot;Novo usuário&quot; para dar acesso a alguém.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Tempo de uso</TableHead>
            <TableHead>Telas compartilhadas</TableHead>
            <TableHead>Desde</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <UserAvatar name={user.name} {...userPhotoProps(user)} />
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{user.jobTitle ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                  {user.role === "ADMIN" ? "Administrador" : "Usuário"}
                </Badge>
              </TableCell>
              <TableCell>{formatDuration(user.activeSeconds)}</TableCell>
              <TableCell>{user.screenShareCount}</TableCell>
              <TableCell>{formatDateTime(user.createdAt)}</TableCell>
              <TableCell>
                <UserRowActions user={user} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
