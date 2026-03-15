import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",
    minify: false,
    sourcemap: false,
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@react-three/rapier") || id.includes("@dimforge/rapier3d")) {
            return "physics";
          }
          if (id.includes("three") || id.includes("@react-three")) {
            return "three";
          }
          if (id.includes("gsap")) {
            return "gsap";
          }
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ["@react-three/rapier"],
  },
  assetsInclude: ["**/*.wasm"],
});
