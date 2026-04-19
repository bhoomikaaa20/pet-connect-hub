import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Edit, MoreVertical, PawPrint, Plus, Search as SearchIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type Pet = Database["public"]["Tables"]["pets"]["Row"];

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "My Pets — PawFinder" }] }),
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
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [user, authLoading, navigate]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setPets(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("pets").delete().eq("id", deleteId);
    if (error) toast.error(error.message);
    else {
      toast.success("Pet removed");
      load();
    }
    setDeleteId(null);
  };

  const filtered = pets.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search && !`${p.name} ${p.breed}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">My pets</h1>
          <p className="mt-1 text-muted-foreground">Manage profiles and report status changes.</p>
        </div>
        <Button onClick={() => { setEditPet(null); setFormOpen(true); }} className="bg-gradient-sunset shadow-soft">
          <Plus className="mr-1 h-4 w-4" /> Add pet
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or breed..." className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="safe">Safe</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="found">Found</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-warm">
            <PawPrint className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-semibold">{pets.length === 0 ? "No pets yet" : "No matches"}</h3>
          <p className="mt-1 text-muted-foreground">{pets.length === 0 ? "Add your first pet to get started." : "Try adjusting filters."}</p>
          {pets.length === 0 && (
            <Button className="mt-6 bg-gradient-sunset" onClick={() => { setEditPet(null); setFormOpen(true); }}>
              <Plus className="mr-1 h-4 w-4" /> Add your first pet
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pet) => (
            <div key={pet.id} className="relative">
              <PetCard pet={pet} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="secondary" className="absolute right-2 top-2 h-8 w-8 rounded-full bg-card/90 shadow-soft backdrop-blur">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setEditPet(pet); setFormOpen(true); }}>
                    <Edit className="mr-2 h-4 w-4" />Edit
                  </DropdownMenuItem>
                  {pet.status !== "lost" && (
                    <DropdownMenuItem onClick={async () => {
                      const { error } = await supabase.from("pets").update({ status: "lost", lost_at: new Date().toISOString() }).eq("id", pet.id);
                      if (error) toast.error(error.message);
                      else { toast.success("Marked as lost"); load(); }
                    }}>
                      Mark as lost
                    </DropdownMenuItem>
                  )}
                  {pet.status === "lost" && (
                    <DropdownMenuItem onClick={async () => {
                      const { error } = await supabase.from("pets").update({ status: "found" }).eq("id", pet.id);
                      if (error) toast.error(error.message);
                      else { toast.success("Marked as found!"); load(); }
                    }}>
                      Mark as found
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setDeleteId(pet.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <PetFormDialog open={formOpen} onOpenChange={setFormOpen} pet={editPet} onSaved={load} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this pet?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="mt-12 text-center text-sm text-muted-foreground">
        Looking for a community pet? <Link to="/lost-pets" className="text-primary hover:underline">Browse lost pets</Link>
      </p>
    </div>
  );
}
