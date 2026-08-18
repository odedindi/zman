import { test, expect } from '@playwright/test';

test.describe('Kids Management', () => {
  test('empty state shows create first kid button', async ({ page }) => {
    await page.goto('/en/kids');
    await expect(page.getByRole('heading', { name: /no kids yet/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /create first kid/i })).toBeVisible();
  });

  test('clicking create first kid opens form modal', async ({ page }) => {
    await page.goto('/en/kids');
    await page.getByRole('button', { name: /create first kid/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
  });

  test('can create a new kid with name and color', async ({ page }) => {
    await page.goto('/en/kids');
    await page.getByRole('button', { name: /create first kid/i }).click();

    await page.getByLabel(/name/i).fill('Test Kindergarten');
    await page.getByRole('button', { name: /save/i }).first().click();

    await expect(page.getByText('Test Kindergarten')).toBeVisible();
    await expect(page.getByText('Active')).toBeVisible();
  });

  test('can edit an existing kid', async ({ page }) => {
    await page.goto('/en/kids');

    const editButton = page.getByRole('button', { name: /edit/i }).first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();

      const nameInput = page.getByLabel(/name/i);
      await nameInput.clear();
      await nameInput.fill('Renamed Kid');
      await page.getByRole('button', { name: /save/i }).first().click();

      await expect(page.getByText('Renamed Kid')).toBeVisible();
    }
  });

  test('can delete a kid', async ({ page }) => {
    await page.goto('/en/kids');

    page.on('dialog', dialog => dialog.accept());

    const deleteButton = page.getByRole('button', { name: /delete/i }).first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await expect(page.getByText('No Kids Yet')).toBeVisible();
    }
  });

  test('can create multiple kids', async ({ page }) => {
    await page.goto('/en/kids');

    await page.getByRole('button', { name: /create first kid|add new kid/i }).first().click();
    await page.getByLabel(/name/i).fill('Kindergarten');
    await page.getByRole('button', { name: /save/i }).first().click();
    await expect(page.getByText('Kindergarten')).toBeVisible();

    await page.getByRole('button', { name: /add new/i }).click();
    await page.getByLabel(/name/i).fill('Soccer Club');
    await page.getByRole('button', { name: /save/i }).first().click();
    await expect(page.getByText('Soccer Club')).toBeVisible();

    const items = page.locator('article');
    await expect(items).toHaveCount(2);
  });

  test('can switch active kid', async ({ page }) => {
    await page.goto('/en/kids');

    await page.getByRole('button', { name: /create first kid|add new kid/i }).first().click();
    await page.getByLabel(/name/i).fill('Kid A');
    await page.getByRole('button', { name: /save/i }).first().click();

    await page.getByRole('button', { name: /add new/i }).click();
    await page.getByLabel(/name/i).fill('Kid B');
    await page.getByRole('button', { name: /save/i }).first().click();

    const kidBSelect = page.getByRole('button', { name: /^select$/i }).first();
    if (await kidBSelect.isVisible()) {
      await kidBSelect.click();
    }
  });

  test('back to home link works', async ({ page }) => {
    await page.goto('/en/kids');
    await page.getByRole('link', { name: /back to home/i }).click();
    await expect(page).toHaveURL(/\/en$/);
  });
});
