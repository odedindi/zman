import { test, expect } from '@playwright/test';

test.describe('Week View Navigation', () => {
  test('week view loads without "Invalid time value" error', async ({ page }) => {
    const today = new Date();
    const year = today.getFullYear();
    const week = getISOWeek(today);
    const weekStr = `${year}-W${String(week).padStart(2, '0')}`;
    
    await page.goto(`/en/calendar/week/${weekStr}`);
    await expect(page.locator('main')).toBeVisible({ timeout: 30000 });
  });

  test('week view shows week label correctly', async ({ page }) => {
    const today = new Date();
    const year = today.getFullYear();
    const week = getISOWeek(today);
    const weekStr = `${year}-W${String(week).padStart(2, '0')}`;
    
    await page.goto(`/en/calendar/week/${weekStr}`);
    const weekStart = getISOWeekStart(today);
    const expectedLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    await expect(page.getByText(expectedLabel)).toBeVisible({ timeout: 30000 });
  });
});

test.describe('Week View Navigation with Entity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/kids');
    await page.getByRole('button', { name: /create first kid|add new kid/i }).first().click();
    await page.getByLabel(/name/i).fill('Test Kid');
    await page.getByRole('button', { name: /save/i }).first().click();
    await expect(page.getByText('Test Kid')).toBeVisible();
  });

  test('previous week link navigates correctly', async ({ page }) => {
    const today = new Date();
    const year = today.getFullYear();
    const week = getISOWeek(today);
    const weekStr = `${year}-W${String(week).padStart(2, '0')}`;
    
    await page.goto(`/en/calendar/week/${weekStr}`);
    await page.getByRole('link', { name: /previous/i }).click();
    
    const prevWeek = getISOWeek(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
    const prevYear = getISOWeekYear(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
    const expectedUrl = `/en/calendar/week/${prevYear}-W${String(prevWeek).padStart(2, '0')}`;
    await expect(page).toHaveURL(new RegExp(expectedUrl), { timeout: 30000 });
  });

  test('next week link navigates correctly', async ({ page }) => {
    const today = new Date();
    const year = today.getFullYear();
    const week = getISOWeek(today);
    const weekStr = `${year}-W${String(week).padStart(2, '0')}`;
    
    await page.goto(`/en/calendar/week/${weekStr}`);
    await page.getByRole('link', { name: /next/i }).click();
    
    const nextWeek = getISOWeek(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000));
    const nextYear = getISOWeekYear(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000));
    const expectedUrl = `/en/calendar/week/${nextYear}-W${String(nextWeek).padStart(2, '0')}`;
    await expect(page).toHaveURL(new RegExp(expectedUrl), { timeout: 30000 });
  });

  test('today link navigates to current week', async ({ page }) => {
    const today = new Date();
    const year = today.getFullYear();
    const week = getISOWeek(today);
    const weekStr = `${year}-W${String(week).padStart(2, '0')}`;
    
    await page.goto(`/en/calendar/week/${weekStr}`);
    await page.getByRole('link', { name: /today/i }).click();
    
    const currentYear = getISOWeekYear(new Date());
    const currentWeek = getISOWeek(new Date());
    const expectedUrl = `/en/calendar/week/${currentYear}-W${String(currentWeek).padStart(2, '0')}`;
    await expect(page).toHaveURL(new RegExp(expectedUrl), { timeout: 30000 });
  });

  test('navigation tabs work - day/week/month/semester', async ({ page }) => {
    const today = new Date();
    const year = today.getFullYear();
    const week = getISOWeek(today);
    const weekStr = `${year}-W${String(week).padStart(2, '0')}`;
    
    await page.goto(`/en/calendar/week/${weekStr}`);
    
    await page.getByRole('link', { name: /day/i }).click();
    await expect(page).toHaveURL(/\/en\/calendar\/day\//, { timeout: 30000 });
    
    await page.goto(`/en/calendar/week/${weekStr}`);
    await page.getByRole('link', { name: /month/i }).click();
    await expect(page).toHaveURL(/\/en\/calendar\/month\//, { timeout: 30000 });
    
    await page.goto(`/en/calendar/week/${weekStr}`);
    await page.getByRole('link', { name: /semester/i }).click();
    await expect(page).toHaveURL(/\/en\/calendar\/semester/, { timeout: 30000 });
  });
});

test.describe('Week View with Edge Cases', () => {
  test('week view handles year boundary (week 1 of new year)', async ({ page }) => {
    const nextYear = new Date().getFullYear() + 1;
    const weekStr = `${nextYear}-W01`;
    
    await page.goto(`/en/calendar/week/${weekStr}`);
    await expect(page.locator('main')).toBeVisible({ timeout: 30000 });
  });

  test('back to home link works from week view', async ({ page }) => {
    const today = new Date();
    const year = today.getFullYear();
    const week = getISOWeek(today);
    const weekStr = `${year}-W${String(week).padStart(2, '0')}`;
    
    await page.goto(`/en/calendar/week/${weekStr}`);
    await page.getByRole('link', { name: /back to home/i }).click();
    await expect(page).toHaveURL(/\/en$/, { timeout: 30000 });
  });
});

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getISOWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  return d.getUTCFullYear();
}

function getISOWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
}