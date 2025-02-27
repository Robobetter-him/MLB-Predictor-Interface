import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    // Make environment variables available to the client
    'process.env.RAPIDAPI_KEY': JSON.stringify(process.env.RAPIDAPI_KEY),
    'process.env.MLB_API_KEY': JSON.stringify(process.env.MLB_API_KEY),
    'process.env.WEATHER_API_KEY': JSON.stringify(process.env.WEATHER_API_KEY)
  }
});