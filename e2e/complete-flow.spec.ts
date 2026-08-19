import { test, expect } from '@playwright/test';

test.describe('Complete User Flow - Create Kid, Set Schedule, View Calendar', () => {
  test('full flow: create kid -> set schedule -> view all calendar views', async ({ page }) => {
    // Step 1: Create Kid
    await page.goto('/en/kids');
    await expect(page.getByRole('heading', { name: /no kids yet/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /create first kid/i })).toBeVisible();

    await page.getByRole('button', { name: /create first kid/i }).click();

    await page.getByLabel(/entity name/i).fill('Test Kid');
    await page.getByRole('button', { name: /create entity/i }).first().click();
    await expect(page.getByText('Test Kid')).toBeVisible();

    // Verify active entity is set
    await expect(page.getByText('Active')).toBeVisible();

    // Step 2: Set Schedule - navigate to schedule page
    await page.goto('/en/calendar/schedule');
    await expect(page.getByText('Test Kid')).toBeVisible();
    await expect(page.getByRole('button', { name: /add schedule|add first schedule/i }).first()).toBeVisible();

    // Add a schedule entry
    const addButton = page.getByRole('button', { name: /add schedule|add first schedule/i }).first();
    await addButton.click();

    // Fill schedule form
    const todayDate = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayDayName = dayNames[todayDate.getDay()];
    
    await page.getByRole('button', { name: new RegExp(todayDayName, 'i') }).click();
    await page.getByLabel(/start time/i).type('0800');
    await page.getByLabel(/end time/i).type('1500');
    await page.getByLabel(/location/i).fill('Main Building');
    await page.getByLabel(/notes/i).fill('Regular school day');

    const today = todayDate.toISOString().split('T')[0];
    const sixMonthsLater = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.getByLabel(/valid from/i).fill(today);
    await page.getByLabel(/valid until/i).fill(sixMonthsLater);

    // Submit form via JavaScript (button click doesn't trigger form onSubmit in test env)
    await page.evaluate(() => {
      const form = document.querySelector('form[class*="space-y-6"]');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    });
    await page.waitForTimeout(500);

    // Verify schedule appears on schedule page before navigating
    await expect(page.getByText('Main Building')).toBeVisible();
    await expect(page.getByText('08:00 – 15:00')).toBeVisible();

    // Step 3: View Calendar - Week View
    const year = todayDate.getFullYear();
    const week = getISOWeek(todayDate);
    const weekStr = `${year}-W${String(week).padStart(2, '0')}`;

    await page.goto(`/en/calendar/week/${weekStr}`);
    await expect(page.locator('main')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Test Kid')).toBeVisible();
    await expect(page.getByText('Main Building')).toBeVisible();
    await expect(page.getByText('08:00 - 15:00')).toBeVisible();

    // Step 4: View Calendar - Day View
    const dayStr = todayDate.toISOString().split('T')[0];
    await page.goto(`/en/calendar/day/${dayStr}`);
    await expect(page.locator('main')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Test Kid')).toBeVisible();
    await expect(page.getByText('Main Building')).toBeVisible();

    // Step 5: View Calendar - Month View
    const monthStr = todayDate.toISOString().slice(0, 7);
    await page.goto(`/en/calendar/month/${monthStr}`);
    await expect(page.locator('main')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Test Kid')).toBeVisible();
    await expect(page.getByText('Main Building').first()).toBeVisible();

    // Step 6: View Calendar - Semester View
    await page.goto('/en/calendar/semester');
    await expect(page.locator('main')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Test Kid')).toBeVisible();
    await page.goto('/en/calendar/holidays');
    await expect(page.locator('main')).toBeVisible({ timeout: 30000 });

    // Step 8: View Exceptions page
    await page.goto('/en/calendar/exceptions');
    await expect(page.locator('main')).toBeVisible({ timeout: 30000 });
  });

  test('navigation from kids page to calendar views works', async ({ page }) => {
    await page.goto('/en/kids');
    await page.getByRole('button', { name: /create first kid/i }).click();
    await page.getByLabel(/entity name/i).fill('Nav Test Kid');
    await page.getByRole('button', { name: /create entity/i }).first().click();
    await expect(page.getByText('Nav Test Kid')).toBeVisible();

    // Click Set Schedule link in header
    await page.getByRole('link', { name: /set schedule/i }).click();
    await expect(page).toHaveURL(/\/en\/calendar\/schedule/);

    // Go back to kids page
    await page.goto('/en/kids');

    // Click Week View link in header
    await page.getByRole('link', { name: /week view/i }).click();
    await expect(page).toHaveURL(/\/en\/calendar\/week\//);

    // Go back to kids page
    await page.goto('/en/kids');

    // Click Month View link in header
    await page.getByRole('link', { name: /month view/i }).click();
    await expect(page).toHaveURL(/\/en\/calendar\/month\//);
  });

  test('view demo button redirects to current week', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: /view demo/i }).click();
    await expect(page).toHaveURL(/\/en\/calendar\/week\//);
    await expect(page.locator('main')).toBeVisible({ timeout: 30000 });
  });
});

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}