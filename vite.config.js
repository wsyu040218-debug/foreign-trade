import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GITHUB_PAGES === '1' ? '/foreign-trade/' : '/',
  server: {
    port: 5173,
    open: true,
  },
})
