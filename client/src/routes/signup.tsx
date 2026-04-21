import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, PawPrint } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — PawFinder" }] }),
  component: SignUp,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(100),
});

function SignUp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = schema.safeParse({ name, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        "http://localhost:8080/api/auth/signup",
        parsed.data,
        { withCredentials: true }
      );

      toast.success("Account created!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Signup failed");
    }

    setLoading(false);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-sunset text-primary-foreground shadow-warm">
          <PawPrint className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-bold">Create your account</h1>
        <p className="mt-1 text-muted-foreground">Free forever. Set up in under a minute.</p>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-gradient-sunset">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create account
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have one? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
