import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Edit, MoreVertical, Plus, Trash2, PawPrint } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PetCard } from "@/components/PetCard";
import { PetFormDialog } from "@/components/PetFormDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

type Pet = {
  _id: string;
  name: string;
  breed: string;
  status: "safe" | "lost" | "found";
  location?: string;
  image_url?: string;
  description?: string;
  phone?: string;
};

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editPet, setEditPet] = useState<Pet | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // 🔐 redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user]);

  // 🔄 load pets
  const load = useCallback(async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        "http://localhost:5000/api/pets/my",
        {
          withCredentials: true,
          headers: { "Cache-Control": "no-cache" },
        }
      );

      // 🔥 IMPORTANT FIX
      setPets(res.data.pets || res.data);
    } catch {
      toast.error("Failed to load pets");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user]);

  // 🗑 delete
  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/pets/${deleteId}`,
        { withCredentials: true }
      );

      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }

    setDeleteId(null);
  };

  // 🔁 status update
  const updateStatus = async (id: string, status: string) => {
    await axios.put(
      `http://localhost:5000/api/pets/${id}/status`,
      { status },
      { withCredentials: true }
    );
    load();
  };

  // 🔍 filter
  const filtered = pets.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;

    if (
      search &&
      !p.name?.toLowerCase().includes(search.toLowerCase())
    ) return false;

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Pets</h1>

        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Add Pet
        </Button>
      </div>

      {/* FILTERS */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          placeholder="Search pets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select onValueChange={setStatusFilter}>
          <SelectTrigger>Status</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="safe">Safe</SelectItem>
            <SelectItem value="found">Found</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center space-y-2">
          <PawPrint className="mx-auto h-10 w-10 opacity-40" />
          <p className="text-gray-500">No pets found</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pet) => (
            <div key={pet._id} className="relative">

              <PetCard pet={pet} />

              {/* ACTION MENU */}
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="secondary">
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditPet(pet);
                        setFormOpen(true);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => updateStatus(pet._id, "lost")}
                    >
                      Mark Lost
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => updateStatus(pet._id, "found")}
                    >
                      Mark Found
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => setDeleteId(pet._id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* FORM */}
      <PetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        pet={editPet}
        onSaved={load}
      />

      {/* DELETE CONFIRM */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <div className="space-y-4">
            <p>Are you sure you want to delete this pet?</p>

            <div className="flex justify-end gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}