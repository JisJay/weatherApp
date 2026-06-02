export interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

export function formatWeather(data: WeatherData): string {
  const { name, main, weather, wind } = data;
  return `${name}: ${weather[0].description}, ${main.temp}°C (feels like ${main.feels_like}°C), humidity ${main.humidity}%, wind ${wind.speed} m/s`;
}
