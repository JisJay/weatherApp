import axios from "axios";

export interface AuthResponse {
  token: string;
  user: { id: string; name: string; email: string };
}

export class AuthError extends Error {
  constructor(message: string, public readonly code: "INVALID_CREDENTIALS" | "EMAIL_TAKEN" | "NETWORK" | "UNKNOWN") {
    super(message);
    this.name = "AuthError";
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await axios.post<AuthResponse>("/api/auth/login", { email, password });
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      if (status === 401) throw new AuthError("Invalid email or password.", "INVALID_CREDENTIALS");
      if (!err.response) throw new AuthError("Network error. Check your connection.", "NETWORK");
    }
    throw new AuthError("An unexpected error occurred.", "UNKNOWN");
  }
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await axios.post<AuthResponse>("/api/auth/register", { name, email, password });
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      if (status === 409) throw new AuthError("An account with this email already exists.", "EMAIL_TAKEN");
      if (!err.response) throw new AuthError("Network error. Check your connection.", "NETWORK");
    }
    throw new AuthError("An unexpected error occurred.", "UNKNOWN");
  }
}
