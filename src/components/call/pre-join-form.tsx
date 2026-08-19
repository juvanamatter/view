"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  LocalAudioTrack,
  LocalVideoTrack,
} from "livekit-client";
import { BackgroundProcessor, type BackgroundProcessorWrapper } from "@livekit/track-processors";
import { useMediaDevices } from "@livekit/components-react";
import { ArrowLeft, Ban, Droplets, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  loadBackgroundSelection,
  saveBackgroundSelection,
  type BackgroundSelection,
} from "@/lib/background-selection";
import type { CallSession } from "@/lib/call-types";

export type JoinChoices = {
  cameraOn: boolean;
  micOn: boolean;
  cameraDeviceId?: string;
  micDeviceId?: string;
};

type BackgroundImage = { id: string; name: string; imageUrl: string };

function useAudioLevel(track: LocalAudioTrack | null) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!track?.mediaStreamTrack) return;
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(new MediaStream([track.mediaStreamTrack]));
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf: number;

    function tick() {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((sum, v) => sum + v, 0) / data.length;
      setLevel(Math.min(1, avg / 80));
      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      source.disconnect();
      analyser.disconnect();
      audioContext.close().catch(() => {});
    };
  }, [track]);

  return level;
}

function DevicePreview({
  cameraOn,
  micOn,
  setCameraOn,
  setMicOn,
  cameraDeviceId,
  micDeviceId,
  setCameraDeviceId,
  setMicDeviceId,
  background,
  setBackground,
  name,
}: {
  cameraOn: boolean;
  micOn: boolean;
  setCameraOn: (v: boolean) => void;
  setMicOn: (v: boolean) => void;
  cameraDeviceId: string | undefined;
  micDeviceId: string | undefined;
  setCameraDeviceId: (id: string) => void;
  setMicDeviceId: (id: string) => void;
  background: BackgroundSelection;
  setBackground: (b: BackgroundSelection) => void;
  name: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [images, setImages] = useState<BackgroundImage[]>([]);
  const processorRef = useRef<BackgroundProcessorWrapper | null>(null);
  const cameras = useMediaDevices({ kind: "videoinput" });
  const mics = useMediaDevices({ kind: "audioinput" });
  const level = useAudioLevel(micOn ? audioTrack : null);

  useEffect(() => {
    fetch("/api/backgrounds")
      .then((r) => r.json())
      .then((data) => setImages(data.images ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!cameraOn) return;
    let cancelled = false;
    let track: LocalVideoTrack | null = null;

    createLocalVideoTrack({ deviceId: cameraDeviceId })
      .then((t) => {
        if (cancelled) {
          t.stop();
          return;
        }
        track = t;
        setVideoTrack(t);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      track?.stop();
      processorRef.current = null;
    };
  }, [cameraOn, cameraDeviceId]);

  // Attach the preview track to the <video> element whenever either becomes ready —
  // the element is always mounted, so this never races the track's own load promise.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoTrack) return;
    videoTrack.attach(el);
    return () => {
      videoTrack.detach(el);
    };
  }, [videoTrack]);

  useEffect(() => {
    if (!videoTrack) return;
    const track: LocalVideoTrack = videoTrack;

    async function apply() {
      try {
        if (background.mode === "none") {
          if (processorRef.current) await track.stopProcessor();
          return;
        }
        const options =
          background.mode === "blur"
            ? ({ mode: "background-blur", blurRadius: 15 } as const)
            : ({ mode: "virtual-background", imagePath: background.url } as const);
        if (!processorRef.current) {
          processorRef.current = BackgroundProcessor(options);
          await track.setProcessor(processorRef.current);
        } else {
          await processorRef.current.switchTo(options);
        }
      } catch (err) {
        console.error(err);
        toast.error("Não foi possível aplicar o fundo neste navegador.");
      }
    }
    apply();
  }, [videoTrack, background]);

  useEffect(() => {
    if (!micOn) return;
    let cancelled = false;
    let track: LocalAudioTrack | null = null;

    createLocalAudioTrack({ deviceId: micDeviceId })
      .then((t) => {
        if (cancelled) {
          t.stop();
          return;
        }
        track = t;
        setAudioTrack(t);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      track?.stop();
    };
  }, [micOn, micDeviceId]);

  function chooseBackground(next: BackgroundSelection) {
    setBackground(next);
    saveBackgroundSelection(next);
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <video
          ref={videoRef}
          muted
          autoPlay
          playsInline
          className={cn("size-full object-cover", !(cameraOn && videoTrack) && "hidden")}
        />
        {!(cameraOn && videoTrack) && (
          <div className="flex size-full items-center justify-center">
            <p className="text-sm text-white/70">Câmera desligada</p>
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white">
          {name || "Você"}
        </span>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-3">
          <button
            type="button"
            onClick={() => setMicOn(!micOn)}
            className={cn(
              "relative flex size-11 items-center justify-center rounded-full shadow-lg transition-colors",
              micOn ? "bg-white/15 text-white hover:bg-white/25" : "bg-red-500 text-white hover:bg-red-600"
            )}
          >
            {micOn && (
              <span
                className="absolute inset-0 rounded-full bg-emerald-400/40"
                style={{ transform: `scale(${1 + level * 0.5})`, transition: "transform 80ms linear" }}
              />
            )}
            {micOn ? <Mic className="relative size-5" /> : <MicOff className="relative size-5" />}
          </button>
          <button
            type="button"
            onClick={() => setCameraOn(!cameraOn)}
            className={cn(
              "flex size-11 items-center justify-center rounded-full shadow-lg transition-colors",
              cameraOn ? "bg-white/15 text-white hover:bg-white/25" : "bg-red-500 text-white hover:bg-red-600"
            )}
          >
            {cameraOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          value={micDeviceId ?? ""}
          onChange={(e) => setMicDeviceId(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-2 text-xs"
        >
          {mics.length === 0 && <option value="">Microfone padrão</option>}
          {mics.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || "Microfone"}
            </option>
          ))}
        </select>
        <select
          value={cameraDeviceId ?? ""}
          onChange={(e) => setCameraDeviceId(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-2 text-xs"
        >
          {cameras.length === 0 && <option value="">Câmera padrão</option>}
          {cameras.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || "Câmera"}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Fundo virtual</Label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => chooseBackground({ mode: "none" })}
            className={cn(
              "flex size-12 flex-col items-center justify-center gap-0.5 rounded-lg bg-white/5 text-[10px] hover:bg-white/10",
              background.mode === "none" && "ring-2 ring-primary"
            )}
          >
            <Ban className="size-4" />
            Nenhum
          </button>
          <button
            type="button"
            onClick={() => chooseBackground({ mode: "blur" })}
            className={cn(
              "flex size-12 flex-col items-center justify-center gap-0.5 rounded-lg bg-white/5 text-[10px] hover:bg-white/10",
              background.mode === "blur" && "ring-2 ring-primary"
            )}
          >
            <Droplets className="size-4" />
            Desfoque
          </button>
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => chooseBackground({ mode: "image", url: image.imageUrl })}
              className={cn(
                "size-12 shrink-0 rounded-lg bg-cover bg-center",
                background.mode === "image" && background.url === image.imageUrl && "ring-2 ring-primary"
              )}
              style={{ backgroundImage: `url(${image.imageUrl})` }}
              title={image.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PreJoinForm({
  slug,
  roomName,
  hasPassword,
  waitingRoom,
  accountName,
  defaultCameraOn,
  defaultMicOn,
  onJoined,
}: {
  slug: string;
  roomName: string;
  hasPassword: boolean;
  waitingRoom: boolean;
  accountName: string | null;
  defaultCameraOn: boolean;
  defaultMicOn: boolean;
  onJoined: (session: CallSession, choices: JoinChoices) => void;
}) {
  const [name, setName] = useState(accountName ?? "");
  const [password, setPassword] = useState("");
  const [cameraOn, setCameraOn] = useState(defaultCameraOn);
  const [micOn, setMicOn] = useState(defaultMicOn);
  const [cameraDeviceId, setCameraDeviceId] = useState<string>();
  const [micDeviceId, setMicDeviceId] = useState<string>();
  const [background, setBackground] = useState<BackgroundSelection>(() => loadBackgroundSelection());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, participantName: name, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível entrar na sala.");
        return;
      }
      onJoined(data as CallSession, { cameraOn, micOn, cameraDeviceId, micDeviceId });
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-8">
      <Button variant="ghost" size="sm" className="mb-4 w-fit" render={<Link href="/" />}>
        <ArrowLeft className="size-4" />
        Voltar
      </Button>

      <div className="flex flex-1 items-center justify-center">
        <div className="grid w-full max-w-5xl gap-6 sm:grid-cols-[1fr_320px]">
          <DevicePreview
            cameraOn={cameraOn}
            micOn={micOn}
            setCameraOn={setCameraOn}
            setMicOn={setMicOn}
            cameraDeviceId={cameraDeviceId}
            micDeviceId={micDeviceId}
            setCameraDeviceId={setCameraDeviceId}
            setMicDeviceId={setMicDeviceId}
            background={background}
            setBackground={setBackground}
            name={name}
          />

          <form onSubmit={handleSubmit} className="glass-card flex flex-col gap-4 p-5">
            <div>
              <h1 className="font-semibold">{roomName}</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {waitingRoom
                  ? "O anfitrião vai aprovar sua entrada."
                  : "Confira sua câmera e microfone antes de entrar."}
              </p>
            </div>

            {!accountName && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Seu nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como você quer aparecer"
                  required
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Já tem uma conta?{" "}
                  <Link
                    href={`/entrar?from=${encodeURIComponent(`/sala/${slug}`)}`}
                    className="underline hover:text-foreground"
                  >
                    Entrar
                  </Link>{" "}
                  pra aparecer com seu nome e foto.
                </p>
              </div>
            )}
            {hasPassword && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha da sala</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus={Boolean(accountName)}
                />
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="mt-auto bg-gradient-to-br from-violet-600 to-purple-800"
            >
              {loading ? "Entrando..." : "Participar agora"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
