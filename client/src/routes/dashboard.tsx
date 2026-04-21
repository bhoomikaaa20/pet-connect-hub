import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Edit, MoreVertical, PawPrint, Plus, Search as SearchIcon, Trash2 } from "lucide-react";
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
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

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [user]);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        "http://localhost:8080/api/pets/my",
        { withCredentials: true }
      );

      setPets(res.data);
    } catch {
      toast.error("Failed to load pets");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user]);

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8080/api/pets/${deleteId}`,
        { withCredentials: true }
      );

      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }

    setDeleteId(null);
  };

  const updateStatus = async (id: string, status: string) => {
    await axios.put(
      `http://localhost:8080/api/pets/${id}/status`,
      { status },
      { withCredentials: true }
    );

    load();
  };

  const filtered = pets.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">My Pets</h1>

      <Button onClick={() => setFormOpen(true)}>
        <Plus /> Add
      </Button>

      <Input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Select onValueChange={setStatusFilter}>
        <SelectTrigger>Status</SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="lost">Lost</SelectItem>
          <SelectItem value="safe">Safe</SelectItem>
        </SelectContent>
      </Select>

      {filtered.map((pet) => (
        <div key={pet._id}>
          <PetCard pet={pet} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button><MoreVertical /></Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setEditPet(pet)}>
                <Edit /> Edit
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => updateStatus(pet._id, "lost")}>
                Mark Lost
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => updateStatus(pet._id, "found")}>
                Mark Found
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setDeleteId(pet._id)}>
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}

      <PetFormDialog open={formOpen} onOpenChange={setFormOpen} pet={editPet} onSaved={load} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <Button onClick={handleDelete}>Confirm Delete</Button>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}