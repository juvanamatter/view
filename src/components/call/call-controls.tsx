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
  Wind,
  Hand,
  ChevronUp,
} from "lucide-react";
import { useTrackToggle, useDisconnectButton } from "@livekit/components-react";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";
import { isKrispNoiseFilterSupported } from "@livekit/krisp-noise-filter";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SoundboardPanel } from "./soundboard-panel";
import { BackgroundSelectorPanel } from "./background-selector-panel";
import { TranscriptionPanel } from "./transcription-panel";
import { useWhiteboard } from "./whiteboard-context";
import { useHandRaise } from "./hand-raise-context";

function IconButton({
  active,
  danger,
  className,
  ...buttonProps
}: {
  active?: boolean;
  danger?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...buttonProps}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full transition-colors active:scale-95",
        danger
          ? "bg-red-500 text-white hover:bg-red-600"
          : active
            ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white"
            : "bg-white/10 text-white hover:bg-white/15",
        className
      )}
    />
  );
}

export function CallControls({
  allowScreenShare,
  currentUserId,
  roomName,
  chatOpen,
  onToggleChat,
}: {
  allowScreenShare: boolean;
  currentUserId: string | null;
  roomName: string;
  chatOpen: boolean;
  onToggleChat: () => void;
}) {
  const whiteboard = useWhiteboard();
  const { localRaised, toggle: toggleHand } = useHandRaise();
  const mic = useTrackToggle({ source: Track.Source.Microphone });
  const cam = useTrackToggle({ source: Track.Source.Camera });
  const screen = useTrackToggle({
    source: Track.Source.ScreenShare,
    captureOptions: { audio: true, contentHint: "detail" },
    onChange: (enabled, isUserInitiated) => {
      if (enabled && isUserInitiated && currentUserId) {
        fetch("/api/stats/screen-share", { method: "POST" }).catch(() => {});
      }
    },
  });
  const { buttonProps: disconnectProps } = useDisconnectButton({});
  const [noiseFilterSupported] = useState(() => isKrispNoiseFilterSupported());
  const { setNoiseFilterEnabled, isNoiseFilterEnabled, isNoiseFilterPending } =
    useKrispNoiseFilter();
  const [activePanel, setActivePanel] = useState<"sounds" | "background" | "transcript" | null>(null);

  function togglePanel(panel: "sounds" | "background" | "transcript") {
    setActivePanel((current) => (current === panel ? null : panel));
  }

  return (
    <>
      <div className="relative z-30 mx-auto mb-4 w-fit">
        {activePanel === "sounds" && <SoundboardPanel onClose={() => setActivePanel(null)} />}
        {activePanel === "background" && (
          <BackgroundSelectorPanel onClose={() => setActivePanel(null)} />
        )}
        {activePanel === "transcript" && (
          <TranscriptionPanel roomName={roomName} onClose={() => setActivePanel(null)} />
        )}

        <div className="glass-panel flex items-center gap-2 rounded-full p-2">
          <IconButton {...mic.buttonProps} danger={!mic.enabled}>
            {mic.enabled ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          </IconButton>
          <IconButton {...cam.buttonProps} danger={!cam.enabled}>
            {cam.enabled ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </IconButton>
          {allowScreenShare && (
            <IconButton {...screen.buttonProps} active={screen.enabled}>
              <ScreenShare className="size-5" />
            </IconButton>
          )}
          <IconButton active={activePanel === "sounds"} onClick={() => togglePanel("sounds")}>
            <Volume2 className="size-5" />
          </IconButton>
          <IconButton active={localRaised} onClick={toggleHand}>
            <Hand className="size-5" />
          </IconButton>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-full transition-colors",
                isNoiseFilterEnabled || activePanel === "background" || activePanel === "transcript"
                  ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white"
                  : "bg-white/10 text-white hover:bg-white/15"
              )}
            >
              <ChevronUp className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" sideOffset={12} className="w-56">
              {noiseFilterSupported && (
                <DropdownMenuCheckboxItem
                  checked={isNoiseFilterEnabled}
                  onCheckedChange={(checked) => setNoiseFilterEnabled(checked === true)}
                  disabled={isNoiseFilterPending}
                >
                  <Wind className="size-4" />
                  Anti-ruído
                </DropdownMenuCheckboxItem>
              )}
              <DropdownMenuItem onClick={() => togglePanel("background")}>
                <ImageIcon className="size-4" />
                Fundo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => togglePanel("transcript")}>
                <FileText className="size-4" />
                Transcrição
              </DropdownMenuItem>
              {whiteboard.hasScreenShare && (
                <DropdownMenuItem disabled={whiteboard.requestPending} onClick={whiteboard.toggleActive}>
                  <PenLine className="size-4" />
                  {whiteboard.requestPending
                    ? "Aguardando permissão..."
                    : whiteboard.isPresenter || whiteboard.hasPermission
                      ? "Lousa"
                      : "Pedir lousa"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <IconButton {...disconnectProps} danger>
            <PhoneOff className="size-5" />
          </IconButton>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleChat}
        className={cn(
          "fixed right-6 bottom-6 z-30 flex size-12 items-center justify-center rounded-full shadow-lg transition-colors",
          chatOpen
            ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white"
            : "bg-white/10 text-white hover:bg-white/15"
        )}
      >
        <MessageCircle className="size-5" />
      </button>
    </>
  );
}
