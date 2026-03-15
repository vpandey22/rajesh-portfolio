import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "three-stdlib"],
          r3f: ["@react-three/fiber", "@react-three/drei", "@react-three/postprocessing"],
          physics: ["@react-three/rapier", "@react-three/cannon"],
          gsap: ["gsap", "gsap-trial"],
        },
      },
    },
    chunkSizeWarningLimit: 2000,
  },
  optimizeDeps: {
    include: ["three", "gsap", "gsap-trial"],
  },
});
