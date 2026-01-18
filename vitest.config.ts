import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import dotenv from "dotenv";

// Load .env file
dotenv.config();

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData",
        "dist/",
        ".next/",
      ],
    },
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: [
      "node_modules",
      "dist",
      ".next",
      "tests/**.spec.ts",
      "backup/**",
      "web/**",
      "admin/**",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
