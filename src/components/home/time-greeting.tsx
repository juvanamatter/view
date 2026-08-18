"use client";

import { useSyncExternalStore } from "react";

function computeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function subscribe() {
  return () => {};
}

function getServerSnapshot() {
  return "Olá";
}

export function TimeGreeting({ name }: { name: string }) {
  const greeting = useSyncExternalStore(subscribe, computeGreeting, getServerSnapshot);

  return (
    <>
      {greeting}, {name}
    </>
  );
}
