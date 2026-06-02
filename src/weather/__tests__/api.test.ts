import { describe, it, expect, afterEach, vi } from "vitest";
import { fetchWeather, WeatherError } from "../api";
import { WeatherData } from "../main";

const mockWeatherData: WeatherData = {
  name: "London",
  main: { temp: 15, feels_like: 13, humidity: 80 },
  weather: [{ description: "cloudy", icon: "04d" }],
  wind: { speed: 5 },
};

function mockFetch(status: number, body: unknown): void {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

function mockFetchNetworkError(): void {
  global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
}

afterEach(() => vi.resetAllMocks());

describe("fetchWeather", () => {
  it("returns WeatherData on success", async () => {
    mockFetch(200, mockWeatherData);
    const result = await fetchWeather("London");
    expect(result).toEqual(mockWeatherData);
  });

  it("calls the correct URL with city and params", async () => {
    mockFetch(200, mockWeatherData);
    await fetchWeather("Tokyo");
    const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(url).toContain("q=Tokyo");
    expect(url).toContain("units=metric");
  });

  it("throws WeatherError NOT_FOUND on 404", async () => {
    mockFetch(404, {});
    await expect(fetchWeather("Atlantis")).rejects.toMatchObject({
      name: "WeatherError",
      code: "NOT_FOUND",
      message: 'City "Atlantis" not found.',
    });
  });

  it("throws WeatherError UNAUTHORIZED on 401", async () => {
    mockFetch(401, {});
    await expect(fetchWeather("London")).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      message: "Invalid API key.",
    });
  });

  it("throws WeatherError RATE_LIMITED on 429", async () => {
    mockFetch(429, {});
    await expect(fetchWeather("London")).rejects.toMatchObject({
      code: "RATE_LIMITED",
      message: "Rate limit exceeded. Try again shortly.",
    });
  });

  it("throws WeatherError UNKNOWN on other non-ok status", async () => {
    mockFetch(500, {});
    await expect(fetchWeather("London")).rejects.toMatchObject({ code: "UNKNOWN" });
  });

  it("throws WeatherError NETWORK on network failure", async () => {
    mockFetchNetworkError();
    await expect(fetchWeather("London")).rejects.toMatchObject({
      code: "NETWORK",
      message: "Network error. Check your connection.",
    });
  });

  it("re-throws AbortError when request is cancelled", async () => {
    const abortError = new DOMException("Aborted", "AbortError");
    global.fetch = vi.fn().mockRejectedValue(abortError);
    await expect(fetchWeather("London")).rejects.toBeInstanceOf(DOMException);
  });

  it("passes signal to fetch", async () => {
    mockFetch(200, mockWeatherData);
    const controller = new AbortController();
    await fetchWeather("London", controller.signal);
    const options = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(options.signal).toBe(controller.signal);
  });
});
