import React from "react";

export default function WeatherCardSkeleton() {
  return (
    <div style={{ marginTop: 8, padding: 16, border: "1px solid #eee", borderRadius: 8 }}>
      <div style={bar(200)} />
      <div style={{ ...bar(48), marginTop: 12, borderRadius: 48 }} />
    </div>
  );
}

function bar(width: number): React.CSSProperties {
  return {
    width,
    height: 16,
    borderRadius: 4,
    background: "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
  };
}
