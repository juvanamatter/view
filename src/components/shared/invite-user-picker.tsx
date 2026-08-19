"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type RosterUser = { id: string; name: string; jobTitle: string | null };

export function InviteUserPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [users, setUsers] = useState<RosterUser[]>([]);

  useEffect(() => {
    fetch("/api/presence/roster")
      .then((r) => r.json())
      .then((data) => setUsers(data.users ?? []))
      .catch(() => {});
  }, []);

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  return (
    <div className="max-h-48 space-y-0.5 overflow-y-auto rounded-lg border border-border p-2">
      {users.length === 0 ? (
        <p className="p-2 text-center text-xs text-muted-foreground">Carregando pessoas...</p>
      ) : (
        users.map((user) => (
          <label
            key={user.id}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-white/5",
              selected.includes(user.id) && "bg-white/5"
            )}
          >
            <input
              type="checkbox"
              checked={selected.includes(user.id)}
              onChange={() => toggle(user.id)}
              className="accent-primary"
            />
            <span className="truncate">{user.name}</span>
            {user.jobTitle && (
              <span className="truncate text-xs text-muted-foreground">{user.jobTitle}</span>
            )}
          </label>
        ))
      )}
    </div>
  );
}
