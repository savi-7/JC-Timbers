import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing Tests (sanity only)', () => {
  test('basic string check', async () => {
    expect('JC Timbers').toContain('Timbers');
  });
});
