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

export function SidebarPresence() {
  const [users, setUsers] = useState<RosterUser[]>([]);
  const [collapsed, setCollapsed] = useState(true);

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
    <div className="mt-6 border-t border-white/10 pt-3">
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center justify-between px-1 py-1 text-xs font-medium text-muted-foreground"
      >
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-400" />
          {onlineCount} online · {users.length} cadastrados
        </span>
        {collapsed ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
      </button>
      {!collapsed && (
        <div className="mt-1 max-h-[45vh] space-y-1 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-white/5"
            >
              <div className="relative shrink-0">
                <UserAvatar name={user.name} {...userPhotoProps(user)} className="size-6" />
                <span
                  className={
                    "absolute -right-0.5 -bottom-0.5 size-2 rounded-full border-2 border-background " +
                    (user.online ? "bg-emerald-400" : "bg-muted-foreground/40")
                  }
                />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-xs font-medium">{user.name}</span>
                <span className="truncate text-[10px] text-muted-foreground">
                  {user.online ? "Online agora" : formatLastSeen(user.lastSeenAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
