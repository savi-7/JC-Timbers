# E2E Testing with Playwright

## Overview
Comprehensive end-to-end testing suite for JC Timbers e-commerce application using Playwright.

## Test Structure

```
tests/e2e/
├── 01-homepage.spec.js         # Homepage functionality tests
├── 02-products.spec.js         # Product browsing and display tests
├── 03-authentication.spec.js   # Login/Register functionality
├── 04-cart-wishlist.spec.js    # Cart and wishlist operations
├── 05-navigation.spec.js       # Routing and navigation tests
└── 06-accessibility.spec.js    # Accessibility and performance tests
```

## Test Coverage

### ✅ Homepage Tests
- Page loading and rendering
- Navigation menu functionality
- Hero section display
- Footer visibility
- Responsive design (mobile, tablet, desktop)

### ✅ Products Tests
- Timber products display
- Furniture products display
- Construction materials display
- Product cards rendering
- Product details navigation
- Search/Filter functionality

### ✅ Authentication Tests
- Login page display
- Register page display
- Form validation
- Navigation between auth pages
- Forgot password link

### ✅ Cart & Wishlist Tests
- Empty cart display
- Empty wishlist display
- Cart icon visibility
- Navigation to cart/wishlist
- Cart count badge

### ✅ Navigation Tests
- All main pages accessible
- 404 handling
- Browser back/forward buttons
- Scroll position maintenance
- Page load performance

### ✅ Accessibility Tests
- Proper page titles
- Semantic HTML structure
- Console error checking
- Image loading verification
- Responsive design (all viewports)
- Layout stability

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npx playwright test tests/e2e/01-homepage.spec.js
```

### Run Tests in UI Mode (Interactive)
```bash
npm run test:ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:headed
```

### Run Tests in Debug Mode
```bash
npm run test:debug
```

### View Test Report
```bash
npm run test:report
```

## Test Configuration

Configuration file: `playwright.config.js`

**Key Settings:**
- **Base URL:** http://localhost:5173
- **Timeout:** 60 seconds per test
- **Retries:** 0 (2 on CI)
- **Workers:** 1 (parallel execution disabled for safety)
- **Browsers:** Chromium (Desktop Chrome)
- **Screenshots:** On failure only
- **Videos:** On failure only
- **Traces:** On failure only

## Prerequisites

### Before Running Tests:

1. **Backend Server Running**
   ```bash
   cd server
   npm run dev
   ```

2. **Frontend Server Running**
   ```bash
   cd client
   npm run dev
   ```

3. **Database Connected**
   - MongoDB should be running
   - Connection string in `server/.env`

## Test Reports

After running tests, view the HTML report:

```bash
npm run test:report
```

The report includes:
- ✅ Pass/Fail status for each test
- 📸 Screenshots of failures
- 🎥 Videos of test runs
- 📊 Performance metrics
- 🔍 Detailed error traces

## CI/CD Integration

Tests are configured to run in CI environments with:
- Automatic retries on failure
- Parallel execution disabled for stability
- Comprehensive error reporting

## Writing New Tests

### Basic Test Template:

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name Tests', () => {
  test('should do something', async ({ page }) => {
    // Navigate to page
    await page.goto('/your-page');
    await page.waitForLoadState('networkidle');
    
    // Perform actions
    await page.click('button');
    
    // Assert expectations
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Best Practices:

1. **Wait for Network Idle**
   ```javascript
   await page.waitForLoadState('networkidle');
   ```

2. **Use Semantic Selectors**
   ```javascript
   // Good
   page.locator('button').filter({ hasText: 'Submit' })
   
   // Avoid
   page.locator('.btn-class-123')
   ```

3. **Add Descriptive Test Names**
   ```javascript
   test('should display error message when email is invalid', async ({ page }) => {
     // ...
   });
   ```

4. **Keep Tests Independent**
   - Each test should be able to run standalone
   - Don't rely on previous test state
   - Clean up after tests if needed

5. **Use Timeouts Wisely**
   ```javascript
   await expect(element).toBeVisible({ timeout: 10000 });
   ```

## Safety Features

These tests are **safe** and **non-destructive**:
- ✅ Read-only operations (no data modification)
- ✅ No admin account creation
- ✅ No payment processing
- ✅ No database changes
- ✅ No file uploads
- ✅ No email sending

## Troubleshooting

### Tests Failing?

1. **Check Servers Are Running**
   ```bash
   # Backend should be on http://localhost:5001
   # Frontend should be on http://localhost:5173
   ```

2. **Clear Browser Cache**
   ```bash
   npx playwright test --project=chromium --headed
   ```

3. **Check Test Output**
   ```bash
   npm test -- --reporter=list
   ```

4. **View Screenshots/Videos**
   - Located in `test-results/` folder
   - Open HTML report for easy viewing

### Common Issues:

- **Timeout Errors:** Increase timeout in `playwright.config.js`
- **Element Not Found:** Add wait conditions
- **Flaky Tests:** Add explicit waits
- **Port Conflicts:** Change ports in config

## Performance Benchmarks

Expected test execution times:
- Homepage Tests: ~30 seconds
- Products Tests: ~45 seconds
- Authentication Tests: ~20 seconds
- Cart/Wishlist Tests: ~25 seconds
- Navigation Tests: ~40 seconds
- Accessibility Tests: ~50 seconds

**Total Suite:** ~3-4 minutes

## Support

For issues or questions:
- Check Playwright docs: https://playwright.dev/
- Review test output and screenshots
- Enable debug mode for detailed logs

---

**Happy Testing! 🧪✨**


