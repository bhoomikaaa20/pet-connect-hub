import { MapPin, PawPrint } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";

type Pet = Database["public"]["Tables"]["pets"]["Row"];

const statusStyles: Record<string, string> = {
  lost: "bg-lost text-lost-foreground",
  found: "bg-found text-found-foreground",
  safe: "bg-secondary text-secondary-foreground",
};

export function PetCard({ pet, onClick }: { pet: Pet; onClick?: () => void }) {
  return (
    <Card
      onClick={onClick}
      className={`group overflow-hidden border-border/60 bg-card transition-all hover:-translate-y-1 hover:shadow-warm ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {pet.image_url ? (
          <img
            src={pet.image_url}
            alt={pet.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-warm">
            <PawPrint className="h-14 w-14 text-primary/40" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold">{pet.name}</h3>
            <p className="truncate text-sm text-muted-foreground">{pet.breed}</p>
          </div>
          <Badge className={`${statusStyles[pet.status]} capitalize border-0`}>{pet.status}</Badge>
        </div>
        {pet.location && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{pet.location}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
