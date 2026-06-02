import React from "react";

interface Props {
  message: string;
}

export default function WeatherError({ message }: Props) {
  return <p className="text-red-500 dark:text-red-400 mt-2">{message}</p>;
}
