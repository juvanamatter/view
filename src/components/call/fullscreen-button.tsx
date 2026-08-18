"use client";

import { useEffect, useState, type RefObject } from "react";
import { Maximize, Minimize } from "lucide-react";

export function FullscreenButton({ targetRef }: { targetRef: RefObject<HTMLElement | null> }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handler() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  function toggle() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      targetRef.current?.requestFullscreen();
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="pointer-events-auto absolute top-2 right-2 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur hover:bg-black/80"
    >
      {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
      {isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
    </button>
  );
}
