"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { UserAvatar, userPhotoProps } from "@/components/shared/user-avatar";
import { formatLastSeen } from "@/lib/utils";

type RosterUser = {
  id: string;
  name: string;
  jobTitle: string | null;
  photoUrl: string | null;
  photoPositionX: number;
  photoPositionY: number;
  photoZoom: number;
  lastSeenAt: string | null;
  online: boolean;
};

export function OnlineBar() {
  const [users, setUsers] = useState<RosterUser[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    function fetchRoster() {
      fetch("/api/presence/roster")
        .then((r) => r.json())
        .then((data) => setUsers(data.users ?? []))
        .catch(() => {});
    }
    fetchRoster();
    const interval = setInterval(fetchRoster, 15_000);
    return () => clearInterval(interval);
  }, []);

  if (users.length === 0) return null;

  const onlineCount = users.filter((u) => u.online).length;

  return (
    <div className="glass-panel fixed right-4 bottom-4 z-40 w-72 overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium"
      >
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-400" />
          {onlineCount} online · {users.length} cadastrados
        </span>
        {collapsed ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
      {!collapsed && (
        <div className="max-h-80 space-y-1 overflow-y-auto border-t border-border p-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-white/5"
            >
              <div className="relative shrink-0">
                <UserAvatar name={user.name} {...userPhotoProps(user)} className="size-7" />
                <span
                  className={
                    "absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-background " +
                    (user.online ? "bg-emerald-400" : "bg-muted-foreground/40")
                  }
                />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.online ? "Online agora" : formatLastSeen(user.lastSeenAt)}
                  {user.jobTitle ? ` · ${user.jobTitle}` : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
