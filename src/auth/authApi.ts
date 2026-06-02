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
  let response: Response;
  try {
    response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new AuthError("Network error. Check your connection.", "NETWORK");
  }

  if (response.status === 401) throw new AuthError("Invalid email or password.", "INVALID_CREDENTIALS");
  if (!response.ok) throw new AuthError("An unexpected error occurred.", "UNKNOWN");
  return response.json() as Promise<AuthResponse>;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  let response: Response;
  try {
    response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
  } catch {
    throw new AuthError("Network error. Check your connection.", "NETWORK");
  }

  if (response.status === 409) throw new AuthError("An account with this email already exists.", "EMAIL_TAKEN");
  if (!response.ok) throw new AuthError("An unexpected error occurred.", "UNKNOWN");
  return response.json() as Promise<AuthResponse>;
}
