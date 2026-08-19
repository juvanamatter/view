import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatLastSeen(date: Date | string | null) {
  if (!date) return "Nunca acessou";
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Agora mesmo";
  if (diffMin < 60) return `Visto há ${diffMin}min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Visto há ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Visto há ${diffDays}d`;
}

const SCHEDULE_TZ = "America/Sao_Paulo";

export function formatScheduled(date: Date | string) {
  const target = new Date(date);
  const now = new Date();
  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: SCHEDULE_TZ,
  }).format(target);

  // Compares calendar dates in Brazil's timezone specifically — this runs
  // server-side too, where the runtime's own local timezone is UTC, so
  // relying on Date's local getters here would misjudge "hoje"/"amanhã" by
  // hours depending on the time of day.
  const dayKey = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: SCHEDULE_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);

  const tomorrow = new Date(now.getTime() + 86_400_000);

  if (dayKey(target) === dayKey(now)) return `Hoje às ${time}`;
  if (dayKey(target) === dayKey(tomorrow)) return `Amanhã às ${time}`;
  const day = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: SCHEDULE_TZ,
  }).format(target);
  return `${day} às ${time}`;
}

export function formatDuration(totalSeconds: number) {
  if (totalSeconds < 60) return "menos de 1min";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}
