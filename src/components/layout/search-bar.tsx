"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Video } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";

type RoomResult = { id: string; name: string; slug: string; hostName: string };
type PersonResult = { id: string; name: string; jobTitle: string | null; photoUrl: string | null };

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ rooms: RoomResult[]; people: PersonResult[] } | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        .then((r) => r.json())
        .then((data) => setResults(data))
        .catch(() => {});
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = open && query.trim().length > 0 && results !== null;
  const hasResults = results && (results.rooms.length > 0 || results.people.length > 0);

  function goToRoom(slug: string) {
    setOpen(false);
    setQuery("");
    router.push(`/sala/${slug}`);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Buscar reuniões ou pessoas"
        className="h-9 w-full rounded-lg border border-white/10 bg-black/20 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-white/20"
      />
      {showDropdown && (
        <div className="glass-panel absolute top-full left-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl p-2">
          {!hasResults ? (
            <p className="p-3 text-center text-sm text-muted-foreground">Nada encontrado.</p>
          ) : (
            <div className="max-h-80 space-y-3 overflow-y-auto">
              {results.rooms.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Salas</p>
                  {results.rooms.map((room) => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => goToRoom(room.slug)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-white/5"
                    >
                      <Video className="size-4 shrink-0 text-primary" />
                      <span className="flex flex-col overflow-hidden">
                        <span className="truncate font-medium">{room.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{room.hostName}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {results.people.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Pessoas</p>
                  {results.people.map((person) => (
                    <div key={person.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm">
                      <UserAvatar name={person.name} photoUrl={person.photoUrl} className="size-6" />
                      <span className="flex flex-col overflow-hidden">
                        <span className="truncate font-medium">{person.name}</span>
                        {person.jobTitle && (
                          <span className="truncate text-xs text-muted-foreground">{person.jobTitle}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
