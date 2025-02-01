import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000, // CRA와 동일한 포트 유지
    },
    build: {
        outDir: 'build', // CRA와 동일한 빌드 폴더 유지
    },
});
