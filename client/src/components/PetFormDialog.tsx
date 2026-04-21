import { useEffect, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  phone?: string;
};

const schema = z.object({
  name: z.string().min(1),
  breed: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(["safe", "lost", "found"]),
  phone: z.string().min(10),
});

export function PetFormDialog({ open, onOpenChange, pet, onSaved }: any) {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<"safe" | "lost" | "found">("safe");
  const [phone, setPhone] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(pet?.name || "");
      setBreed(pet?.breed || "");
      setDescription(pet?.description || "");
      setLocation(pet?.location || "");
      setStatus(pet?.status || "safe");
      setPhone(pet?.phone || "");

      setImagePreview(
        pet?.image_url
          ? `http://localhost:5000${pet.image_url}`
          : null
      );

      setImageFile(null);
    }
  }, [open, pet]);

  // ✅ FILE HANDLER
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

  // ✅ SUBMIT (FIXED)
  const submit = async () => {
    if (!user) return;

    const parsed = schema.safeParse({
      name,
      breed,
      description,
      location,
      status,
      phone,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("breed", breed);
      formData.append("description", description || "");
      formData.append("location", location || "");
      formData.append("status", status);
      formData.append("phone", phone);

      // 🔥 IMPORTANT
      if (imageFile) {
        formData.append("image", imageFile); // MUST MATCH multer field
      }

      const url = pet
        ? `http://localhost:5000/api/pets/${pet._id}`
        : `http://localhost:5000/api/pets`;

      const method = pet ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      toast.success(pet ? "Updated" : "Added");

      onSaved();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }

    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col border-0 shadow-2xl rounded-2xl">

        <DialogHeader>
          <DialogTitle>{pet ? "Edit Pet" : "Add Pet"}</DialogTitle>
          <DialogDescription>
            Enter pet details
          </DialogDescription>
        </DialogHeader>

        {/* 🔥 SCROLL AREA */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">

          {/* IMAGE */}
          <label className="flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed">
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" />
            ) : (
              <ImagePlus className="h-8 w-8" />
            )}
            <input type="file" hidden onChange={handleFile} />
          </label>

          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <Input value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Breed" />
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />

          {/* PHONE */}
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
          />

          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />

          <Select value={status} onValueChange={(v: any) => setStatus(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
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
            Save
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}