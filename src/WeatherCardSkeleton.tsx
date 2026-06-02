import React from "react";

export default function WeatherCardSkeleton() {
  return (
    <div className="mt-2 p-4 border border-gray-100 rounded-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="h-4 rounded bg-gray-200 dark:bg-gray-600 animate-pulse" style={{ width: 200 }} />
      <div className="h-12 w-12 rounded-full mt-3 bg-gray-200 dark:bg-gray-600 animate-pulse" />
    </div>
  );
}
