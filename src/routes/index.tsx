import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Heart, PawPrint, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroPets from "@/assets/hero-pets.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PawFinder — Reunite Lost Pets with Their Families" },
      { name: "description", content: "Add your pets, report them lost in one tap, and get the community's help bringing them home." },
      { property: "og:title", content: "PawFinder — Reunite Lost Pets with Their Families" },
      { property: "og:description", content: "Centralised lost pet reporting and recovery platform." },
      { property: "og:image", content: heroPets },
      { name: "twitter:image", content: heroPets },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-warm opacity-60" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <PawPrint className="h-3.5 w-3.5 text-primary" />
              Trusted by pet families everywhere
            </span>
            <h1 className="text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl md:text-6xl">
              Bring them
              <span className="block bg-gradient-sunset bg-clip-text text-transparent">home, safely.</span>
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Manage every pet's profile, report lost ones in seconds, and let the community help you find them — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-sunset shadow-warm hover:opacity-95">
                <Link to="/signup">Get started — free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/lost-pets">Browse lost pets</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-sunset opacity-20 blur-2xl" aria-hidden />
            <img
              src={heroPets}
              alt="Happy dog and cat illustration"
              width={1280}
              height={896}
              className="relative rounded-3xl shadow-warm"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Everything you need, nothing you don't</h2>
          <p className="mt-3 text-muted-foreground">Built for the moments that matter most.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: PawPrint, title: "Pet profiles", desc: "Photos, breed, description — keep it all organized." },
            { icon: Bell, title: "Instant reporting", desc: "One tap to mark lost. Notifications keep you updated." },
            { icon: Search, title: "Community search", desc: "Anyone can browse lost pets and help recover them." },
            { icon: ShieldCheck, title: "Private by default", desc: "Only lost pets are public. Your data stays yours." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-sunset text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl bg-gradient-sunset p-10 text-center text-primary-foreground shadow-warm md:p-16">
          <Heart className="mx-auto mb-4 h-10 w-10" />
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Every pet deserves a way home</h2>
          <p className="mt-3 text-primary-foreground/90">Join PawFinder and be ready before you ever need to be.</p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link to="/signup">Create your free account</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
