import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads with correct title and styling', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveTitle(/zman/);

    await expect(page.getByRole('heading', { level: 1 })).toContainText('zman');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Family Schedule');

    const getStarted = page.getByRole('link', { name: /get started/i });
    await expect(getStarted).toBeVisible();
    await expect(getStarted).toHaveAttribute('href', /\/en\/kids/);

    const viewDemo = page.getByRole('link', { name: /view demo/i });
    await expect(viewDemo).toBeVisible();
    await expect(viewDemo).toHaveAttribute('href', /\/en\/calendar\/week/);
  });

  test('has working navigation links', async ({ page }) => {
    await page.goto('/en');

    const kidsLink = page.getByRole('link', { name: /^kids$/i });
    await expect(kidsLink).toBeVisible();
    await expect(kidsLink).toHaveAttribute('href', /\/en\/kids/);

    const settingsLink = page.getByRole('link', { name: /^settings$/i });
    await expect(settingsLink).toBeVisible();
    await expect(settingsLink).toHaveAttribute('href', /\/en\/settings/);
  });

  test('features section displays all 6 features', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { name: 'Features' })).toBeVisible();
    const featureCards = page.locator('article');
    await expect(featureCards).toHaveCount(6);
  });

  test('how it works section shows 3 steps', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { name: 'How It Works' })).toBeVisible();
    await expect(page.getByText('1', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('2', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('3', { exact: true }).first()).toBeVisible();
  });

  test('CTA "Get Started" navigates to kids page', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: /get started/i }).click();
    await expect(page).toHaveURL(/\/en\/kids/);
  });

  test('CTA "View Demo" navigates to week calendar', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: /view demo/i }).click();
    await expect(page).toHaveURL(/\/en\/calendar\/week/);
  });

  test('navigation link "Kids" goes to kids page', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: /^kids$/i }).click();
    await expect(page).toHaveURL(/\/en\/kids/);
  });

  test('navigation link "Settings" goes to settings page', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: /^settings$/i }).click();
    await expect(page).toHaveURL(/\/en\/settings/);
  });
});
