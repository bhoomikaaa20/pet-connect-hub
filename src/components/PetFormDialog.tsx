import { useEffect, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type Pet = Database["public"]["Tables"]["pets"]["Row"];

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(60),
  breed: z.string().trim().min(1, "Breed required").max(60),
  description: z.string().trim().max(500).optional(),
  location: z.string().trim().max(120).optional(),
  status: z.enum(["safe", "lost", "found"]),
});

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  pet?: Pet | null;
  onSaved: () => void;
}

export function PetFormDialog({ open, onOpenChange, pet, onSaved }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<"safe" | "lost" | "found">("safe");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(pet?.name ?? "");
      setBreed(pet?.breed ?? "");
      setDescription(pet?.description ?? "");
      setLocation(pet?.location ?? "");
      setStatus(pet?.status ?? "safe");
      setImagePreview(pet?.image_url ?? null);
      setImageFile(null);
    }
  }, [open, pet]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!user) return;
    const parsed = schema.safeParse({ name, breed, description, location, status });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    try {
      let image_url = pet?.image_url ?? null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("pet-images").upload(path, imageFile);
        if (upErr) throw upErr;
        image_url = supabase.storage.from("pet-images").getPublicUrl(path).data.publicUrl;
      }

      const payload = {
        name: parsed.data.name,
        breed: parsed.data.breed,
        description: parsed.data.description || null,
        location: parsed.data.location || null,
        status: parsed.data.status,
        image_url,
        lost_at: parsed.data.status === "lost" ? new Date().toISOString() : pet?.lost_at ?? null,
      };

      if (pet) {
        const { error } = await supabase.from("pets").update(payload).eq("id", pet.id);
        if (error) throw error;
        toast.success("Pet updated");
      } else {
        const { error } = await supabase.from("pets").insert({ ...payload, user_id: user.id });
        if (error) throw error;
        toast.success("Pet added");
      }
      onSaved();
      onOpenChange(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{pet ? "Edit pet" : "Add a pet"}</DialogTitle>
          <DialogDescription>
            Keep your pet's profile up to date so others can help if they're ever lost.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="image" className="mb-2 block">Photo</Label>
            <label
              htmlFor="image"
              className="flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/40 hover:border-primary/60"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImagePlus className="h-8 w-8" />
                  <span className="text-sm">Click to upload</span>
                </div>
              )}
              <input id="image" type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Buddy" />
            </div>
            <div>
              <Label htmlFor="breed">Breed</Label>
              <Input id="breed" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Golden Retriever" />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Last known location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Central Park, NYC" />
          </div>

          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Friendly, has a red collar..." />
          </div>

          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v: "safe" | "lost" | "found") => setStatus(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="safe">Safe at home</SelectItem>
                <SelectItem value="lost">Lost — needs help</SelectItem>
                <SelectItem value="found">Found — back home</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving} className="bg-gradient-sunset">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pet ? "Save changes" : "Add pet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
