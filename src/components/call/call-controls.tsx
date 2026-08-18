"use client";

import { useState } from "react";
import { Track } from "livekit-client";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  Volume2,
  Image as ImageIcon,
  MessageCircle,
  FileText,
  PenLine,
  Users,
  Wind,
} from "lucide-react";
import {
  useTrackToggle,
  useDisconnectButton,
  useTracks,
  useParticipants,
} from "@livekit/components-react";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";
import { isKrispNoiseFilterSupported } from "@livekit/krisp-noise-filter";
import { cn } from "@/lib/utils";
import { SoundboardPanel } from "./soundboard-panel";
import { BackgroundSelectorPanel } from "./background-selector-panel";
import { TranscriptionPanel } from "./transcription-panel";
import { ParticipantsPanel } from "./participants-panel";

function ControlButton({
  active,
  icon,
  label,
  activeGradient,
  className,
  ...buttonProps
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  activeGradient: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...buttonProps}
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-2xl px-5 py-3 text-xs font-medium text-white shadow-lg transition-transform active:scale-95",
        active ? activeGradient : "bg-white/10 hover:bg-white/15",
        className
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export function CallControls({
  allowScreenShare,
  currentUserId,
  roomName,
  chatOpen,
  onToggleChat,
  whiteboardActive,
  onToggleWhiteboard,
}: {
  allowScreenShare: boolean;
  currentUserId: string | null;
  roomName: string;
  chatOpen: boolean;
  onToggleChat: () => void;
  whiteboardActive: boolean;
  onToggleWhiteboard: () => void;
}) {
  const screenShareTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }], {
    onlySubscribed: false,
  });
  const mic = useTrackToggle({ source: Track.Source.Microphone });
  const cam = useTrackToggle({ source: Track.Source.Camera });
  const screen = useTrackToggle({
    source: Track.Source.ScreenShare,
    onChange: (enabled, isUserInitiated) => {
      if (enabled && isUserInitiated && currentUserId) {
        fetch("/api/stats/screen-share", { method: "POST" }).catch(() => {});
      }
    },
  });
  const { buttonProps: disconnectProps } = useDisconnectButton({});
  const participants = useParticipants();
  const [noiseFilterSupported] = useState(() => isKrispNoiseFilterSupported());
  const { setNoiseFilterEnabled, isNoiseFilterEnabled, isNoiseFilterPending } =
    useKrispNoiseFilter();
  const [activePanel, setActivePanel] = useState<
    "sounds" | "background" | "transcript" | "participants" | null
  >(null);

  function togglePanel(panel: "sounds" | "background" | "transcript" | "participants") {
    setActivePanel((current) => (current === panel ? null : panel));
  }

  return (
    <div className="relative mx-auto mb-4 w-fit">
      {activePanel === "sounds" && <SoundboardPanel onClose={() => setActivePanel(null)} />}
      {activePanel === "background" && (
        <BackgroundSelectorPanel onClose={() => setActivePanel(null)} />
      )}
      {activePanel === "transcript" && (
        <TranscriptionPanel roomName={roomName} onClose={() => setActivePanel(null)} />
      )}
      {activePanel === "participants" && (
        <ParticipantsPanel onClose={() => setActivePanel(null)} />
      )}

      <div className="glass-panel flex items-center gap-2 rounded-3xl p-2">
        <ControlButton
          {...mic.buttonProps}
          active={mic.enabled}
          icon={mic.enabled ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          label={mic.enabled ? "Microfone" : "Mudo"}
          activeGradient="bg-gradient-to-br from-fuchsia-500 to-purple-600"
        />
        <ControlButton
          {...cam.buttonProps}
          active={cam.enabled}
          icon={cam.enabled ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          label={cam.enabled ? "Câmera" : "Câmera off"}
          activeGradient="bg-gradient-to-br from-blue-500 to-cyan-500"
        />
        {allowScreenShare && (
          <ControlButton
            {...screen.buttonProps}
            active={screen.enabled}
            icon={<ScreenShare className="size-5" />}
            label={screen.enabled ? "Parar tela" : "Tela"}
            activeGradient="bg-gradient-to-br from-emerald-500 to-teal-500"
          />
        )}
        {noiseFilterSupported && (
          <ControlButton
            active={isNoiseFilterEnabled}
            disabled={isNoiseFilterPending}
            icon={<Wind className="size-5" />}
            label={isNoiseFilterEnabled ? "Anti-ruído on" : "Anti-ruído"}
            activeGradient="bg-gradient-to-br from-teal-500 to-cyan-600"
            onClick={() => setNoiseFilterEnabled(!isNoiseFilterEnabled)}
          />
        )}
        <ControlButton
          active={activePanel === "participants"}
          icon={<Users className="size-5" />}
          label={`Pessoas (${participants.length})`}
          activeGradient="bg-gradient-to-br from-cyan-500 to-teal-600"
          onClick={() => togglePanel("participants")}
        />
        <ControlButton
          active={activePanel === "background"}
          icon={<ImageIcon className="size-5" />}
          label="Fundo"
          activeGradient="bg-gradient-to-br from-amber-500 to-orange-600"
          onClick={() => togglePanel("background")}
        />
        <ControlButton
          active={activePanel === "sounds"}
          icon={<Volume2 className="size-5" />}
          label="Sons"
          activeGradient="bg-gradient-to-br from-indigo-500 to-violet-600"
          onClick={() => togglePanel("sounds")}
        />
        <ControlButton
          active={chatOpen}
          icon={<MessageCircle className="size-5" />}
          label="Chat"
          activeGradient="bg-gradient-to-br from-sky-500 to-blue-600"
          onClick={onToggleChat}
        />
        <ControlButton
          active={activePanel === "transcript"}
          icon={<FileText className="size-5" />}
          label="Transcrição"
          activeGradient="bg-gradient-to-br from-rose-500 to-pink-600"
          onClick={() => togglePanel("transcript")}
        />
        {screenShareTracks.length > 0 && (
          <ControlButton
            active={whiteboardActive}
            icon={<PenLine className="size-5" />}
            label="Lousa"
            activeGradient="bg-gradient-to-br from-lime-500 to-green-600"
            onClick={onToggleWhiteboard}
          />
        )}
        <button
          type="button"
          {...disconnectProps}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 px-5 py-3 text-xs font-medium text-white shadow-lg transition-transform active:scale-95"
        >
          <PhoneOff className="size-5" />
          Sair
        </button>
      </div>
    </div>
  );
}
