import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Menu, PawPrint, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [notifs, setNotifs] = useState<{ id: string; message: string; read: boolean; created_at: string }[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id,message,read,created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      setNotifs(data ?? []);
      setUnread((data ?? []).filter((n) => !n.read).length);
    };
    load();

    const channel = supabase
      .channel("notif-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => load())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const navLinks = (
    <>
      <Link to="/" className="text-sm font-medium hover:text-primary transition-colors" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>
        Home
      </Link>
      <Link to="/lost-pets" className="text-sm font-medium hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>
        Lost Pets
      </Link>
      {user && (
        <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>
          My Pets
        </Link>
      )}
      {isAdmin && (
        <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>
          Admin
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-sunset text-primary-foreground shadow-soft">
            <PawPrint className="h-5 w-5" />
          </span>
          <span>PawFinder</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">{navLinks}</nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <DropdownMenu open={open} onOpenChange={(o) => { setOpen(o); if (o) markAllRead(); }}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unread > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-lost px-1 text-[10px] font-bold text-lost-foreground">
                        {unread}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifs.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications yet</div>
                  ) : (
                    notifs.map((n) => (
                      <div key={n.id} className="px-3 py-2 text-sm border-b last:border-0">
                        <p className={n.read ? "text-muted-foreground" : "font-medium"}>{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    {user.email?.split("@")[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAdmin && <DropdownMenuItem><Shield className="mr-2 h-4 w-4" />Admin</DropdownMenuItem>}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <nav className="mt-8 flex flex-col gap-4">{navLinks}</nav>
                  <Button variant="outline" className="mt-6 w-full" onClick={handleSignOut}>
                    Sign out
                  </Button>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-sunset shadow-soft hover:opacity-95">
                <Link to="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
