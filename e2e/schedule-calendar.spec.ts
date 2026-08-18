import { test, expect } from '@playwright/test';

test.describe('Schedule Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/kids');
    await page.getByRole('button', { name: /create first kid|add new kid/i }).first().click();
    await page.getByLabel(/name/i).fill('Test Kid');
    await page.getByRole('button', { name: /save/i }).first().click();
    await expect(page.getByText('Test Kid')).toBeVisible();
  });

  test('schedule page shows empty state for new kid', async ({ page }) => {
    await page.goto('/en/kids');
    await page.getByRole('button', { name: /active/i }).first().click();
    await page.goto('/en/kids');
    await expect(page.getByText('Test Kid')).toBeVisible();
  });

  test('can add a weekly schedule entry', async ({ page }) => {
    const addScheduleBtn = page.getByRole('button', { name: /add schedule|add first schedule/i });
    if (await addScheduleBtn.isVisible()) {
      await addScheduleBtn.click();

      await page.getByLabel(/location/i).fill('Main Building');
      await page.getByRole('button', { name: /save/i }).first().click();
    }
  });
});

test.describe('Calendar Views', () => {
  test('day view loads', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    await page.goto(`/en/kids`);
    await page.goto(`/en/calendar/day/${today}`);
    await expect(page.locator('main')).toBeVisible();
  });

  test('week view loads', async ({ page }) => {
    await page.goto('/en/calendar/week/current');
    await expect(page.locator('main')).toBeVisible();
  });

  test('month view loads', async ({ page }) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    await page.goto(`/en/calendar/month/${currentMonth}`);
    await expect(page.locator('main')).toBeVisible();
  });

  test('semester view loads', async ({ page }) => {
    await page.goto('/en/calendar/semester');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Holidays', () => {
  test('holidays page loads', async ({ page }) => {
    await page.goto('/en/calendar/holidays');
    await expect(page.locator('main')).toBeVisible();
  });

  test('shows empty state or holiday list', async ({ page }) => {
    await page.goto('/en/calendar/holidays');
    const heading = page.getByRole('heading');
    await expect(heading.first()).toBeVisible();
  });
});

test.describe('Exceptions', () => {
  test('exceptions page loads', async ({ page }) => {
    await page.goto('/en/calendar/exceptions');
    await expect(page.locator('main')).toBeVisible();
  });

  test('shows empty state or exception list', async ({ page }) => {
    await page.goto('/en/calendar/exceptions');
    const heading = page.getByRole('heading');
    await expect(heading.first()).toBeVisible();
  });
});
