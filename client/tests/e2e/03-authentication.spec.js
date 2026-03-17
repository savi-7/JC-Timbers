import { test, expect } from '@playwright/test';

test.describe('Authentication Tests (sanity only)', () => {
  test('basic equality check', async () => {
    expect(2 + 2).toBe(4);
  });
});

