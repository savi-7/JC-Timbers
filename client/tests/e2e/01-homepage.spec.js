import { test, expect } from '@playwright/test';

test.describe('Homepage Tests (sanity only)', () => {
  test('basic truthy check', async () => {
    expect(1).toBe(1);
  });
});
