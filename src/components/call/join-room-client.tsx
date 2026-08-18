"use client";

import { useEffect, useState } from "react";
import { PreJoinForm } from "./pre-join-form";
import { CallRoom } from "./call-room";
import type { CallSession } from "@/lib/call-types";

type CurrentUser = { id: string; name: string } | null;

async function requestToken(slug: string, participantName: string, password: string) {
  const res = await fetch("/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, participantName, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Não foi possível entrar na sala.");
  return data as CallSession;
}

export function JoinRoomClient({
  slug,
  roomName,
  hasPassword,
  waitingRoom,
  canAdmit,
  currentUser,
}: {
  slug: string;
  roomName: string;
  hasPassword: boolean;
  waitingRoom: boolean;
  canAdmit: boolean;
  currentUser: CurrentUser;
}) {
  const [session, setSession] = useState<CallSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const autoJoin = Boolean(currentUser) && !hasPassword;

  useEffect(() => {
    if (!autoJoin || session || !currentUser) return;
    requestToken(slug, currentUser.name, "")
      .then(setSession)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Não foi possível entrar na sala.");
      });
  }, [autoJoin, session, slug, currentUser]);

  if (session) {
    return <CallRoom session={session} canAdmit={canAdmit} currentUserId={currentUser?.id ?? null} />;
  }

  if (autoJoin) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className={error ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
          {error ?? "Entrando na reunião..."}
        </p>
      </div>
    );
  }

  return (
    <PreJoinForm
      slug={slug}
      roomName={roomName}
      hasPassword={hasPassword}
      waitingRoom={waitingRoom}
      accountName={currentUser?.name ?? null}
      onJoined={setSession}
    />
  );
}
