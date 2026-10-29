import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // In local dev, VITE_API_URL is '/api' → proxy to localhost:8000
  // In production (Cloudflare Pages / Vercel), VITE_API_URL is the full Railway URL
  //   e.g. https://vidya-ai.up.railway.app/api — no proxy needed
  const isExternalApi = env.VITE_API_URL?.startsWith('http');

  return {
    plugins: [react()],
    server: {
      // Only proxy in local dev (when API URL is not an external host)
      ...(isExternalApi ? {} : {
        proxy: {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            secure: false,
          }
        }
      })
    }
  }
})
