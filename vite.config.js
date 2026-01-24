import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": [
            "react-icons",
            "framer-motion",
            "swiper",
            "styled-components",
          ],
          "vendor-utils": [
            "axios",
            "react-toastify",
            "react-hot-toast",
            "react-countup",
            "react-easy-crop",
            "react-modal",
            "react-intersection-observer",
          ],
        },
      },
    },
  },
});
