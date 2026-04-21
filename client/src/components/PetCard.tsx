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

export function PetCard({
  pet,
  onClick,
}: {
  pet: Pet;
  onClick?: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition duration-300"
    >
      {/* IMAGE */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        {pet.image_url ? (
          <img
            src={`http://localhost:5000${pet.image_url}`}
            alt={pet.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <PawPrint className="h-10 w-10 opacity-40" />
          </div>
        )}
      </div>

      {/* CONTENT */}
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{pet.name}</h3>
            <p className="text-xs text-gray-500 truncate">{pet.breed}</p>
          </div>

          <Badge className={`${statusStyles[pet.status]} capitalize`}>
            {pet.status}
          </Badge>
        </div>

        {pet.location && (
          <div className="flex items-center text-xs mt-2 text-gray-500">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate">{pet.location}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}