import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { AuthResponse } from "./authApi";

interface Props {
  onAuthenticated: (res: AuthResponse) => void;
}

export default function AuthPage({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center text-blue-500 mb-6">Weather App</h1>
        {mode === "login"
          ? <LoginForm onSuccess={onAuthenticated} onSwitch={() => setMode("register")} />
          : <RegisterForm onSuccess={onAuthenticated} onSwitch={() => setMode("login")} />
        }
      </div>
    </div>
  );
}
