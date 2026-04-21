import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, PawPrint, Shield } from "lucide-react";
import { useState } from "react";
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
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

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

        {/* NAV */}
        <nav className="hidden md:flex gap-6">{navLinks}</nav>

        {/* RIGHT SIDE */}
        <div className="flex gap-2 items-center">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    {user.email?.split("@")[0]}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  {isAdmin && (
                    <DropdownMenuItem>
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

              {/* MOBILE MENU */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost">
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