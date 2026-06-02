import React, { useState } from "react";
import { login, AuthError, AuthResponse } from "./authApi";
import { colors, spacing, radii, font } from "../styles/theme";

interface Props {
  onSuccess: (res: AuthResponse) => void;
  onSwitch: () => void;
}

export default function LoginForm({ onSuccess, onSwitch }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      onSuccess(res);
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>Sign in</h2>

      {error && <p style={styles.error}>{error}</p>}

      <label style={styles.label}>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={styles.input}
        placeholder="you@example.com"
      />

      <label style={styles.label}>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={styles.input}
        placeholder="••••••••"
      />

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <p style={styles.switch}>
        Don't have an account?{" "}
        <span onClick={onSwitch} style={styles.link}>Register</span>
      </p>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: "flex", flexDirection: "column", gap: spacing.sm },
  title: { margin: `0 0 ${spacing.md}px`, color: colors.text },
  error: { color: colors.error, margin: 0 },
  label: { fontSize: font.sizeSm, color: colors.muted },
  input: {
    padding: spacing.sm,
    fontSize: font.sizeMd,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.sm,
  },
  button: {
    marginTop: spacing.xs,
    padding: `${spacing.sm}px ${spacing.md}px`,
    background: colors.primary,
    color: colors.primaryText,
    border: "none",
    borderRadius: radii.sm,
    fontSize: font.sizeMd,
    cursor: "pointer",
  },
  switch: { margin: `${spacing.sm}px 0 0`, fontSize: font.sizeSm, color: colors.muted },
  link: { color: colors.primary, cursor: "pointer" },
};
