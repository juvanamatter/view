"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Link as LinkIcon, Pencil, Trash2, Video } from "lucide-react";
import type { Room } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RoomFormSheet, type RoomDefaults } from "./room-form-sheet";
import { RecordingsDialog } from "./recordings-dialog";
import { deleteRoomAction } from "@/lib/actions/rooms";

export function RoomRowActions({ room, defaults }: { room: Room; defaults: RoomDefaults }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [recordingsOpen, setRecordingsOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function copyLink() {
    const url = `${window.location.origin}/sala/${room.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado.");
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteRoomAction(room.id);
    setDeleting(false);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Sala excluída.");
    setDeleteOpen(false);
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={copyLink}>
            <LinkIcon />
            Copiar link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRecordingsOpen(true)}>
            <Video />
            Gravações
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RoomFormSheet open={editOpen} onOpenChange={setEditOpen} room={room} defaults={defaults} />
      <RecordingsDialog slug={room.slug} open={recordingsOpen} onOpenChange={setRecordingsOpen} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir sala &quot;{room.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              O link deixará de funcionar imediatamente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
