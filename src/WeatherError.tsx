import React from "react";

interface Props {
  message: string;
}

export default function WeatherError({ message }: Props) {
  return <p style={{ color: "red" }}>{message}</p>;
}
