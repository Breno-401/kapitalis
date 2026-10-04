import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // The default 12-fork pool exhausts this Windows host's memory.
    maxWorkers: 1,
    // Transform the official React hook in tests so its engine dependency can
    // be stubbed while exercising the real hook's mount/reInit/destroy lifecycle.
    server: { deps: { inline: ['embla-carousel-react'] } },
  },
})
