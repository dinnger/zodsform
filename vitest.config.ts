import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		browser: {
			enabled: true,
			provider: playwright({
				// ...custom playwright options
			}),
			instances: [{ browser: 'chromium' }],
			headless: true
		},
		testTimeout: 30000
	}
})
