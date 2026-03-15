import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Reduce memory usage during build
    minify: "esbuild",
    target: "esnext",
    // Split chunks to reduce memory pressure
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "three-stdlib"],
          "react-three": [
            "@react-three/fiber",
            "@react-three/drei",
            "@react-three/postprocessing",
          ],
          physics: ["@react-three/cannon", "@react-three/rapier"],
          gsap: ["gsap", "gsap-trial", "@gsap/react"],
          vendor: ["react", "react-dom"],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 2000,
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "gsap",
      "react",
      "react-dom",
    ],
  },
});
