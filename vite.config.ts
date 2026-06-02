import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    coverage: {
      provider: "v8",
      include: ["src/auth/**"],
      exclude: ["src/auth/__tests__/**"],
      thresholds: { lines: 96, functions: 96, branches: 96, statements: 96 },
    },
  },
});
