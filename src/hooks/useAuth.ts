import { useState, useCallback } from "react";
import { authApi } from "@/lib/api/client";

interface AuthResult {
  success: boolean;
  user?: { id: string; email: string; name: string; role: string };
  accessToken?: string;
  error?: string;
}

export function useAuth(role: "employer" | "candidate") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      setLoading(true);
      setError(null);
      try {
        const apiRole = role === "employer" ? "EMPLOYER" : "CANDIDATE";
        const res = await authApi.login(email, password, apiRole);
        return {
          success: true,
          user: res.user,
          accessToken: res.accessToken,
        };
      } catch (err: any) {
        const msg = err.response?.data?.error || "Login failed. Please try again.";
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [role]
  );

  const register = useCallback(
    async (email: string, password: string, name: string): Promise<AuthResult> => {
      setLoading(true);
      setError(null);
      try {
        const res = await authApi.register(email, password, name);
        return {
          success: true,
          user: res.user,
          accessToken: res.accessToken,
        };
      } catch (err: any) {
        const msg = err.response?.data?.error || "Registration failed. Please try again.";
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return { login, register, loading, error, clearError };
}
