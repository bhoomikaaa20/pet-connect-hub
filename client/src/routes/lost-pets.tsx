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
  phone?: string; // ✅ added
};

export const Route = createFileRoute("/lost-pets")({
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
          "http://localhost:5000/api/pets/lost"
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
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.breed.toLowerCase().includes(q) ||
      (p.location?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">

      {/* HEADER */}
      <div className="text-center space-y-2">
        <Badge className="bg-red-500 text-white">
          {pets.length} pets need help
        </Badge>

        <h1 className="text-3xl font-bold">Help bring them home</h1>

        <p className="text-gray-500">
          These pets are currently lost.
        </p>
      </div>

      {/* SEARCH */}
      <div className="mx-auto max-w-md">
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

      {/* GRID */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse bg-gray-200 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center">
          <PawPrint className="mx-auto h-10 w-10 opacity-40" />
          <p>No lost pets found</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pet) => (
            <PetCard
              key={pet._id}
              pet={pet}
              onClick={() => setSelected(pet)} // ✅ modal trigger
            />
          ))}
        </div>
      )}

      {/* MODAL */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">

          {selected && (
            <div className="space-y-4">

              {/* IMAGE */}
              <div className="w-full h-64 overflow-hidden rounded-lg">
                {selected.image_url ? (
                  <img
                    src={`http://localhost:5000${selected.image_url}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100">
                    <PawPrint className="h-10 w-10 opacity-40" />
                  </div>
                )}
              </div>

              {/* TITLE */}
              <div className="flex justify-between items-center">
                <DialogTitle>{selected.name}</DialogTitle>
                <Badge className="bg-red-500 text-white">Lost</Badge>
              </div>

              {/* DETAILS */}
              <p className="text-sm text-gray-500">{selected.breed}</p>

              {selected.location && (
                <p className="flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4" />
                  {selected.location}
                </p>
              )}

              {selected.description && (
                <p className="text-sm">{selected.description}</p>
              )}

              {selected.lost_at && (
                <p className="text-xs text-gray-500">
                  Lost on{" "}
                  {new Date(selected.lost_at).toLocaleDateString()}
                </p>
              )}

              {/* ✅ PHONE + CALL BUTTON */}
              {selected.phone && (
                <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                  <span className="text-sm font-medium">
                    {selected.phone}
                  </span>


                </div>
              )}

            </div>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
}