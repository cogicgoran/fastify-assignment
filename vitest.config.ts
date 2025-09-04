import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@src": resolve(__dirname, "./src"),
      "@database": resolve(__dirname, "./src/database"),
    },
  },
});
