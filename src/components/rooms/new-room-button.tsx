"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomFormSheet, type RoomDefaults } from "./room-form-sheet";

export function NewRoomButton({ defaults }: { defaults: RoomDefaults }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Nova sala
      </Button>
      <RoomFormSheet open={open} onOpenChange={setOpen} defaults={defaults} />
    </>
  );
}
