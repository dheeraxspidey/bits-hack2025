import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: 'localhost',
        port: 3106,
        strictPort: true,
        open: true,
        cors: true, // ✅ Enable CORS
        hmr: {
            protocol: 'ws',
            host: 'activity.vnrzone.site',
            port: 3106  // Changed from 3136 to match server port
        },
        allowedHosts: [
            'localhost:3106',
            'activity.vnrzone.site' ,
            'https://stm24wnz-3106.inc1.devtunnels.ms'// ✅ Allow this subdomain
        ],
    },
    preview: {
        port: 4173,
    },
    build: {
        outDir: 'dist',
    },
    define: {
        global: 'window',
    },
});
