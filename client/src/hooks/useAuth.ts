import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type User } from "@shared/schema";

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    queryFn: async () => {
      const token = localStorage.getItem("fokushub_token");
      if (!token) return null;

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("fokushub_token");
          return null;
        }

        return response.json();
      } catch (error) {
        localStorage.removeItem("fokushub_token");
        return null;
      }
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpData): Promise<AuthResponse> => {
      try {
        const response = await apiRequest("POST", "/api/auth/signup", data);
        return response.json();
      } catch (error) {
        console.log("SignUp mutation error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      localStorage.setItem("fokushub_token", data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
  });

  const signInMutation = useMutation({
    mutationFn: async (data: SignInData): Promise<AuthResponse> => {
      const response = await apiRequest("POST", "/api/auth/signin", data);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("fokushub_token", data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
  });

  const signOut = () => {
    localStorage.removeItem("fokushub_token");
    queryClient.setQueryData(["/api/auth/me"], null);
    queryClient.clear();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp: signUpMutation.mutateAsync,
    signIn: signInMutation.mutateAsync,
    signOut,
    isSigningUp: signUpMutation.isPending,
    isSigningIn: signInMutation.isPending,
    signUpError: signUpMutation.error,
    signInError: signInMutation.error,
  };
}
