"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { UserAvatar, userPhotoProps } from "@/components/shared/user-avatar";

type OnlineUser = {
  id: string;
  name: string;
  jobTitle: string | null;
  photoUrl: string | null;
  photoPositionX: number;
  photoPositionY: number;
  photoZoom: number;
};

export function OnlineBar() {
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    function fetchOnline() {
      fetch("/api/presence/online")
        .then((r) => r.json())
        .then((data) => setUsers(data.users ?? []))
        .catch(() => {});
    }
    fetchOnline();
    const interval = setInterval(fetchOnline, 15_000);
    return () => clearInterval(interval);
  }, []);

  if (users.length === 0) return null;

  return (
    <div className="glass-panel fixed right-4 bottom-4 z-40 w-64 overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium"
      >
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-400" />
          {users.length} online
        </span>
        {collapsed ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
      {!collapsed && (
        <div className="max-h-64 space-y-1 overflow-y-auto border-t border-border p-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-white/5"
            >
              <div className="relative shrink-0">
                <UserAvatar name={user.name} {...userPhotoProps(user)} className="size-7" />
                <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-400" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm">{user.name}</span>
                {user.jobTitle && (
                  <span className="truncate text-xs text-muted-foreground">{user.jobTitle}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
