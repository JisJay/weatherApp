import React, { useRef, useState } from "react";
import { fetchWeather, WeatherError as ApiError } from "./weather/api";
import { WeatherData } from "./weather/main";
import { SUPPORTED_CITIES } from "./weather/cities";
import WeatherCard from "./WeatherCard";
import WeatherCardSkeleton from "./WeatherCardSkeleton";
import WeatherError from "./WeatherError";
import AuthPage from "./auth/AuthPage";
import { AuthResponse } from "./auth/authApi";
import { colors, font, spacing } from "./styles/theme";

export default function App() {
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

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
      if (err instanceof ApiError) {
        setError(err.message);
      }
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: `${spacing.xl}px auto`, fontFamily: font.family, padding: `0 ${spacing.md}px` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs }}>
        <h1 style={{ margin: 0 }}>Weather App</h1>
        <button
          onClick={() => setUser(null)}
          style={{ background: "none", border: "none", color: colors.primary, cursor: "pointer", fontSize: font.sizeSm }}
        >
          Sign out ({user.name})
        </button>
      </div>
      <p style={{ color: colors.muted, marginBottom: spacing.lg }}>
        Supports {SUPPORTED_CITIES.length} cities — click one or type your own.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Enter city name"
          style={{ flex: 1, padding: 8, fontSize: 16 }}
        />
        <button onClick={() => handleSearch()} disabled={loading} style={{ padding: "8px 16px" }}>
          {loading ? "..." : "Search"}
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {SUPPORTED_CITIES.map((c) => (
          <button
            key={c}
            onClick={() => handleSearch(c)}
            style={{
              padding: "4px 12px",
              borderRadius: 16,
              border: "1px solid #ccc",
              background: city === c ? "#0070f3" : "#f0f0f0",
              color: city === c ? "#fff" : "#333",
              cursor: "pointer",
              fontSize: 13,
            }}
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
