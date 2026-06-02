import React from "react";
import { WeatherData, formatWeather } from "./weather/main";

interface Props {
  data: WeatherData;
}

const CONDITION_EMOJI: Record<string, string> = {
  "01": "☀️", "02": "⛅", "03": "☁️", "04": "☁️",
  "09": "🌧️", "10": "🌦️", "11": "⛈️", "13": "❄️", "50": "🌫️",
};

export default function WeatherCard({ data }: Props) {
  const iconCode = data.weather[0].icon;
  const emoji = CONDITION_EMOJI[iconCode.slice(0, 2)] ?? "🌡️";

  return (
    <div className="mt-2 p-4 border border-gray-100 rounded-lg dark:border-gray-700 dark:bg-gray-800">
      <p className="m-0">{formatWeather(data)}</p>
      <span style={{ fontSize: 48 }}>{emoji}</span>
    </div>
  );
}
