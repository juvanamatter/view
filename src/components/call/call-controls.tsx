"use client";

import { Track } from "livekit-client";
import { Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff } from "lucide-react";
import { useTrackToggle, useDisconnectButton } from "@livekit/components-react";
import { cn } from "@/lib/utils";

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

export function CallControls({ allowScreenShare }: { allowScreenShare: boolean }) {
  const mic = useTrackToggle({ source: Track.Source.Microphone });
  const cam = useTrackToggle({ source: Track.Source.Camera });
  const screen = useTrackToggle({ source: Track.Source.ScreenShare });
  const { buttonProps: disconnectProps } = useDisconnectButton({});

  return (
    <div className="glass-panel mx-auto mb-4 flex w-fit items-center gap-2 rounded-3xl p-2">
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
      <button
        type="button"
        {...disconnectProps}
        className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 px-5 py-3 text-xs font-medium text-white shadow-lg transition-transform active:scale-95"
      >
        <PhoneOff className="size-5" />
        Sair
      </button>
    </div>
  );
}
