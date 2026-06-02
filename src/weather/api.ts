import { WeatherData } from "./main";

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY ?? "";

export class WeatherError extends Error {
  constructor(message: string, public readonly code: "NOT_FOUND" | "UNAUTHORIZED" | "RATE_LIMITED" | "NETWORK" | "UNKNOWN") {
    super(message);
    this.name = "WeatherError";
  }
}

export async function fetchWeather(city: string, signal?: AbortSignal): Promise<WeatherData> {
  const params = new URLSearchParams({ q: city, appid: API_KEY, units: "metric" });

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}?${params}`, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new WeatherError("Network error. Check your connection.", "NETWORK");
  }

  if (!response.ok) {
    if (response.status === 404) throw new WeatherError(`City "${city}" not found.`, "NOT_FOUND");
    if (response.status === 401) throw new WeatherError("Invalid API key.", "UNAUTHORIZED");
    if (response.status === 429) throw new WeatherError("Rate limit exceeded. Try again shortly.", "RATE_LIMITED");
    throw new WeatherError("An unexpected error occurred.", "UNKNOWN");
  }

  return response.json() as Promise<WeatherData>;
}
