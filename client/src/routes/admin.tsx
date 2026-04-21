import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { PawPrint, ShieldAlert, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import type { Database } from "@/integrations/supabase/types";

type Pet = Database["public"]["Tables"]["pets"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — PawFinder" }] }),
  component: Admin,
});

function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [confirm, setConfirm] = useState<{ type: "pet" | "user"; id: string } | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate({ to: "/" });
  }, [user, isAdmin, authLoading, navigate]);

  const load = useCallback(async () => {
    const [petRes, userRes] = await Promise.all([
      supabase.from("pets").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);
    setPets(petRes.data ?? []);
    setUsers(userRes.data ?? []);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const handleDelete = async () => {
    if (!confirm) return;
    if (confirm.type === "pet") {
      const { error } = await supabase.from("pets").delete().eq("id", confirm.id);
      if (error) toast.error(error.message);
      else toast.success("Pet deleted");
    } else {
      // delete profile cascades via auth (we don't have admin api on client). Best-effort: delete profile row.
      const { error } = await supabase.from("profiles").delete().eq("id", confirm.id);
      if (error) toast.error(error.message);
      else toast.success("User profile removed");
    }
    setConfirm(null);
    load();
  };

  const updateStatus = async (id: string, status: "safe" | "lost" | "found") => {
    const { error } = await supabase.from("pets").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Status updated"); load(); }
  };

  if (authLoading || !isAdmin) return null;

  const lostCount = pets.filter((p) => p.status === "lost").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-sunset text-primary-foreground">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage users and pet listings</p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat icon={Users} label="Total users" value={users.length} />
        <Stat icon={PawPrint} label="Total pets" value={pets.length} />
        <Stat icon={ShieldAlert} label="Lost pets" value={lostCount} highlight />
      </div>

      <Tabs defaultValue="pets">
        <TabsList>
          <TabsTrigger value="pets">Pets ({pets.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pets" className="mt-4 rounded-xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Breed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pets.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.breed}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "lost" ? "destructive" : "secondary"} className="capitalize">{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.location ?? "—"}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {p.status === "lost" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, "found")}>Mark found</Button>
                    )}
                    {p.status !== "lost" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, "lost")}>Mark lost</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setConfirm({ type: "pet", id: p.id })}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {pets.length === 0 && (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No pets yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="users" className="mt-4 rounded-xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setConfirm({ type: "user", id: u.id })}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No users</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Stat({ icon: Icon, label, value, highlight }: { icon: typeof Users; label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border border-border/60 p-5 shadow-soft ${highlight ? "bg-gradient-sunset text-primary-foreground" : "bg-card"}`}>
      <div className="flex items-center justify-between">
        <p className={`text-sm ${highlight ? "text-primary-foreground/90" : "text-muted-foreground"}`}>{label}</p>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}
