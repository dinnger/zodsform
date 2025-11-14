import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright({
        // ...custom playwright options
      }),
      instances: [
        { browser: 'chromium' },
      ],
      headless: true,
    },
    testTimeout: 30000,
  },
});
