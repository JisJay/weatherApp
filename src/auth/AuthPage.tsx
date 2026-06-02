import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { AuthResponse } from "./authApi";
import { colors, spacing, radii } from "../styles/theme";

interface Props {
  onAuthenticated: (res: AuthResponse) => void;
}

export default function AuthPage({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.brand}>Weather App</h1>
        {mode === "login"
          ? <LoginForm onSuccess={onAuthenticated} onSwitch={() => setMode("register")} />
          : <RegisterForm onSuccess={onAuthenticated} onSwitch={() => setMode("login")} />
        }
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: colors.background,
  },
  card: {
    background: "#fff",
    padding: spacing.lg,
    borderRadius: radii.md,
    border: `1px solid ${colors.borderLight}`,
    width: "100%",
    maxWidth: 400,
  },
  brand: {
    margin: `0 0 ${spacing.lg}px`,
    color: colors.primary,
    textAlign: "center",
  },
};
