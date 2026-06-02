import React, { useEffect, useRef, useState } from "react";
import { fetchWeather, WeatherError as ApiError } from "./weather/api";
import { WeatherData } from "./weather/main";
import { SUPPORTED_CITIES } from "./weather/cities";
import WeatherCard from "./WeatherCard";
import WeatherCardSkeleton from "./WeatherCardSkeleton";
import WeatherError from "./WeatherError";
import AuthPage from "./auth/AuthPage";
import { AuthResponse } from "./auth/authApi";

export default function App() {
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  if (!user) {
    return <AuthPage onAuthenticated={(res) => setUser(res.user)} />;
  }

  async function handleSearch(searchCity?: string) {
    const target = searchCity ?? city;
    if (!target.trim()) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(target, abortRef.current.signal);
      setWeather(data);
      setCity(target);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-16 px-4 font-sans">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold m-0">Weather App</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark((d) => !d)}
            className="text-xl"
            aria-label="Toggle dark mode"
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <button
            onClick={() => setUser(null)}
            className="text-sm text-blue-500 hover:underline bg-transparent border-none cursor-pointer"
          >
            Sign out ({user.name})
          </button>
        </div>
      </div>

      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Supports {SUPPORTED_CITIES.length} cities — click one or type your own.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Enter city name"
          className="flex-1 px-3 py-2 text-base border border-gray-300 rounded
                     bg-white text-gray-900
                     dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => handleSearch()}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded
                     bg-white text-gray-900 hover:bg-gray-50
                     dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700
                     disabled:opacity-50 cursor-pointer"
        >
          {loading ? "..." : "Search"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {SUPPORTED_CITIES.map((c) => (
          <button
            key={c}
            onClick={() => handleSearch(c)}
            className={`px-3 py-1 rounded-full text-sm border cursor-pointer transition-colors
              ${city === c
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      {error && <WeatherError message={error} />}
      {loading && <WeatherCardSkeleton />}
      {!loading && weather && <WeatherCard data={weather} />}
    </div>
  );
}
