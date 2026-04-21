import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, PawPrint, Shield, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const { user, isAdmin, signOut, loading } = useAuth(); // ✅ added loading
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any[]>([]);

  // 🔔 FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/notifications",
        { withCredentials: true }
      );
      setNotifications(res.data);
    } catch {
      console.log("Failed to load notifications");
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  // 🔔 MARK AS READ
  const markAsRead = async (id: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${id}`,
        {},
        { withCredentials: true }
      );

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch {
      console.log("Failed to update");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  // ✅ WAIT FOR AUTH (prevents glitch)
  if (loading) {
    return (
      <header className="border-b bg-white h-16 animate-pulse" />
    );
  }

  const navLinks = (
    <>
      <Link to="/" className="text-sm font-medium">Home</Link>
      <Link to="/lost-pets" className="text-sm font-medium">Lost Pets</Link>

      {user && (
        <Link to="/dashboard" className="text-sm font-medium">My Pets</Link>
      )}

      {isAdmin && (
        <Link to="/admin" className="text-sm font-medium">Admin</Link>
      )}
    </>
  );

  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center justify-between px-4 max-w-6xl mx-auto">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <PawPrint /> PawFinder
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex gap-6">
          {navLinks}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex gap-3 items-center">

          {user ? (
            <>
              {/* 🔔 NOTIFICATIONS */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative">
                    <Bell />

                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-64">
                  {notifications.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <DropdownMenuItem
                        key={n._id}
                        onClick={() => markAsRead(n._id)}
                        className={`text-sm ${!n.read ? "font-semibold" : ""}`}
                      >
                        {n.message}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 👤 USER MENU */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    {user.email?.split("@")[0]}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 📱 MOBILE MENU */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="md:hidden">
                    <Menu />
                  </Button>
                </SheetTrigger>

                <SheetContent>
                  <div className="flex flex-col gap-4 mt-6">
                    {navLinks}
                    <Button onClick={handleSignOut}>Logout</Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">Login</Link>
              </Button>

              <Button asChild>
                <Link to="/signup">Signup</Link>
              </Button>
            </>
          )}

        </div>
      </div>
    </header>
  );
}