"use client";

import { Button } from "@/components/ui/button";
import { useWhiteboard } from "./whiteboard-context";

export function WhiteboardRequestPanel() {
  const { isPresenter, pendingRequests, approveRequest, denyRequest } = useWhiteboard();

  if (!isPresenter || pendingRequests.length === 0) return null;

  return (
    <div className="glass-panel fixed top-4 right-4 z-50 w-72 rounded-2xl p-4">
      <p className="mb-2 text-sm font-medium">Pedidos para desenhar na lousa</p>
      <ul className="space-y-2">
        {pendingRequests.map((req) => (
          <li key={req.identity} className="flex items-center justify-between gap-2">
            <span className="truncate text-sm">{req.name}</span>
            <div className="flex shrink-0 gap-1.5">
              <Button size="sm" onClick={() => approveRequest(req.identity)}>
                Permitir
              </Button>
              <Button size="sm" variant="outline" onClick={() => denyRequest(req.identity)}>
                Negar
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
