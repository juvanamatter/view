"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationItem = { id: string; text: string; href: string };

export function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    function load() {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data) => setItems(data.items ?? []))
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="relative" />}>
        <Bell className="size-4" />
        {items.length > 0 && (
          <span className="absolute top-1 right-1 size-2 rounded-full bg-fuchsia-500" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {items.length === 0 ? (
          <p className="p-3 text-center text-sm text-muted-foreground">
            Nenhuma notificação por enquanto.
          </p>
        ) : (
          items.map((item) => (
            <DropdownMenuItem key={item.id} render={<Link href={item.href} />}>
              {item.text}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
