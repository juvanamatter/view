"use client";

import { Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyLinkButton({ slug }: { slug: string }) {
  function copy() {
    const url = `${window.location.origin}/sala/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado.");
  }

  return (
    <Button variant="outline" size="sm" onClick={copy}>
      <LinkIcon className="size-4" />
      Copiar link
    </Button>
  );
}
