import { useEffect, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
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

type Pet = {
  _id: string;
  name: string;
  breed: string;
  description?: string;
  location?: string;
  status: "safe" | "lost" | "found";
  image_url?: string;
  lost_at?: string | null;
};

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
      setImagePreview(pet?.image_url ? `http://localhost:8080${pet.image_url}` : null);
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
      const formData = new FormData();

      formData.append("name", parsed.data.name);
      formData.append("breed", parsed.data.breed);
      formData.append("description", parsed.data.description || "");
      formData.append("location", parsed.data.location || "");
      formData.append("status", parsed.data.status);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (pet) {
        await fetch(`http://localhost:8080/api/pets/${pet._id}`, {
          method: "PUT",
          body: formData,
          credentials: "include",
        });
        toast.success("Pet updated");
      } else {
        await fetch(`http://localhost:8080/api/pets`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        toast.success("Pet added");
      }

      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("Failed to save");
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
            Keep your pet's profile updated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Photo</Label>
            <label className="flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed">
              {imagePreview ? (
                <img src={imagePreview} className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImagePlus className="h-8 w-8" />
                  <span>Upload</span>
                </div>
              )}
              <input type="file" className="hidden" onChange={handleFile} />
            </label>
          </div>

          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <Input value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Breed" />
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />

          <Select value={status} onValueChange={(v: any) => setStatus(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="safe">Safe</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="found">Found</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pet ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}