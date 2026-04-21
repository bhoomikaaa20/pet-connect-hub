import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, PawPrint, Search as SearchIcon } from "lucide-react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { PetCard } from "@/components/PetCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type Pet = {
  _id: string;
  name: string;
  breed: string;
  description?: string;
  location?: string;
  status: "lost";
  image_url?: string;
  lost_at?: string;
};

export const Route = createFileRoute("/lost-pets")({
  head: () => ({
    meta: [{ title: "Lost Pets — PawFinder" }],
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
      try {
        const res = await axios.get(
          "http://localhost:8080/api/pets/lost"
        );

        setPets(res.data);
      } catch {
        console.error("Failed to load lost pets");
      }

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
        <Badge className="mb-3 bg-red-500 text-white">
          {pets.length} pets need help
        </Badge>

        <h1 className="text-3xl font-bold">Help bring them home</h1>

        <p className="mt-2 text-gray-500">
          These pets are currently lost.
        </p>
      </div>

      {/* SEARCH */}
      <div className="mx-auto mb-8 max-w-md">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, breed, location..."
            className="pl-9"
          />
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse bg-gray-200 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center">
          <PawPrint className="mx-auto h-10 w-10 opacity-40" />
          <p>No lost pets found</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pet) => (
            <PetCard
              key={pet._id}
              pet={pet}
              onClick={() => setSelected(pet)}
            />
          ))}
        </div>
      )}

      {/* DETAILS MODAL */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-3">
              {selected.image_url && (
                <img
                  src={`http://localhost:8080${selected.image_url}`}
                  className="w-full rounded"
                />
              )}

              <Badge className="bg-red-500 text-white">Lost</Badge>

              <p>{selected.breed}</p>

              {selected.location && (
                <p className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {selected.location}
                </p>
              )}

              {selected.description && <p>{selected.description}</p>}

              {selected.lost_at && (
                <p className="text-sm text-gray-500">
                  Lost on {new Date(selected.lost_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}