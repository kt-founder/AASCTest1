import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Cho phép truy cập từ tất cả các địa chỉ IP trong mạng LAN
    port: 3333,       // Cổng bạn muốn chạy Vite, có thể thay đổi nếu cần
  }
});
