import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function UserAvatar({
  name,
  photoUrl,
  className,
}: {
  name: string;
  photoUrl?: string | null;
  className?: string;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        className={cn("size-9 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground",
        className
      )}
    >
      {initials(name) || "?"}
    </div>
  );
}
