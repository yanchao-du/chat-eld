import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads with Singapore General Election heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Singapore General Election/i })).toBeVisible();
  });

  test('shows navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Check Voter Registration/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Find Your Polling Station/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /How to Vote/i })).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('Voters page loads', async ({ page }) => {
    await page.goto('/voters');
    await expect(page).toHaveURL('/voters');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('FAQ page loads', async ({ page }) => {
    await page.goto('/faq');
    await expect(page).toHaveURL('/faq');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});

test.describe('Chat Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('chat button is visible on homepage', async ({ page }) => {
    await expect(page.getByRole('button', { name: /open chat/i })).toBeVisible();
  });

  test('opens chat panel on button click', async ({ page }) => {
    await page.getByRole('button', { name: /open chat/i }).click();
    await expect(page.getByText('ELD Info Assistant')).toBeVisible();
  });

  test('closes chat panel on X click', async ({ page }) => {
    await page.getByRole('button', { name: /open chat/i }).click();
    await expect(page.getByText('ELD Info Assistant')).toBeVisible();
    await page.getByRole('button', { name: /close chat/i }).click();
    await expect(page.getByText('ELD Info Assistant')).not.toBeVisible();
  });

  test('send button is disabled when input is empty', async ({ page }) => {
    await page.getByRole('button', { name: /open chat/i }).click();
    const sendButton = page.getByRole('button', { name: 'Send' });
    await expect(sendButton).toBeDisabled();
  });

  test('send button is enabled when input has text', async ({ page }) => {
    await page.getByRole('button', { name: /open chat/i }).click();
    await page.getByPlaceholder('Ask about elections...').fill('When is polling day?');
    const sendButton = page.getByRole('button', { name: 'Send' });
    await expect(sendButton).toBeEnabled();
  });

  test('sends message and shows bot reply', async ({ page }) => {
    await page.route('/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reply: 'Polling Day is on 3 May 2025.' }),
      });
    });

    await page.getByRole('button', { name: /open chat/i }).click();
    await page.getByPlaceholder('Ask about elections...').fill('When is polling day?');
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(page.getByText('Polling Day is on 3 May 2025.')).toBeVisible();
  });

  test('shows ELD hotline on API failure', async ({ page }) => {
    await page.route('/api/chat', async (route) => {
      await route.fulfill({ status: 500 });
    });

    await page.getByRole('button', { name: /open chat/i }).click();
    await page.getByPlaceholder('Ask about elections...').fill('test question');
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(page.getByText(/1800-225-5353/)).toBeVisible();
  });

  test('chat button is visible on Voters page', async ({ page }) => {
    await page.goto('/voters');
    await expect(page.getByRole('button', { name: /open chat/i })).toBeVisible();
  });

  test('chat button is visible on FAQ page', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.getByRole('button', { name: /open chat/i })).toBeVisible();
  });
});
