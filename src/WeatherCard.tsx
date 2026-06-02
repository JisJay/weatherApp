import React from "react";
import { WeatherData, formatWeather } from "./weather/main";

interface Props {
  data: WeatherData;
}

export default function WeatherCard({ data }: Props) {
  return (
    <div className="mt-2 p-4 border border-gray-100 rounded-lg">
      <p className="m-0">{formatWeather(data)}</p>
      <img
        src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
        alt={data.weather[0].description}
      />
    </div>
  );
}
