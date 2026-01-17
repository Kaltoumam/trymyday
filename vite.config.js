import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        sourcemap: false,
        cssCodeSplit: false,
        chunkSizeWarningLimit: 2000,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom', 'bootstrap']
                }
            }
        }
    }
})
