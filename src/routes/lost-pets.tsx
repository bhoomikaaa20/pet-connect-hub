import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, PawPrint, Search as SearchIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { PetCard } from "@/components/PetCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type Pet = Database["public"]["Tables"]["pets"]["Row"];

export const Route = createFileRoute("/lost-pets")({
  head: () => ({
    meta: [
      { title: "Lost Pets — Help Reunite Them | PawFinder" },
      { name: "description", content: "Browse pets currently reported lost in the community. Your eyes might be the ones to bring them home." },
      { property: "og:title", content: "Lost Pets — Help Reunite Them" },
      { property: "og:description", content: "Browse all currently lost pets in the community." },
    ],
  }),
  component: LostPets,
});

function LostPets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Pet | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("pets")
        .select("*")
        .eq("status", "lost")
        .order("lost_at", { ascending: false });
      setPets(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = pets.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.breed.toLowerCase().includes(q) ||
      (p.location?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 text-center">
        <Badge className="mb-3 bg-lost text-lost-foreground">{pets.length} pets need help</Badge>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Help bring them home</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          These pets are currently lost. If you've seen one, please reach out to the owner.
        </p>
      </div>

      <div className="mx-auto mb-8 max-w-md">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, breed, or location..." className="pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-warm">
            <PawPrint className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-semibold">No lost pets found</h3>
          <p className="mt-1 text-muted-foreground">{pets.length === 0 ? "All pets are home safe right now. 💛" : "Try a different search."}</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pet) => (
            <PetCard key={pet.id} pet={pet} onClick={() => setSelected(pet)} />
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {selected.image_url && (
                <img src={selected.image_url} alt={selected.name} className="aspect-[4/3] w-full rounded-lg object-cover" />
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-lost text-lost-foreground">Lost</Badge>
                <span className="text-sm text-muted-foreground">{selected.breed}</span>
              </div>
              {selected.location && (
                <div className="flex items-center gap-1.5 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{selected.location}</span>
                </div>
              )}
              {selected.description && (
                <p className="text-sm text-muted-foreground">{selected.description}</p>
              )}
              {selected.lost_at && (
                <p className="text-xs text-muted-foreground">Reported lost on {new Date(selected.lost_at).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
