import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5174, // Change port to 5174
  },
  plugins: [react()]
})
