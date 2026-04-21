import { MapPin, PawPrint } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Pet = {
  _id: string;
  name: string;
  breed: string;
  status: "safe" | "lost" | "found";
  location?: string;
  image_url?: string;
};

const statusStyles: Record<string, string> = {
  lost: "bg-red-500 text-white",
  found: "bg-green-500 text-white",
  safe: "bg-gray-300 text-black",
};

export function PetCard({ pet, onClick }: { pet: Pet; onClick?: () => void }) {
  return (
    <Card
      onClick={onClick}
      className={`group overflow-hidden hover:shadow-lg ${onClick ? "cursor-pointer" : ""
        }`}
    >
      <div className="aspect-[4/3] bg-muted overflow-hidden">
        {pet.image_url ? (
          <img
            src={`http://localhost:8080${pet.image_url}`}
            alt={pet.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <PawPrint className="h-10 w-10 opacity-40" />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between">
          <div>
            <h3 className="font-bold">{pet.name}</h3>
            <p className="text-sm text-gray-500">{pet.breed}</p>
          </div>

          <Badge className={statusStyles[pet.status]}>
            {pet.status}
          </Badge>
        </div>

        {pet.location && (
          <div className="flex items-center text-xs mt-2 text-gray-500">
            <MapPin className="h-3 w-3 mr-1" />
            {pet.location}
          </div>
        )}
      </CardContent>
    </Card>
  );
}