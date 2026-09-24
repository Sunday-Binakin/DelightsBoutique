import { defineConfig } from "vitest/config";
import path from "node:path";

const rootDir = import.meta.dirname;

// Node 22+'s native --experimental-webstorage global localStorage shadows
// jsdom's own (complete) implementation and, without a --localstorage-file
// path, exposes none of the real Storage methods. Disabling it lets jsdom
// provide the working one instead — set before workers spawn so they inherit it.
process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS ?? ""} --no-experimental-webstorage`.trim();

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
});
