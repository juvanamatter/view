"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useDataChannel } from "@livekit/components-react";

export type Sound = { id: string; name: string; emoji: string | null; audioUrl: string };
type SoundboardEvent =
  | { type: "play"; sound: Sound }
  | { type: "new"; sound: Sound }
  | { type: "delete"; soundId: string };

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const VOLUME_KEY = "reuniao:soundboard-volume";

function loadVolume() {
  if (typeof window === "undefined") return 0.7;
  const saved = Number(window.localStorage.getItem(VOLUME_KEY));
  return Number.isFinite(saved) && saved >= 0 && saved <= 1 ? saved : 0.7;
}

type SoundboardContextValue = {
  sounds: Sound[];
  volume: number;
  setVolume: (v: number) => void;
  play: (sound: Sound) => void;
  registerNewSound: (sound: Sound) => void;
};

const SoundboardContext = createContext<SoundboardContextValue | null>(null);

export function SoundboardProvider({ children }: { children: ReactNode }) {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [volume, setVolume] = useState(loadVolume);
  const volumeRef = useRef(volume);

  useEffect(() => {
    volumeRef.current = volume;
    window.localStorage.setItem(VOLUME_KEY, String(volume));
  }, [volume]);

  useEffect(() => {
    fetch("/api/soundboard")
      .then((r) => r.json())
      .then((data) => setSounds(data.sounds ?? []))
      .catch(() => {});
  }, []);

  function playLocally(audioUrl: string) {
    const audio = new Audio(audioUrl);
    audio.volume = volumeRef.current;
    audio.play().catch(() => {});
  }

  const { send } = useDataChannel("soundboard", (msg) => {
    try {
      const event = JSON.parse(decoder.decode(msg.payload)) as SoundboardEvent;
      if (event.type === "play") {
        playLocally(event.sound.audioUrl);
      } else if (event.type === "new") {
        setSounds((prev) => (prev.some((s) => s.id === event.sound.id) ? prev : [...prev, event.sound]));
      } else if (event.type === "delete") {
        setSounds((prev) => prev.filter((s) => s.id !== event.soundId));
      }
    } catch {
      // mensagem malformada, ignora
    }
  });

  function play(sound: Sound) {
    playLocally(sound.audioUrl);
    send(encoder.encode(JSON.stringify({ type: "play", sound } satisfies SoundboardEvent)), {
      reliable: true,
    });
  }

  function registerNewSound(sound: Sound) {
    setSounds((prev) => [...prev, sound]);
    send(encoder.encode(JSON.stringify({ type: "new", sound } satisfies SoundboardEvent)), {
      reliable: true,
    });
  }

  return (
    <SoundboardContext.Provider value={{ sounds, volume, setVolume, play, registerNewSound }}>
      {children}
    </SoundboardContext.Provider>
  );
}

export function useSoundboard() {
  const ctx = useContext(SoundboardContext);
  if (!ctx) throw new Error("useSoundboard precisa estar dentro de SoundboardProvider");
  return ctx;
}
