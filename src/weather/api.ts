import axios, { AxiosError } from "axios";
import { WeatherData } from "./main";

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const API_KEY = process.env.REACT_APP_WEATHER_API_KEY ?? "";

export class WeatherError extends Error {
  constructor(message: string, public readonly code: "NOT_FOUND" | "UNAUTHORIZED" | "RATE_LIMITED" | "NETWORK" | "UNKNOWN") {
    super(message);
    this.name = "WeatherError";
  }
}

export async function fetchWeather(city: string, signal?: AbortSignal): Promise<WeatherData> {
  try {
    const response = await axios.get<WeatherData>(BASE_URL, {
      signal,
      params: {
        q: city,
        appid: API_KEY,
        units: "metric",
      },
    });
    return response.data;
  } catch (err) {
    if (axios.isCancel(err)) {
      throw err;
    }

    if (axios.isAxiosError(err)) {
      const status = (err as AxiosError).response?.status;
      if (status === 404) throw new WeatherError(`City "${city}" not found.`, "NOT_FOUND");
      if (status === 401) throw new WeatherError("Invalid API key.", "UNAUTHORIZED");
      if (status === 429) throw new WeatherError("Rate limit exceeded. Try again shortly.", "RATE_LIMITED");
      if (!err.response) throw new WeatherError("Network error. Check your connection.", "NETWORK");
    }

    throw new WeatherError("An unexpected error occurred.", "UNKNOWN");
  }
}
