import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        executablePath: '/home/windows/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome',
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          env: {
            LD_LIBRARY_PATH: '/tmp/libasound2-extracted/usr/lib/x86_64-linux-gnu',
          },
        },
      },
    },
  ],
  webServer: {
    command: 'npm run dev -- -p 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
