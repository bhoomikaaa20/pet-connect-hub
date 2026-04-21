import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";

interface AuthCtx {
  user: any;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/auth/verify", { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
        setIsAdmin(res.data.user?.role === "admin");
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      });
  }, []);

  const signOut = async () => {
    await axios.get("http://localhost:8080/api/auth/logout", {
      withCredentials: true,
    });
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}