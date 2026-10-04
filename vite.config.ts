import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { broMarqueeReact } from './build/broMarqueeReact.js'

export default defineConfig({
  plugins: [broMarqueeReact(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // The default 12-fork pool exhausts this Windows host's memory.
    maxWorkers: 1,
  },
})
