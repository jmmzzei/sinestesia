import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: 'https://jmmzzei.github.io/sinestesia', // Adjust the base if using subdirectories
  optimizeDeps: {
    include: ["pdfjs-dist"], // Ensure it's included in dependency pre-bundling
  },
})

