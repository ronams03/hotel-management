import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import {
  RoleName, Module, Action,
  checkPermission, canAccessModule, PERMISSIONS, RolePermissions,
} from "../config/rbac";

export interface AuthUser {
  name: string;
  role: RoleName;
  email: string;
  avatar: string; // initials
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  permissions: RolePermissions | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (module: Module, action: Action) => boolean;
  canAccess: (module: Module) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo credentials
const DEMO_CREDENTIALS: Array<{ email: string; password: string; name: string; role: RoleName }> = [
  { email: "admin@hotel.com",   password: "admin123",   name: "Admin User",      role: "Super Admin"  },
  { email: "manager@hotel.com", password: "manager123", name: "Alice Thompson",  role: "Manager"      },
  { email: "staff@hotel.com",   password: "staff123",   name: "Eve Clark",       role: "Receptionist" },
];

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    const found = DEMO_CREDENTIALS.find(
      c => c.email.toLowerCase() === email.toLowerCase() && c.password === password
    );
    if (found) {
      setUser({
        name:   found.name,
        role:   found.role,
        email:  found.email,
        avatar: getInitials(found.name),
      });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const hasPermission = useCallback(
    (module: Module, action: Action): boolean => {
      if (!user) return false;
      return checkPermission(user.role, module, action);
    },
    [user]
  );

  const canAccess = useCallback(
    (module: Module): boolean => {
      if (!user) return false;
      return canAccessModule(user.role, module);
    },
    [user]
  );

  const permissions = user ? PERMISSIONS[user.role] : null;

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      user,
      permissions,
      login,
      logout,
      hasPermission,
      canAccess,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
