import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils";

interface User {
  id: number;
  username: string;
  name: string;
  isActive: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Initialize loading as true
  const navigate = useNavigate();

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/api/auth/validate");
        setUser(response.data as User);
        setIsAuthenticated(true);
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
        console.error("Check auth error:", error);
      } finally {
        setLoading(false); // Set loading to false after auth check completes
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true); // Set loading to true when login starts
    try {
      const response = await api.post("/api/auth/login", {
        username,
        password,
      });

      setUser(response.data as User);
      setIsAuthenticated(true);
      navigate("/posts");
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string, name: string) => {
    setLoading(true);
    try {
      // Register the user
      const response = await api.post("/api/auth/register", {
        username,
        password,
        name,
      });

      setUser(response.data as User);
      setIsAuthenticated(true);
      navigate("/posts");
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post("/api/auth/logout", {});
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      navigate("/login");
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
