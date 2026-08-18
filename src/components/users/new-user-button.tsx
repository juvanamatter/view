"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserFormSheet } from "./user-form-sheet";

export function NewUserButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Novo usuário
      </Button>
      <UserFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
