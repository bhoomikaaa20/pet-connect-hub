import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";

interface AuthCtx {
  user: any;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>; // ✅ ADD THIS
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ NEW FUNCTION (IMPORTANT)
  const fetchUser = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/auth/verify",
        { withCredentials: true }
      );

      setUser(res.data.user);
      setIsAdmin(res.data.user?.role === "admin");
    } catch {
      setUser(null);
      setIsAdmin(false);
    }
  };

  // ✅ INITIAL LOAD
  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);

  const signOut = async () => {
    await axios.get("http://localhost:5000/api/auth/logout", {
      withCredentials: true,
    });
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signOut, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}