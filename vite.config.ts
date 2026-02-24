import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/main.tsx", "src/test/**"],
      thresholds: {
        lines: 80,
        functions: 75,
        statements: 80,
        branches: 75
      }
    }
  }
});
