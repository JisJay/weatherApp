import React from "react";
import { WeatherData, formatWeather } from "./weather/main";

interface Props {
  data: WeatherData;
}

export default function WeatherCard({ data }: Props) {
  return (
    <div style={{ marginTop: 8, padding: 16, border: "1px solid #eee", borderRadius: 8 }}>
      <p style={{ margin: 0 }}>{formatWeather(data)}</p>
      <img
        src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
        alt={data.weather[0].description}
      />
    </div>
  );
}
