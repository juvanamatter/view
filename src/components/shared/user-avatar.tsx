import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function userPhotoProps(user: {
  photoUrl?: string | null;
  photoPositionX?: number | null;
  photoPositionY?: number | null;
  photoZoom?: number | null;
}) {
  return {
    photoUrl: user.photoUrl ?? null,
    positionX: user.photoPositionX ?? 50,
    positionY: user.photoPositionY ?? 50,
    zoom: user.photoZoom ?? 1,
  };
}

export function UserAvatar({
  name,
  photoUrl,
  positionX = 50,
  positionY = 50,
  zoom = 1,
  className,
}: {
  name: string;
  photoUrl?: string | null;
  positionX?: number;
  positionY?: number;
  zoom?: number;
  className?: string;
}) {
  if (photoUrl) {
    return (
      <div className={cn("size-9 shrink-0 overflow-hidden rounded-full", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt={name}
          className="size-full object-cover"
          style={{ objectPosition: `${positionX}% ${positionY}%`, transform: `scale(${zoom})` }}
        />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground",
        className
      )}
    >
      {initials(name) || "?"}
    </div>
  );
}
