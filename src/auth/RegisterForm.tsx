import React, { useState } from "react";
import { register, AuthError, AuthResponse } from "./authApi";

interface Props {
  onSuccess: (res: AuthResponse) => void;
  onSwitch: () => void;
}

export default function RegisterForm({ onSuccess, onSwitch }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await register(name, email, password);
      onSuccess(res);
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <h2 className="text-xl font-semibold m-0 mb-4 text-gray-800 dark:text-gray-100">Create account</h2>

      {error && <p className="text-red-500 dark:text-red-400 m-0 text-sm">{error}</p>}

      <label className="text-xs text-gray-500 dark:text-gray-400">Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Jane Smith"
        className="px-3 py-2 text-base border border-gray-300 rounded
                   bg-white text-gray-900
                   dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label className="text-xs text-gray-500 dark:text-gray-400">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@example.com"
        className="px-3 py-2 text-base border border-gray-300 rounded
                   bg-white text-gray-900
                   dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label className="text-xs text-gray-500 dark:text-gray-400">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        placeholder="Min. 8 characters"
        className="px-3 py-2 text-base border border-gray-300 rounded
                   bg-white text-gray-900
                   dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-1 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
        <span onClick={onSwitch} className="text-blue-500 cursor-pointer hover:underline">Sign in</span>
      </p>
    </form>
  );
}
