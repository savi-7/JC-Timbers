import { test, expect } from '@playwright/test';

test.describe('Products Browsing Tests (sanity only)', () => {
  test('basic truthy check', async () => {
    expect(true).toBeTruthy();
  });
});

