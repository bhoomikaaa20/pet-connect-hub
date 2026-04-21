import { createFileRoute } from "@tanstack/react-router";
import axios from "axios";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/pet/$id")({
    component: PetDetails,
});

function PetDetails() {
    const { id } = Route.useParams();
    const [pet, setPet] = useState<any>(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/pets/${id}`)
            .then(res => setPet(res.data));
    }, [id]);

    if (!pet) return <p>Loading...</p>;

    return (
        <div className="max-w-xl mx-auto p-6">
            <img
                src={`http://localhost:5000${pet.image_url}`}
                className="w-full h-64 object-cover rounded-xl"
            />
            <h1 className="text-2xl font-bold mt-4">{pet.name}</h1>
            <p>{pet.breed}</p>
            <p>{pet.location}</p>
            <p>Status: {pet.status}</p>
        </div>
    );
}