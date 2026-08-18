"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@livekit/components-react";
import { Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const QUICK_EMOJIS = ["😀", "😂", "👍", "❤️", "🎉", "👏", "😮", "🙌", "🤔", "🙏"];

export function ChatPanel() {
  const { chatMessages, send, isSending } = useChat();
  const [text, setText] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [chatMessages.length]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const value = text.trim();
    if (!value) return;
    setText("");
    await send(value);
  }

  return (
    <div className="glass-panel flex h-full w-full flex-col rounded-2xl">
      <div className="border-b border-border p-3">
        <p className="text-sm font-medium">Chat da reunião</p>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-3">
        {chatMessages.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
        )}
        {chatMessages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <div className="flex items-baseline gap-1.5">
              <span className="font-medium">{msg.from?.name || msg.from?.identity || "Alguém"}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="break-words text-foreground/90">{msg.message}</p>
          </div>
        ))}
      </div>

      <div className="relative border-t border-border p-3">
        {showEmojis && (
          <div className="glass-panel absolute bottom-full left-3 mb-2 flex flex-wrap gap-1 rounded-xl p-2">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="rounded-md p-1 text-lg hover:bg-white/10"
                onClick={() => {
                  setText((t) => t + emoji);
                  setShowEmojis(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowEmojis((v) => !v)}
          >
            <Smile className="size-4" />
          </Button>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva uma mensagem..."
            className="flex-1"
          />
          <Button type="submit" size="icon-sm" disabled={isSending || !text.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
