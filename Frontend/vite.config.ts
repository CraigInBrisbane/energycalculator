import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const buildDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
const buildNumber = '1';
const version = `${buildDate}.${buildNumber}`;

// https://vite.dev/config/
export default defineConfig({
  base: '/energycalculator/',
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/404.html',
          dest: ''
        }
      ]
    })
  ],
})
