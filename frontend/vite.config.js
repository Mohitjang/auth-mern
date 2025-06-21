import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Correct: Tailwind works via PostCSS, no need to import it here
export default defineConfig({
  plugins: [react()],
});
