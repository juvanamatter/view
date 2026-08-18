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
} from "lucide-react";
import { useTrackToggle, useDisconnectButton } from "@livekit/components-react";
import { cn } from "@/lib/utils";
import { SoundboardPanel } from "./soundboard-panel";
import { BackgroundSelectorPanel } from "./background-selector-panel";

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
  chatOpen,
  onToggleChat,
}: {
  allowScreenShare: boolean;
  currentUserId: string | null;
  chatOpen: boolean;
  onToggleChat: () => void;
}) {
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
  const [activePanel, setActivePanel] = useState<"sounds" | "background" | null>(null);

  function togglePanel(panel: "sounds" | "background") {
    setActivePanel((current) => (current === panel ? null : panel));
  }

  return (
    <div className="relative mx-auto mb-4 w-fit">
      {activePanel === "sounds" && <SoundboardPanel onClose={() => setActivePanel(null)} />}
      {activePanel === "background" && (
        <BackgroundSelectorPanel onClose={() => setActivePanel(null)} />
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
